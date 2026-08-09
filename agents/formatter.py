import ast
import json
import logging
from typing import Any, Dict, List

from agents.state import ResearchState

logger = logging.getLogger(__name__)


def _title_for_url(url: str, extracted: List[Dict[str, Any]]) -> str:
    for doc in extracted:
        if doc.get("url", "").rstrip("/") == url.rstrip("/") and doc.get("title"):
            return doc.get("title", "")
    return url


def _render_content(content: Any) -> str:
    items: List[str] = []

    if isinstance(content, list):
        items = [str(item).strip() for item in content if str(item).strip()]
    elif isinstance(content, str):
        candidate = content.strip()
        if candidate.startswith("[") and candidate.endswith("]"):
            try:
                parsed = ast.literal_eval(candidate)
            except (ValueError, SyntaxError):
                parsed = None
            if isinstance(parsed, list):
                items = [str(item).strip() for item in parsed if str(item).strip()]
    else:
        return str(content)

    if not items:
        return content if isinstance(content, str) else ""

    return "\n".join(f"- {item}" for item in items)


def _normalize_sections(state: ResearchState) -> List[Dict[str, Any]]:
    raw = state.get("verified_sections") or state.get("draft_sections") or []
    sections: List[Dict[str, Any]] = []

    if isinstance(raw, dict):
        for title, content in raw.items():
            rendered = _render_content(content)
            if rendered.strip():
                sections.append({"title": title, "content": rendered})
        return sections

    for item in raw:
        if not isinstance(item, dict):
            continue
        title = item.get("title")
        content = item.get("content")
        if isinstance(title, str) and isinstance(content, (str, list)):
            rendered = _render_content(content)
            if rendered.strip():
                sections.append({"title": title, "content": rendered})
            continue
        for key, value in item.items():
            rendered = _render_content(value)
            if rendered.strip():
                sections.append({"title": key, "content": rendered})
    return sections


def _build_citations(
    sections: List[Dict[str, Any]],
    extracted: List[Dict[str, Any]],
    existing_order: List[str],
) -> List[str]:
    ordered: List[str] = []
    for url in existing_order:
        if url and url not in ordered:
            ordered.append(url)
    for section in sections:
        for url in section.get("sources_used", []) or []:
            if url and url not in ordered:
                ordered.append(url)

    citations: List[str] = []
    for index, url in enumerate(ordered, start=1):
        title = _title_for_url(url, extracted)
        citations.append(f"[{index}] {title} - {url}")
    return citations


SECTION_TITLES = [
    "Executive Summary & Key Takeaways",
    "Architectural Comparison Matrix",
    "Deep Technical Analysis",
    "Production Implementation Playbook",
    "System Limitations & Risks",
]


def formatter_node(state: ResearchState) -> Dict[str, Any]:
    query = state.get("query", "")
    sections = _normalize_sections(state)
    draft_summary = state.get("draft_summary", "")
    extracted = state.get("extracted", []) or []
    existing_citations = state.get("citations", []) or []
    verification_score = state.get("verification_score", 0.0)

    content_by_title = {
        section.get("title", ""): section.get("content", "")
        for section in sections
        if section.get("title") and section.get("content")
    }

    lines: List[str] = []
    lines.append(f"# Enterprise Research Brief: {query}")
    lines.append("")

    emitted = False
    for title in SECTION_TITLES:
        content = _render_content(content_by_title.get(title, ""))
        if not content.strip():
            continue
        if emitted:
            lines.append("---")
            lines.append("")
        lines.append(f"## {title}")
        lines.append("")
        lines.append(content)
        lines.append("")
        emitted = True

    for section in sections:
        title = section.get("title", "")
        content = _render_content(section.get("content", ""))
        if not title or title in SECTION_TITLES or not content.strip():
            continue
        if emitted:
            lines.append("---")
            lines.append("")
        lines.append(f"## {title}")
        lines.append("")
        lines.append(content)
        lines.append("")
        emitted = True

    lines.append("## References")
    lines.append("")
    citations = _build_citations(sections, extracted, existing_citations)
    for citation in citations:
        lines.append(f"- {citation}")

    final_report = "\n".join(lines).strip()

    final_report_json = {
        "query": query,
        "summary": draft_summary,
        "sections": sections,
        "verification_score": verification_score,
        "citations": citations,
    }

    return {
        "final_report": final_report,
        "final_report_json": json.dumps(final_report_json, indent=2),
        "citations": citations,
        "status": "completed",
    }
