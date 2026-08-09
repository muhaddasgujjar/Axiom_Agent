import json
import logging
import os
import re
from typing import Any, Dict, List

from langchain_openai import ChatOpenAI

from agents.state import ResearchState

logger = logging.getLogger(__name__)

MODEL_NAME = "gpt-4o-mini"
MIN_SUB_QUESTIONS = 8
MAX_SUB_QUESTIONS = 12

PLANNER_PROMPT = """You are an expert research planner. Given a research query, break it down into {min_q}-{max_q} orthogonal sub-questions.

Cover diverse angles including: historical context, current state, quantitative data, expert opinions, primary sources, and contested viewpoints. Ensure sub-questions are mutually exclusive and jointly cover the full scope of the query.

Respond with ONLY a JSON object in this exact shape:
{{
  "sub_questions": [
    {{"id": "sq_1", "question": "...", "angle": "historical"}}
  ],
  "search_strategy": "describe how the sub-questions will be researched and prioritized"
}}

Research query:
{query}
"""


def _get_llm() -> ChatOpenAI:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set in the environment.")
    return ChatOpenAI(model=MODEL_NAME, api_key=api_key, temperature=0.2, max_tokens=4096)


def _strip_json(text: str) -> str:
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*(.*?)```", text, re.DOTALL)
    if fence:
        return fence.group(1).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]
    return text


def _generic_fallback(query: str) -> Dict[str, Any]:
    return {
        "sub_questions": [
            {
                "id": "sq_1",
                "question": f"What are the key facts, background, and current status related to: {query}?",
                "angle": "overview",
            }
        ],
        "search_strategy": "Fallback plan: research the core query directly with broad and targeted searches.",
    }


def planner_node(state: ResearchState) -> Dict[str, Any]:
    query = state.get("query", "")
    if not query:
        return {"sub_questions": [], "search_strategy": ""}

    prompt = PLANNER_PROMPT.format(query=query, min_q=MIN_SUB_QUESTIONS, max_q=MAX_SUB_QUESTIONS)
    try:
        llm = _get_llm()
        response = llm.invoke(prompt)
        content = response.content if hasattr(response, "content") else str(response)
        raw_json = _strip_json(content)
        parsed = json.loads(raw_json)
        sub_questions = parsed.get("sub_questions", [])
        if not isinstance(sub_questions, list) or not sub_questions:
            return _generic_fallback(query)

        normalized = []
        for i, sq in enumerate(sub_questions, start=1):
            if not isinstance(sq, dict):
                continue
            normalized.append(
                {
                    "id": str(sq.get("id") or f"sq_{i}"),
                    "question": str(sq.get("question", "")).strip(),
                    "angle": str(sq.get("angle", "")).strip() or "general",
                }
            )
        normalized = [sq for sq in normalized if sq["question"]]
        if not normalized:
            return _generic_fallback(query)

        strategy = str(parsed.get("search_strategy", "")).strip() or "Broad search across all sub-questions."
        return {
            "sub_questions": normalized[:MAX_SUB_QUESTIONS],
            "search_strategy": strategy,
        }
    except Exception as exc:  # noqa: BLE001
        logger.warning("planner_node JSON parsing failed, using fallback: %s", exc)
        return _generic_fallback(query)
