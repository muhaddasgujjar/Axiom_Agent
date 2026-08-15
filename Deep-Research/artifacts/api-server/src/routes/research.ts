import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db, researchTable, userUsageTable, type ResearchAgent, type ResearchRecent, type ResearchSource } from "@workspace/db";
import {
  DeleteResearchParams,
  DeleteResearchResponse,
  GetResearchParams,
  GetResearchResponse,
  GetUsageResponse,
  GetWorkspaceSummaryResponse,
  GetWorkspaceUsageResponse,
  ListResearchResponse,
  ListSourcesResponse,
  PauseResearchParams,
  PauseResearchResponse,
  PurgeWorkspaceCacheResponse,
  StartResearchBody,
  UpdateResearchBody,
  UpdateResearchParams,
  UpdateResearchResponse,
} from "@workspace/api-zod";
import { checkDailyLimits, DAILY_REPORT_LIMIT } from "../middleware/rateLimit";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const PYTHON_API_URL = (process.env["PYTHON_API_URL"] ?? "http://localhost:8000").replace(/\/+$/, "");
const PYTHON_TIMEOUT_MS = 5000;

function buildPythonUrl(path: string): string {
  const cleaned = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return `${PYTHON_API_URL}/${cleaned}`;
}

const stages = ["planning", "searching", "reading", "synthesizing", "verifying", "formatting", "done"] as const;
type ActiveStage = (typeof stages)[number];

type BackendState = {
  research_id: string;
  query: string;
  user_id: string;
  status: ActiveStage | "failed";
  progress: number;
  sources: Array<{ url: string; title: string; snippet: string }>;
  sources_read: number;
  sources_total: number;
  sub_questions: unknown[];
  verification_score: number;
  claims_checked: number;
  removed_claims_count: number;
  final_report: string;
  final_report_json: string;
  citations: string[];
  summary: string;
  error: string | null;
  duration_seconds: number;
};

const stageMeta: Record<ActiveStage, { progress: number; score: number; sources: number; claims: number; elapsed: number }> = {
  planning: { progress: 8, score: 0, sources: 0, claims: 0, elapsed: 1 },
  searching: { progress: 22, score: 0, sources: 18, claims: 0, elapsed: 3 },
  reading: { progress: 48, score: 62, sources: 34, claims: 42, elapsed: 8 },
  synthesizing: { progress: 65, score: 72, sources: 42, claims: 73, elapsed: 12 },
  verifying: { progress: 82, score: 86, sources: 47, claims: 108, elapsed: 16 },
  formatting: { progress: 94, score: 91, sources: 47, claims: 127, elapsed: 18 },
  done: { progress: 100, score: 92, sources: 47, claims: 127, elapsed: 19 },
};

const sourceSeed: ResearchSource[] = [
  { type: "PAPER", title: "The Geography of Generative AI Innovation", source: "Stanford HAI · 2024", progress: 100 },
  { type: "REPORT", title: "AI Index Report 2024 · Chapter 3", source: "Stanford University", progress: 78 },
  { type: "PAPER", title: "The Economic Potential of Generative AI", source: "McKinsey Global Institute", progress: 64 },
  { type: "BRIEF", title: "The State of AI in 2025", source: "Stanford HAI · 2025", progress: 42 },
];

const researchTimers = new Map<string, ReturnType<typeof setInterval>>();
const pausedStages = new Map<string, ActiveStage>();
let seedPromise: Promise<void> | undefined;

// Strict tenant isolation: every query is scoped to the authenticated user's id
// so a user can only ever see their own research rows.
function userScope(uid: string) {
  return eq(researchTable.userId, uid);
}

