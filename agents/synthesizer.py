import json
import logging
import os
import re
from typing import Any, Dict, List

from langchain_openai import ChatOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from agents.state import ResearchState

logger = logging.getLogger(__name__)

MODEL_NAME = "gpt-4o"
TEMPERATURE = 0.3
MAX_CONTEXT_CHARS = 18000

SYNTHESIZER_SYSTEM_PROMPT = """You are a senior technical analyst producing a high-density, enterprise-grade Technical Research Brief. You will receive a numbered list of source documents relevant to a technical subject.

Respond with ONLY a JSON object with exactly these keys:

1. "executive_verdict": A concise 3-4 sentence summary of the findings, followed by 3 key takeaways rendered as markdown bullets (each prefixed with "- ").

2. "tradeoff_matrix_markdown": A valid Markdown table comparing the key subjects (e.g., indexing or architecture options) across critical operational metrics such as: Latency, Recall %, Memory Footprint, Index Build Time, Scalability Limit. Use a real pipe-delimited table with a header row and a "| --- | --- |" separator row.

3. "deep_analysis": A high-density technical breakdown divided logically into sub-topics using markdown headings (e.g., "### Sub-topic"). Include specific metrics, algorithms, and mechanisms with inline citations in the form [1], [2] matching the numbered source list. Every factual statement must carry at least one citation.

4. "implementation_playbook": A bulleted decision framework formatted as:
   - "Choose [Option A] when: ..."
   - "Choose [Option B] when: ..."
   Include concrete hardware and production deployment recommendations.

5. "limitations": A concise discussion of hardware constraints, edge cases, and query failure modes, with inline citations where applicable.

Rules:
- Base the brief STRICTLY on the provided context. Do not introduce outside facts.
- Write in dense, technical, high-signal prose. Avoid conversational padding or repetitive meta-commentary to minimize token usage.
- Do not include any commentary outside the JSON object.
"""


def _get_llm() -> ChatOpenAI:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set in the environment.")
    return ChatOpenAI(model=MODEL_NAME, api_key=api_key, temperature=TEMPERATURE, max_tokens=4096)


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


def _render_field(value: Any) -> str:
    if isinstance(value, list):
        return "\n".join(f"- {str(item).strip()}" for item in value if str(item).strip())
    if isinstance(value, str):
        return value.strip()
    return str(value)


def _tidy_table(value: str) -> str:
    rows: List[str] = []
    in_table = False
    for raw_line in value.split("\n"):
        line = raw_line.strip()
        if not line:
            continue
        if line.startswith("|"):
            in_table = True
            rows.append(line)
        elif in_table:
            rows[-1] += " " + line
        else:
            rows.append(line)
    return "\n".join(rows)


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

    FIELD_TITLES = [
        ("executive_verdict", "Executive Summary & Key Takeaways"),
        ("tradeoff_matrix_markdown", "Architectural Comparison Matrix"),
        ("deep_analysis", "Deep Technical Analysis"),
        ("implementation_playbook", "Production Implementation Playbook"),
        ("limitations", "System Limitations & Risks"),
    ]

    draft_summary = _render_field(parsed.get("executive_verdict", "")) or "No summary provided."
    draft_sections: List[Dict[str, Any]] = []
    for field, title in FIELD_TITLES:
        content = _render_field(parsed.get(field, ""))
        if field == "tradeoff_matrix_markdown" and content:
            content = _tidy_table(content)
        if not content:
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
