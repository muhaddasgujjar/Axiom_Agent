import os
import time
from typing import Any, Dict

from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langgraph.graph import END, StateGraph

from agents.deep_reader import deep_reader_node
from agents.formatter import formatter_node
from agents.planner import planner_node
from agents.source_hunter import source_hunter_node
from agents.state import ResearchState
from agents.synthesizer import synthesizer_node
from agents.verifier import verifier_node

CHECKPOINT_DB = os.environ.get("RESEARCH_CHECKPOINT_DB", "research_state.db")


def build_graph() -> StateGraph:
    graph = StateGraph(ResearchState)
    graph.add_node("planner", planner_node)
    graph.add_node("source_hunter", source_hunter_node)
    graph.add_node("deep_reader", deep_reader_node)
    graph.add_node("synthesizer", synthesizer_node)
    graph.add_node("verifier", verifier_node)
    graph.add_node("formatter", formatter_node)

    graph.set_entry_point("planner")
    graph.add_edge("planner", "source_hunter")
    graph.add_edge("source_hunter", "deep_reader")
    graph.add_edge("deep_reader", "synthesizer")
    graph.add_edge("synthesizer", "verifier")
    graph.add_edge("verifier", "formatter")
    graph.add_edge("formatter", END)

    return graph


def _initial_state(query: str, research_id: str, user_id: str) -> Dict[str, Any]:
    return {
        "query": query,
        "research_id": research_id,
        "user_id": user_id,
        "sub_questions": [],
        "search_strategy": "",
        "sources": [],
        "extracted": [],
        "fetch_errors": [],
        "draft_sections": [],
        "draft_summary": "",
        "verified_sections": [],
        "removed_claims": [],
        "verification_score": 0.0,
        "final_report": "",
        "final_report_json": "",
        "citations": [],
        "status": "running",
        "messages": [],
        "error": None,
        "duration_seconds": 0.0,
    }


async def run_research(query: str, research_id: str, user_id: str) -> Dict[str, Any]:
    initial_state = _initial_state(query, research_id, user_id)
    start_time = time.time()
    try:
        async with AsyncSqliteSaver.from_conn_string(CHECKPOINT_DB) as saver:
            compiled = build_graph().compile(checkpointer=saver)
            result = await compiled.ainvoke(
                initial_state,
                config={"configurable": {"thread_id": research_id}},
            )
        result["duration_seconds"] = round(time.time() - start_time, 2)
        result.setdefault("status", "completed")
        return result
    except Exception as exc:  # noqa: BLE001
        final = dict(initial_state)
        final["status"] = "failed"
        final["error"] = f"{type(exc).__name__}: {exc}"
        final["duration_seconds"] = round(time.time() - start_time, 2)
        return final