async function pythonFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T | null> {
  try {
    const url = buildPythonUrl(path);
    console.log(`[python-proxy] ${init.method ?? "GET"} -> ${url}`);
    const response = await fetch(url, {
      ...init,
      headers: { "content-type": "application/json", ...(init.headers ?? {}) },
      signal: AbortSignal.timeout(PYTHON_TIMEOUT_MS),
    });
    if (!response.ok) {
      logger.warn({ path, status: response.status }, "Python research API returned an error");
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    logger.warn({ path, err: String(error) }, "Python research API is unreachable");
    return null;
  }
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Frontend agent cards per the UI pipeline contract.
// 0 Scout, 1 Reader, 2 Skeptic, 3 Synthesizer, 4 Verifier, 5 Editor
const ACTIVE_AGENTS: Record<string, number[]> = {
  planning: [0],
  searching: [0],
  reading: [1],
  synthesizing: [3],
  verifying: [2, 4],
  formatting: [5],
  done: [],
  failed: [],
  paused: [],
};

const DONE_AGENTS: Record<string, number[]> = {
  planning: [],
  searching: [],
  reading: [0],
  synthesizing: [0, 1],
  verifying: [0, 1, 3],
  formatting: [0, 1, 2, 3, 4],
  done: [0, 1, 2, 3, 4, 5],
  failed: [0, 1, 2, 3, 4, 5],
  paused: [],
};

const AGENT_NAMES = ["Scout", "Reader", "Skeptic", "Synthesizer", "Verifier", "Editor"];

function agentsFromBackend(backend: BackendState): ResearchAgent[] {
  const status = backend.status as string;
  const active = ACTIVE_AGENTS[status] ?? [];
  const done = DONE_AGENTS[status] ?? [];
  const score = Math.round(backend.verification_score * 100);

  const counts: string[] = [
    backend.sources_total > 0 ? `${backend.sources_total} sources` : "Mapping the field",
    backend.sources_total > 0 ? `${backend.sources_read} / ${backend.sources_total}` : "Queued",
    backend.removed_claims_count > 0 ? `${backend.removed_claims_count} flagged` : "Queued",
    status === "synthesizing" ? "In progress" : status === "done" || status === "formatting" ? "Complete" : "Queued",
    backend.claims_checked > 0 || score > 0 ? `${score}% verified` : "Queued",
    status === "done" ? "Brief ready" : status === "formatting" ? "Preparing your brief" : "Queued",
  ];

  return AGENT_NAMES.map((name, index) => ({
    name,
    detail: name === "Scout" ? "Mapping the field" : name === "Reader" ? "Reading full documents" : name === "Skeptic" ? "Testing weak claims" : name === "Synthesizer" ? "Connecting findings" : name === "Verifier" ? "Checking citations" : "Preparing your brief",
    count: counts[index],
    status: done.includes(index) ? ("done" as const) : active.includes(index) ? ("active" as const) : ("queued" as const),
    progress: done.includes(index) ? 100 : active.includes(index) ? Math.max(24, backend.progress) : 0,
  }));
}

function sourcesFromBackend(backend: BackendState): ResearchSource[] {
  const read = backend.sources_read;
  return (backend.sources ?? [])
    .slice(0, 16)
    .map((source, index) => ({
      type: "REPORT",
      title: source.title || source.url,
      source: hostOf(source.url),
      progress: backend.status === "done" ? 100 : index < read ? 100 : 0,
    }));
}

function buildAgents(stage: ActiveStage): ResearchAgent[] {
  const stageIndex = stages.indexOf(stage);
  const names = [
    ["Scout", "Mapping the field", "18 sources", "bg-teal"],
    ["Reader", "Reading full documents", stageIndex >= 2 ? "11 / 16" : "Queued", "bg-lilac"],
    ["Skeptic", "Testing weak claims", stageIndex >= 4 ? "7 flagged" : "Queued", "bg-peach"],
    ["Synthesizer", "Connecting findings", stageIndex >= 3 ? "In progress" : "Queued", "bg-blue"],
    ["Verifier", "Checking citations", stageIndex >= 4 ? `${stageMeta[stage].score}% verified` : "Queued", "bg-green"],
    ["Editor", "Preparing your brief", stageIndex >= 5 ? "Preparing your brief" : "Queued", "bg-sand"],
  ];

  return names.map(([name, detail, count], index) => {
    const done = stage === "done" || index < stageIndex - 1;
    const active = !done && index === Math.min(stageIndex, 5);
    return {
      name,
      detail,
      count,
      status: done ? "done" : active ? "active" : "queued",
      progress: done ? 100 : active ? Math.max(24, stageMeta[stage].progress) : 0,
    };
  });
}

function buildReport(query: string): { summary: string; report: string } {
  return {
    summary: `The evidence points to a measured transition rather than an overnight replacement of knowledge work. AI agents are most likely to create durable value when they handle bounded research, synthesis, and coordination tasks while professionals retain responsibility for judgment, context, and accountability.`,
    report: `## Executive summary\n\nThe strongest evidence suggests that autonomous agents will first transform the connective tissue of knowledge work: finding relevant material, comparing claims, drafting structured outputs, and coordinating repeatable workflows. The durable advantage is not simply speed; it is a shorter path from question to a source trail a professional can defend.\n\n## What is changing\n\nAcross the literature, the near-term pattern is augmentation before substitution. Agents can compress the mechanical work around analysis, but the quality of the result still depends on clear task boundaries, access to full documents, and a human who can evaluate conflicting evidence.\n\n## Evidence and limits\n\nStudies and industry reports consistently show meaningful gains on well-scoped tasks, while open-ended work remains less predictable. Results vary by domain, source quality, and how much verification is built into the workflow. The research question was: “${query}”\n\n## Implications\n\nTeams should start with workflows where sources are inspectable and errors are recoverable. A verification pass, visible confidence signal, and citations at the claim level are practical safeguards against turning fluent synthesis into unreviewed fact.\n\n## Conclusion\n\nThe most defensible forecast is a hybrid model: agents expand the amount of research a professional can review, while expertise shifts toward framing the question, judging evidence, and deciding what can responsibly be acted on.`,
  };
}

function recentFromRows(rows: Array<{ id: string; query: string; status: string; sourcesCount: number; elapsedMinutes: number }>): ResearchRecent[] {
  return rows.slice(0, 3).map((row) => ({
    id: row.id,
    title: row.query,
    meta: `${row.status === "done" ? "Completed" : row.status === "paused" ? "Paused" : "In progress"} · ${row.sourcesCount} sources · ${row.elapsedMinutes} min`,
    status: row.status,
  }));
}

function toApiResearch(row: typeof researchTable.$inferSelect, recent: ResearchRecent[]) {
  return {
    ...row,
    agents: row.agents ?? [],
    sources: row.sources ?? [],
    recent,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const rows = await db.select({ id: researchTable.id }).from(researchTable).limit(1);
      if (rows.length > 0) return;

      const now = new Date();
      const seed = [
        ["seed-1", "What changes when AI agents become the default interface for work?", 42, 18, 92],
        ["seed-2", "The state of open-weight foundation models", 67, 31, 89],
        ["seed-3", "Industrial policy for compute infrastructure", 29, 12, 84],
      ] as const;

      await db.insert(researchTable).values(seed.map(([id, query, sourcesCount, elapsedMinutes, verificationScore], index) => ({
        id,
        query,
        status: "done",
        progress: 100,
        elapsedMinutes,
        verificationScore,
        sourcesCount,
        claimsChecked: 127,
        agents: buildAgents("done"),
        sources: sourceSeed,
        summary: buildReport(query).summary,
        report: buildReport(query).report,
        createdAt: new Date(now.getTime() - (index + 1) * 86_400_000),
        updatedAt: new Date(now.getTime() - (index + 1) * 86_400_000),
      })));
    })();
  }
  await seedPromise;
}

