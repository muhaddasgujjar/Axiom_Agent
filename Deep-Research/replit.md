# Axiom — Deep Research Agent

Axiom turns complex questions into a defensible research trail using an autonomous 6-agent pipeline with local NLI claim verification.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API proxy server (port 5000)
- `uvicorn api.main:app --reload --port 8000` — run the Python FastAPI / LangGraph backend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all frontend and API packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `GROQ_API_KEY`, `TAVILY_API_KEY`

## Stack

- Frontend: Next.js (App Router), Tailwind CSS, Lucide Icons, TypeScript 5.9
- API Proxy: Express 5, Node.js 24, pnpm workspaces
- DB & ORM: PostgreSQL + Drizzle ORM
- AI Core Backend: Python FastAPI, LangGraph 1.0, Groq Llama 3.3 70B, sentence-transformers (`cross-encoder/nli-deberta-v3-small`)
- Validation & Codegen: Zod (`zod/v4`), Orval (OpenAPI client hooks)

## Where things live

- `/agents` — Python LangGraph agent nodes (Planner, Source Hunter, Deep Reader, Synthesizer, Verifier, Formatter)
- `/tools` — Search wrappers (Tavily), web fetchers (httpx + readability), and local GPU NLI scorer
- `/api` — FastAPI app endpoints (`/research`, `/reports`)
- `/packages/api-server` — Express proxy routing frontend requests to the Python AI core
- `/packages/db` — Drizzle ORM PostgreSQL schema for users, research jobs, and reports

## Architecture decisions

- Local NLI Hallucination Check: Uses `cross-encoder/nli-deberta-v3-small` running locally via CUDA to score claim-source pairs without external API costs or latency.
- Full Document Fetching: Uses `readability-lxml` to strip boilerplate HTML and extract full text rather than relying on search snippets.
- Card-Based UI Paradigm: Standardizes all metrics, active progress steps, and research history on card grids rather than tabular data displays.