import asyncio
import logging
import os
import time
import uuid
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver  # noqa: E402

from agents.graph import CHECKPOINT_DB, _initial_state, build_graph  # noqa: E402

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Deep Research Agent API", version="0.1.0")

STAGE_AFTER_NODE: Dict[str, str] = {
    "planner": "searching",
    "source_hunter": "reading",
    "deep_reader": "synthesizing",
    "synthesizer": "verifying",
    "verifier": "formatting",
    "formatter": "done",
}

STAGE_PROGRESS: Dict[str, int] = {
    "planning": 8,
    "searching": 22,
    "reading": 48,
    "synthesizing": 65,
    "verifying": 82,
    "formatting": 94,
    "done": 100,
}

JOBS: Dict[str, Dict[str, Any]] = {}


class ResearchStartBody(BaseModel):
    query: str = Field(..., min_length=1)
    user_id: Optional[str] = None


class ResearchStatusBody(BaseModel):
    status: str
    progress: int
    query: str
    research_id: str
    user_id: str
    sources: list
    sources_read: int
    sources_total: int
    extracted_count: int
    sub_questions: list
    verification_score: float
    claims_checked: int
    removed_claims_count: int
    final_report: str
    final_report_json: str
    citations: list
    summary: str
    error: Optional[str]
    duration_seconds: float


async def _run_research_job(job_id: str, query: str, user_id: str) -> None:
    job = JOBS[job_id]
    start_time = time.time()
    try:
        async with AsyncSqliteSaver.from_conn_string(CHECKPOINT_DB) as saver:
            compiled = build_graph().compile(checkpointer=saver)
            state = _initial_state(query, job_id, user_id)
            async for update in compiled.astream(
                state,
                config={"configurable": {"thread_id": job_id}},
                stream_mode="updates",
            ):
                for node_name, payload in update.items():
                    if isinstance(payload, dict):
                        job["state"].update(payload)
                    stage = STAGE_AFTER_NODE.get(node_name)
                    if stage:
                        job["status"] = stage
                        job["progress"] = STAGE_PROGRESS[stage]
        job["status"] = "done"
        job["progress"] = STAGE_PROGRESS["done"]
    except Exception as exc:  # noqa: BLE001
        logger.exception("research job %s failed", job_id)
        job["status"] = "failed"
        job["error"] = f"{type(exc).__name__}: {exc}"
    finally:
        job["duration_seconds"] = round(time.time() - start_time, 2)


def _claims_checked(state: Dict[str, Any]) -> int:
    verified_sections = state.get("verified_sections", []) or []
    checked = sum(len(section.get("claims", []) or []) for section in verified_sections)
    checked += len(state.get("removed_claims", []) or [])
    return checked


def _job_to_response(job: Dict[str, Any]) -> Dict[str, Any]:
    state = job.get("state", {}) or {}
    sources = state.get("sources", []) or []
    extracted = state.get("extracted", []) or []
    sources_read = sum(1 for doc in extracted if doc.get("fetch_success"))
    return {
        "research_id": job["id"],
        "query": state.get("query") or job.get("query", ""),
        "user_id": job.get("user_id", ""),
        "status": job.get("status", "planning"),
        "progress": job.get("progress", STAGE_PROGRESS["planning"]),
        "sources": [
            {
                "url": source.get("url", ""),
                "title": source.get("title", ""),
                "sub_question_id": source.get("sub_question_id", ""),
                "relevance_score": source.get("relevance_score", 0.0),
                "snippet": (source.get("snippet", "") or "")[:300],
            }
            for source in sources
        ],
        "sources_read": sources_read,
        "sources_total": len(sources),
        "extracted_count": len(extracted),
        "sub_questions": state.get("sub_questions", []) or [],
        "search_strategy": state.get("search_strategy", ""),
        "verification_score": state.get("verification_score", 0.0),
        "claims_checked": _claims_checked(state),
        "removed_claims_count": len(state.get("removed_claims", []) or []),
        "final_report": state.get("final_report", ""),
        "final_report_json": state.get("final_report_json", ""),
        "citations": state.get("citations", []) or [],
        "summary": state.get("draft_summary", ""),
        "error": job.get("error"),
        "duration_seconds": job.get("duration_seconds", 0.0),
    }


@app.get("/health")
async def health() -> Dict[str, Any]:
    return {"status": "ok", "service": "ai-deep-research-agent", "timestamp": time.time()}


@app.post("/request-access")
async def request_access(payload: Dict[str, Any]) -> Dict[str, Any]:
    request_id = str(uuid.uuid4())
    await asyncio.sleep(0.1)
    return {
        "request_id": request_id,
        "status": "pending",
        "message": "Access request received and queued for review.",
    }


@app.post("/research", status_code=201)
@app.post("/research/", status_code=201)
async def start_research(body: ResearchStartBody) -> Dict[str, Any]:
    job_id = str(uuid.uuid4())
    user_id = body.user_id or os.environ.get("DEFAULT_USER_ID", "user-local")
    JOBS[job_id] = {
        "id": job_id,
        "query": body.query.strip(),
        "user_id": user_id,
        "status": "planning",
        "progress": STAGE_PROGRESS["planning"],
        "state": {"query": body.query.strip()},
        "error": None,
        "duration_seconds": 0.0,
    }
    asyncio.create_task(_run_research_job(job_id, body.query.strip(), user_id))
    return {"research_id": job_id, "status": "planning", "progress": STAGE_PROGRESS["planning"]}


@app.get("/research/{job_id}")
async def get_research(job_id: str) -> ResearchStatusBody:
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Research job not found")
    return ResearchStatusBody(**_job_to_response(job))


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host="127.0.0.1", port=port)