function startResearchTimer(id: string): void {
  if (researchTimers.has(id)) return;
  const timer = setInterval(async () => {
    const [row] = await db.select().from(researchTable).where(eq(researchTable.id, id)).limit(1);
    if (!row || row.status === "done" || row.status === "failed") {
      const current = researchTimers.get(id);
      if (current) clearInterval(current);
      researchTimers.delete(id);
      return;
    }
    if (row.status === "paused") return;

    const currentIndex = stages.indexOf(row.status as ActiveStage);
    const nextStage = stages[Math.min(currentIndex + 1, stages.length - 1)];
    const next = stageMeta[nextStage];
    const report = buildReport(row.query);
    const userIdScope = row.userId ? eq(researchTable.userId, row.userId) : isNull(researchTable.userId);
    await db.update(researchTable).set({
      status: nextStage,
      progress: next.progress,
      elapsedMinutes: next.elapsed,
      verificationScore: next.score,
      sourcesCount: next.sources,
      claimsChecked: next.claims,
      agents: buildAgents(nextStage),
      sources: sourceSeed.map((source, index) => ({ ...source, progress: nextStage === "done" ? 100 : Math.min(100, Math.max(source.progress, next.progress - index * 12)) })),
      summary: report.summary,
      report: report.report,
      updatedAt: new Date(),
    }).where(and(eq(researchTable.id, id), userIdScope));

    if (nextStage === "done") {
      const current = researchTimers.get(id);
      if (current) clearInterval(current);
      researchTimers.delete(id);
    }
  }, 3500);
  researchTimers.set(id, timer);
}

