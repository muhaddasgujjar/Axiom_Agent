import logging
from typing import Any, Dict, List

from agents.state import ResearchState
from tools.search import multi_search

logger = logging.getLogger(__name__)

TOP_N = 50


async def source_hunter_node(state: ResearchState) -> Dict[str, Any]:
    sub_questions = state.get("sub_questions", []) or []
    question_to_id = {
        (sq.get("question") or "").strip().lower(): sq.get("id", "")
        for sq in sub_questions
        if sq.get("question")
    }
    queries = list(question_to_id.keys())
    if not queries:
        return {"sources": [], "fetch_errors": []}

    results = await multi_search(queries)

    sources: List[Dict[str, Any]] = []
    for item in results:
        sources.append(
            {
                "url": item.get("url", ""),
                "title": item.get("title", ""),
                "sub_question_id": _resolve_sub_question_id(item.get("query", ""), question_to_id),
                "relevance_score": float(item.get("score", 0.0)),
                "snippet": item.get("content", ""),
            }
        )

    sources.sort(key=lambda s: s.get("relevance_score", 0.0), reverse=True)
    return {"sources": sources[:TOP_N]}


def _resolve_sub_question_id(query: str, question_to_id: Dict[str, str]) -> str:
    if not question_to_id:
        return ""
    return question_to_id.get((query or "").strip().lower(), next(iter(question_to_id.values())))
