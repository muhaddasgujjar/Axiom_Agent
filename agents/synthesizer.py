import json
import logging
import os
import re
from typing import Any, Dict, List

from langchain_groq import ChatGroq
from tenacity import retry, stop_after_attempt, wait_exponential

from agents.state import ResearchState

logger = logging.getLogger(__name__)

MODEL_NAME = "llama-3.3-70b-versatile"
TEMPERATURE = 0.4
MAX_CONTEXT_CHARS = 18000

SYNTHESIZER_SYSTEM_PROMPT = """You are a senior research analyst writing a comprehensive, well-structured deep research report.

You will receive a numbered list of source documents. Write a thorough report that:
- Is divided into logical sections with clear headings (e.g. Overview, Historical Context, Current State, Key Data, Expert Perspectives, Contradictions, Conclusion).
- Contains inline citations in the form "[1]", "[2]", etc., matching the numbered source list.
- Is based STRICTLY on the provided context. Do not introduce outside facts.
- Uses objective, precise language and flags uncertainty when sources conflict.

Respond with ONLY a JSON object in this exact shape:
{{
  "summary": "a 3-4 sentence executive summary of the entire report",
  "sections": [
    {{"title": "Section Heading", "content": "Full paragraph(s) of the section with inline citations like [1] and [2]."}}
  ]
}}

Rules:
- Every factual statement must carry at least one citation number.
- Do not include any commentary outside the JSON object.
"""


def _get_llm() -> ChatGroq:
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set in the environment.")
    return ChatGroq(model=MODEL_NAME, api_key=api_key, temperature=TEMPERATURE, max_tokens=4096)


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


def _build_context(extracted: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    included: List[Dict[str, Any]] = []
    used = 0
    for doc in extracted:
        title = doc.get("title", "")
        url = doc.get("url", "")
        claims = " | ".join(doc.get("key_claims", [])) or doc.get("summary", "")
        data = " | ".join(doc.get("data_points", []))
        block = (
            f"[{len(included) + 1}] Title: {title}\nURL: {url}\n"
            f"Claims: {claims}\nData points: {data}\n"
        )
        if used + len(block) > MAX_CONTEXT_CHARS:
            break
        included.append(doc)
        used += len(block)
    return included


def _sources_used(content: str, url_by_index: Dict[str, str]) -> List[str]:
    numbers = re.findall(r"\[(\d+)\]", content)
    used: List[str] = []
    for number in numbers:
        url = url_by_index.get(number)
        if url and url not in used:
            used.append(url)
    return used


@retry(stop=stop_after_attempt(4), wait=wait_exponential(min=4, max=20))
async def _invoke_llm_with_retry(messages: List[Dict[str, str]]) -> Any:
    llm = _get_llm()
    return await llm.ainvoke(messages)


async def synthesizer_node(state: ResearchState) -> Dict[str, Any]:
    extracted = state.get("extracted", []) or []
    docs = [
        doc for doc in extracted
        if doc.get("fetch_success") and doc.get("key_claims")
    ]
    if not docs:
        return {
            "draft_sections": [],
            "draft_summary": "No sources with extractable claims were available to synthesize a report.",
        }

    included = _build_context(docs)
    if not included:
        return {
            "draft_sections": [],
            "draft_summary": "No sources with extractable claims were available to synthesize a report.",
        }
    url_by_index = {str(index): doc.get("url", "") for index, doc in enumerate(included, start=1)}
    citation_order = [doc.get("url", "") for doc in included]
    context_blocks = [
        (
            f"[{index}] Title: {doc.get('title', '')}\nURL: {doc.get('url', '')}\n"
            f"Claims: {' | '.join(doc.get('key_claims', [])) or doc.get('summary', '')}\n"
            f"Data points: {' | '.join(doc.get('data_points', []))}\n"
        )
        for index, doc in enumerate(included, start=1)
    ]
    context = "\n".join(context_blocks)

    try:
        messages = [
            {"role": "system", "content": SYNTHESIZER_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    "Research query: " + state.get("query", "") + "\n\n"
                    "Source documents:\n" + context
                ),
            },
        ]
        response = await _invoke_llm_with_retry(messages)
        raw = response.content if hasattr(response, "content") else str(response)
        parsed = json.loads(_strip_json(raw))
    except Exception as exc:  # noqa: BLE001
        print(f"Synthesizer Error: {exc}")
        logger.warning("synthesizer_node failed: %s", exc)
        return {"draft_sections": [], "draft_summary": "Report generation failed during synthesis."}

    draft_summary = str(parsed.get("summary", "")).strip() or "No summary provided."
    sections_raw = parsed.get("sections", [])
    draft_sections: List[Dict[str, Any]] = []
    if isinstance(sections_raw, list):
        for section in sections_raw:
            if not isinstance(section, dict):
                continue
            title = str(section.get("title", "")).strip()
            content = str(section.get("content", "")).strip()
            if not title or not content:
                continue
            draft_sections.append(
                {
                    "title": title,
                    "content": content,
                    "claims": [],
                    "sources_used": _sources_used(content, url_by_index),
                }
            )

    return {
        "draft_sections": draft_sections,
        "draft_summary": draft_summary,
        "citations": citation_order,
    }