function mapBackendToResearch(backend: BackendState, createdAt: Date): Omit<typeof researchTable.$inferInsert, "id" | "createdAt"> {
  return {
    query: backend.query,
    status: backend.status as string,
    progress: backend.progress,
    elapsedMinutes: Math.max(1, Math.round(backend.duration_seconds / 60)),
    verificationScore: Math.round(backend.verification_score * 100),
    sourcesCount: backend.sources_total,
    claimsChecked: backend.claims_checked,
    agents: agentsFromBackend(backend),
    sources: sourcesFromBackend(backend),
    summary: backend.summary || "Axiom is mapping the evidence, testing claims, and building a source-backed answer.",
    report: backend.final_report,
    updatedAt: new Date(),
  };
}

async function upsertBackendState(id: string, backend: BackendState, createdAt: Date, userId?: string): Promise<void> {
  const mapped = mapBackendToResearch(backend, createdAt);
  const scope = userId ? and(eq(researchTable.id, id), eq(researchTable.userId, userId)) : eq(researchTable.id, id);
  const [existing] = await db.select({ id: researchTable.id }).from(researchTable).where(scope).limit(1);
  if (existing) {
    await db.update(researchTable).set(mapped).where(scope);
  } else {
    await db.insert(researchTable).values({ id, createdAt, userId, ...mapped });
  }
}

async function proxyGetResearch(id: string): Promise<BackendState | null> {
  return pythonFetch<BackendState>(`/research/${encodeURIComponent(id)}`);
}

async function computeWorkspaceUsage(userId: string) {
  const rows = await db.select().from(researchTable).where(userScope(userId));
  const doneRows = rows.filter((row) => row.status === "done");
  const maxContextLimit = Number(process.env["WORKSPACE_MAX_CONTEXT_TOKENS"] ?? 1_000_000);
  const reportTokens = rows.reduce((total, row) => total + Math.floor(((row.report?.length ?? 0) + (row.summary?.length ?? 0)) / 4), 0);
  const cache = await pythonFetch<{ threads?: Array<{ thread_id: string; cached_tokens: number }>; total_cached_tokens?: number }>("/workspace/cache");
  const cacheTokens = cache?.threads?.reduce((total, t) => total + (t.cached_tokens ?? 0), 0) ?? cache?.total_cached_tokens ?? 0;
  const totalTokensUsed = reportTokens + cacheTokens;
  return {
    totalTokensUsed,
    totalSourcesIndexed: rows.reduce((total, row) => total + row.sourcesCount, 0),
    totalReports: doneRows.length,
    maxContextLimit,
    usedContextPct: Math.min(100, Math.max(0, Math.round((totalTokensUsed / Math.max(1, maxContextLimit)) * 100))),
  };
}

router.get("/research", async (req, res): Promise<void> => {
  await ensureSeeded();
  const rows = await db.select().from(researchTable).where(userScope(req.userId!)).orderBy(desc(researchTable.createdAt));
  const recent = recentFromRows(rows);
  const result = rows.map((row) => toApiResearch(row, recent));
  req.log.info({ count: result.length }, "Listed research jobs");
  res.json(ListResearchResponse.parse(result));
});

