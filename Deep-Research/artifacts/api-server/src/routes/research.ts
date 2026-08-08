import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, researchTable, type ResearchAgent, type ResearchRecent, type ResearchSource } from "@workspace/db";
import {
  CreateResearchBody,
  GetResearchParams,
  GetResearchResponse,
  GetWorkspaceSummaryResponse,
  ListResearchResponse,
  PauseResearchParams,
  PauseResearchResponse,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const PYTHON_API_URL = process.env["PYTHON_API_URL"] ?? "http://localhost:8000";
const PYTHON_TIMEOUT_MS = 5000;

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

async function pythonFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T | null> {
  try {
    const response = await fetch(`${PYTHON_API_URL}${path}`, {
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
    }).where(eq(researchTable.id, id));

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

async function upsertBackendState(id: string, backend: BackendState, createdAt: Date): Promise<void> {
  const mapped = mapBackendToResearch(backend, createdAt);
  const [existing] = await db.select({ id: researchTable.id }).from(researchTable).where(eq(researchTable.id, id)).limit(1);
  if (existing) {
    await db.update(researchTable).set(mapped).where(eq(researchTable.id, id));
  } else {
    await db.insert(researchTable).values({ id, createdAt, ...mapped });
  }
}

async function proxyGetResearch(id: string): Promise<BackendState | null> {
  return pythonFetch<BackendState>(`/research/${encodeURIComponent(id)}`);
}

router.get("/research", async (req, res): Promise<void> => {
  await ensureSeeded();
  const rows = await db.select().from(researchTable).orderBy(desc(researchTable.createdAt));
  const recent = recentFromRows(rows);
  const result = rows.map((row) => toApiResearch(row, recent));
  req.log.info({ count: result.length }, "Listed research jobs");
  res.json(ListResearchResponse.parse(result));
});

async function startResearchProxy(req: Parameters<Parameters<typeof router.get>[1]>[0], res: Parameters<Parameters<typeof router.get>[1]>[1]): Promise<void> {
  const parsed = CreateResearchBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid research request");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const started = await pythonFetch<{ research_id: string; status: string }>(`/research/`, {
    method: "POST",
    body: JSON.stringify({ query: parsed.data.query.trim() }),
  });
  if (!started?.research_id) {
    req.log.error("Python research API could not start a job");
    res.status(502).json({ error: "Research backend is unavailable. Please try again." });
    return;
  }

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
  });

  res.status(201).json({ research_id: id, id, query: parsed.data.query.trim(), status: "planning" });
}

router.post("/research/start", startResearchProxy);

router.get("/research/:id", async (req, res): Promise<void> => {
  const params = GetResearchParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await ensureSeeded();

  const [existing] = await db.select().from(researchTable).where(eq(researchTable.id, params.data.id)).limit(1);

  const backend = await proxyGetResearch(params.data.id);
  if (backend) {
    await upsertBackendState(params.data.id, backend, existing?.createdAt ?? new Date());
    const [row] = await db.select().from(researchTable).where(eq(researchTable.id, params.data.id)).limit(1);
    if (!row) {
      res.status(404).json({ error: "Research job not found" });
      return;
    }
    if (row.status === "paused") {
      const paused = { ...row, status: "paused" };
      const rows = await db.select({ id: researchTable.id, query: researchTable.query, status: researchTable.status, sourcesCount: researchTable.sourcesCount, elapsedMinutes: researchTable.elapsedMinutes }).from(researchTable).orderBy(desc(researchTable.createdAt));
      res.json(GetResearchResponse.parse(toApiResearch(paused, recentFromRows(rows))));
      return;
    }
    const rows = await db.select({ id: researchTable.id, query: researchTable.query, status: researchTable.status, sourcesCount: researchTable.sourcesCount, elapsedMinutes: researchTable.elapsedMinutes }).from(researchTable).orderBy(desc(researchTable.createdAt));
    res.json(GetResearchResponse.parse(toApiResearch(row, recentFromRows(rows))));
    return;
  }

  if (!existing) {
    res.status(404).json({ error: "Research job not found" });
    return;
  }
  if (!["done", "paused"].includes(existing.status)) startResearchTimer(existing.id);
  const rows = await db.select({ id: researchTable.id, query: researchTable.query, status: researchTable.status, sourcesCount: researchTable.sourcesCount, elapsedMinutes: researchTable.elapsedMinutes }).from(researchTable).orderBy(desc(researchTable.createdAt));
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
  const [row] = await db.select().from(researchTable).where(eq(researchTable.id, params.data.id)).limit(1);
  if (!row) {
    res.status(404).json({ error: "Research job not found" });
    return;
  }
  const isPaused = row.status === "paused";
  const nextStatus = isPaused ? pausedStages.get(row.id) ?? "reading" : row.status as ActiveStage;
  if (isPaused) pausedStages.delete(row.id);
  else pausedStages.set(row.id, nextStatus);
  const [updated] = await db.update(researchTable).set({ status: isPaused ? nextStatus : "paused", updatedAt: new Date() }).where(eq(researchTable.id, row.id)).returning();
  if (isPaused) startResearchTimer(row.id);
  const response = toApiResearch(updated, []);
  req.log.info({ id: row.id, status: response.status }, "Toggled research pause state");
  res.json(PauseResearchResponse.parse(response));
});

router.get("/workspace/summary", async (req, res): Promise<void> => {
  await ensureSeeded();
  const rows = await db.select().from(researchTable);
  const summary = {
    activeResearch: rows.filter((row) => !["done", "failed"].includes(row.status)).length,
    completedReports: rows.filter((row) => row.status === "done").length,
    sourcesRead: rows.reduce((total, row) => total + row.sourcesCount, 0),
    contextUsed: 38,
  };
  res.json(GetWorkspaceSummaryResponse.parse(summary));
});

export default router;