async function startResearchProxy(req: Request, res: Response): Promise<void> {
  const parsed = StartResearchBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid research request");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const userId = req.userId!;

  // Atomic reserve: increment only while still under the ceiling. Returning no
  // row means another concurrent request took the last slot — bail with 429
  // before spending anything on the Python pipeline.
  const reserved = (
    await db.execute(sql`
      UPDATE ${userUsageTable}
      SET reports_today = reports_today + 1
      WHERE ${userUsageTable.userId} = ${userId} AND reports_today < ${DAILY_REPORT_LIMIT}
      RETURNING reports_today
    `)
  ).rows as { reports_today: number }[];

  if (reserved.length === 0) {
    req.log.info({ userId }, "Daily research limit reached at reserve time");
    res.status(429).json({ error: "Daily limit reached. Resets at midnight UTC." });
    return;
  }

  const release = async (reason: string): Promise<void> => {
    req.log.warn({ userId, reason }, "Releasing reserved research slot");
    await db.execute(sql`
      UPDATE ${userUsageTable}
      SET reports_today = GREATEST(reports_today - 1, 0)
      WHERE ${userUsageTable.userId} = ${userId}
    `);
  };

  const started = await pythonFetch<{ research_id: string; status: string }>(`/research/`, {
    method: "POST",
    body: JSON.stringify({ query: parsed.data.query.trim() }),
  });
  if (!started?.research_id) {
    await release("python backend unavailable");
    req.log.error("Python research API could not start a job");
    res.status(502).json({ error: "Research backend is unavailable. Please try again." });
    return;
  }

  try {
    await ensureSeeded();
    const id = started.research_id;
    const now = new Date();
    await db.insert(researchTable).values({
      id,
      query: parsed.data.query.trim(),
      status: "planning",
      progress: stageMeta.planning.progress,
      elapsedMinutes: 0,
      verificationScore: 0,
      sourcesCount: 0,
      claimsChecked: 0,
      agents: buildAgents("planning"),
      sources: [],
      summary: "Axiom is mapping the evidence, testing claims, and building a source-backed answer.",
      report: "",
      createdAt: now,
      updatedAt: now,
      userId,
    });
  } catch (error) {
    await release("database insert failed");
    req.log.error({ err: String(error) }, "Could not record research job");
    res.status(502).json({ error: "Research backend is unavailable. Please try again." });
    return;
  }

  res.status(201).json({ research_id: started.research_id, id: started.research_id, query: parsed.data.query.trim(), status: "planning" });
}

router.post("/research/start", checkDailyLimits, startResearchProxy);

type SourceRow = {
  research_id: string;
  research_query: string;
  status: string;
  type: string;
  title: string;
  source: string;
  progress: number;
};

router.get("/research/sources", async (req, res): Promise<void> => {
  const page = Math.max(1, Number(req.query["page"] ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query["limit"] ?? 12) || 12));
  const offset = (page - 1) * limit;
  const userId = req.userId!;

  const rows = (
    await db.execute(sql`
      SELECT r.id AS research_id, r.query AS research_query, r.status,
             s->>'type' AS type, s->>'title' AS title, s->>'source' AS source,
             COALESCE((s->>'progress')::int, 0) AS progress
      FROM ${researchTable} r
      JOIN LATERAL jsonb_array_elements(COALESCE(r.sources, '[]'::jsonb)) AS s ON true
      WHERE r.user_id = ${userId}
      ORDER BY r.created_at DESC, r.id
      LIMIT ${limit} OFFSET ${offset}
    `)
  ).rows as SourceRow[];

  const [{ count }] = (await db.execute(sql`
    SELECT count(*)::int AS count
    FROM ${researchTable} r
    JOIN LATERAL jsonb_array_elements(COALESCE(r.sources, '[]'::jsonb)) AS s ON true
    WHERE r.user_id = ${userId}
  `)).rows as { count: number }[];

  const total = Number(count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const data = rows.map((row) => ({
    researchId: row.research_id,
    researchQuery: row.research_query,
    status: row.status,
    type: row.type,
    title: row.title,
    source: row.source,
    progress: row.progress,
  }));

  res.json(
    ListSourcesResponse.parse({
      data,
      pagination: { total, page, limit, totalPages },
    })
  );
});

router.get("/research/:id", async (req, res): Promise<void> => {
  const params = GetResearchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await ensureSeeded();

  const [existing] = await db.select().from(researchTable).where(and(eq(researchTable.id, params.data.id), userScope(req.userId!))).limit(1);

  const backend = await proxyGetResearch(params.data.id);
  if (backend) {
    await upsertBackendState(params.data.id, backend, existing?.createdAt ?? new Date(), req.userId!);
    const [row] = await db.select().from(researchTable).where(and(eq(researchTable.id, params.data.id), userScope(req.userId!))).limit(1);
    if (!row) {
      res.status(404).json({ error: "Research job not found" });
      return;
    }
    if (row.status === "paused") {
      const paused = { ...row, status: "paused" };
      const rows = await db.select({ id: researchTable.id, query: researchTable.query, status: researchTable.status, sourcesCount: researchTable.sourcesCount, elapsedMinutes: researchTable.elapsedMinutes }).from(researchTable).where(userScope(req.userId!)).orderBy(desc(researchTable.createdAt));
      res.json(GetResearchResponse.parse(toApiResearch(paused, recentFromRows(rows))));
      return;
    }
    const rows = await db.select({ id: researchTable.id, query: researchTable.query, status: researchTable.status, sourcesCount: researchTable.sourcesCount, elapsedMinutes: researchTable.elapsedMinutes }).from(researchTable).where(userScope(req.userId!)).orderBy(desc(researchTable.createdAt));
    res.json(GetResearchResponse.parse(toApiResearch(row, recentFromRows(rows))));
    return;
  }

  if (!existing) {
    res.status(404).json({ error: "Research job not found" });
    return;
  }
  if (!["done", "paused"].includes(existing.status)) startResearchTimer(existing.id);
  const rows = await db.select({ id: researchTable.id, query: researchTable.query, status: researchTable.status, sourcesCount: researchTable.sourcesCount, elapsedMinutes: researchTable.elapsedMinutes }).from(researchTable).where(userScope(req.userId!)).orderBy(desc(researchTable.createdAt));
  const response = toApiResearch(existing, recentFromRows(rows));
  res.json(GetResearchResponse.parse(response));
});

router.post("/research/:id/pause", async (req, res): Promise<void> => {
  const params = PauseResearchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await ensureSeeded();
  const [row] = await db.select().from(researchTable).where(and(eq(researchTable.id, params.data.id), userScope(req.userId!))).limit(1);
  if (!row) {
    res.status(404).json({ error: "Research job not found" });
    return;
  }
  const isPaused = row.status === "paused";
  const nextStatus = isPaused ? pausedStages.get(row.id) ?? "reading" : row.status as ActiveStage;
  if (isPaused) pausedStages.delete(row.id);
  else pausedStages.set(row.id, nextStatus);
  const [updated] = await db.update(researchTable).set({ status: isPaused ? nextStatus : "paused", updatedAt: new Date() }).where(and(eq(researchTable.id, row.id), userScope(req.userId!))).returning();
  if (isPaused) startResearchTimer(row.id);
  const response = toApiResearch(updated, []);
  req.log.info({ id: row.id, status: response.status }, "Toggled research pause state");
  res.json(PauseResearchResponse.parse(response));
});

router.patch("/research/:id", async (req, res): Promise<void> => {
  const params = UpdateResearchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateResearchBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  await ensureSeeded();
  const [existing] = await db.select().from(researchTable).where(and(eq(researchTable.id, params.data.id), userScope(req.userId!))).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Research job not found" });
    return;
  }
  const query = body.data.query.trim();
  const [updated] = await db.update(researchTable).set({ query, updatedAt: new Date() }).where(and(eq(researchTable.id, params.data.id), userScope(req.userId!))).returning();
  await pythonFetch(`/research/${encodeURIComponent(params.data.id)}`, { method: "PATCH", body: JSON.stringify({ query }) });
  req.log.info({ id: params.data.id }, "Renamed research job");
  res.json(UpdateResearchResponse.parse(toApiResearch(updated, [])));
});

router.delete("/research/:id", async (req, res): Promise<void> => {
  const params = DeleteResearchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await ensureSeeded();
  const [existing] = await db.select().from(researchTable).where(and(eq(researchTable.id, params.data.id), userScope(req.userId!))).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Research job not found" });
    return;
  }
  const timer = researchTimers.get(params.data.id);
  if (timer) clearInterval(timer);
  researchTimers.delete(params.data.id);
  pausedStages.delete(params.data.id);
  await db.delete(researchTable).where(and(eq(researchTable.id, params.data.id), userScope(req.userId!)));
  await pythonFetch(`/research/${encodeURIComponent(params.data.id)}`, { method: "DELETE" });
  req.log.info({ id: params.data.id }, "Deleted research job");
  res.json(DeleteResearchResponse.parse({ ok: true }));
});

router.get("/workspace/usage", async (req, res): Promise<void> => {
  await ensureSeeded();
  const usage = await computeWorkspaceUsage(req.userId!);
  req.log.info({ pct: usage.usedContextPct }, "Reported workspace usage");
  res.json(GetWorkspaceUsageResponse.parse(usage));
});

router.post("/workspace/purge-cache", async (req, res): Promise<void> => {
  await ensureSeeded();
  const rows = await db.select({ id: researchTable.id, status: researchTable.status }).from(researchTable).where(userScope(req.userId!));
  const inactiveIds = rows.filter((row) => row.status === "done" || row.status === "failed").map((row) => row.id);
  const purged = await pythonFetch<{ purged_threads?: number }>("/workspace/purge", { method: "POST", body: JSON.stringify({ thread_ids: inactiveIds }) });
  const usage = await computeWorkspaceUsage(req.userId!);
  req.log.info({ purgedThreads: purged?.purged_threads ?? inactiveIds.length }, "Purged inactive workspace cache");
  res.json(PurgeWorkspaceCacheResponse.parse({ purgedThreads: purged?.purged_threads ?? 0, ...usage }));
});

router.get("/workspace/summary", async (req, res): Promise<void> => {
  await ensureSeeded();
  const rows = await db.select().from(researchTable).where(userScope(req.userId!));
  const usage = await computeWorkspaceUsage(req.userId!);
  const summary = {
    activeResearch: rows.filter((row) => !["done", "failed"].includes(row.status)).length,
    completedReports: rows.filter((row) => row.status === "done").length,
    sourcesRead: rows.reduce((total, row) => total + row.sourcesCount, 0),
    contextUsed: usage.usedContextPct,
  };
  res.json(GetWorkspaceSummaryResponse.parse(summary));
});

router.get("/usage", async (req, res): Promise<void> => {
  const userId = req.userId!;
  const today = new Date().toISOString().slice(0, 10);

  await db
    .insert(userUsageTable)
    .values({ userId, lastResetDate: today })
    .onConflictDoNothing({ target: userUsageTable.userId });

  await db
    .update(userUsageTable)
    .set({ reportsToday: 0, tokensToday: 0, lastResetDate: today })
    .where(sql`${userUsageTable.userId} = ${userId} AND ${userUsageTable.lastResetDate} <> ${today}`);

  const [row] = await db.select().from(userUsageTable).where(eq(userUsageTable.userId, userId)).limit(1);
  if (!row) {
    res.status(500).json({ error: "Could not load usage record" });
    return;
  }

  const [y, m, d] = today.split("-").map(Number);
  const resetsAt = new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0)).toISOString();

  req.log.info({ reportsToday: row.reportsToday }, "Reported daily usage");
  res.json(
    GetUsageResponse.parse({
      reportsToday: row.reportsToday,
      tokensToday: row.tokensToday,
      dailyLimit: DAILY_REPORT_LIMIT,
      resetsAt,
    }),
  );
});

export default router;
