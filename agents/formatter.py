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


def _build_citations(
    verified_sections: List[Dict[str, Any]],
    extracted: List[Dict[str, Any]],
    existing_order: List[str],
) -> List[str]:
    ordered: List[str] = []
    for url in existing_order:
        if url and url not in ordered:
            ordered.append(url)
    for section in verified_sections:
        for url in section.get("sources_used", []) or []:
            if url and url not in ordered:
                ordered.append(url)

    citations: List[str] = []
    for index, url in enumerate(ordered, start=1):
        title = _title_for_url(url, extracted)
        citations.append(f"[{index}] {title} - {url}")
    return citations


def formatter_node(state: ResearchState) -> Dict[str, Any]:
    query = state.get("query", "")
    verified_sections = state.get("verified_sections", []) or []
    draft_summary = state.get("draft_summary", "")
    extracted = state.get("extracted", []) or []
    existing_citations = state.get("citations", []) or []
    verification_score = state.get("verification_score", 0.0)

    lines: List[str] = []
    lines.append(f"# Deep Research Report: {query}")
    lines.append("")
    if draft_summary:
        lines.append("## Executive Summary")
        lines.append("")
        lines.append(draft_summary)
        lines.append("")

    for section in verified_sections:
        title = section.get("title", "")
        content = section.get("content", "")
        if not title or not content:
            continue
        lines.append(f"## {title}")
        lines.append("")
        lines.append(content)
        lines.append("")

    if verified_sections:
        lines.append("## Verification")
        lines.append("")
        lines.append(
            f"Overall verification score: {verification_score} "
            f"(fraction of claims that survived the NLI verification pass)."
        )
        lines.append("")

    lines.append("## Citations")
    lines.append("")
    citations = _build_citations(verified_sections, extracted, existing_citations)
    for citation in citations:
        lines.append(f"- {citation}")

    final_report = "\n".join(lines).strip()

    final_report_json = {
        "query": query,
        "summary": draft_summary,
        "sections": verified_sections,
        "verification_score": verification_score,
        "citations": citations,
    }

    return {
        "final_report": final_report,
        "final_report_json": json.dumps(final_report_json, indent=2),
        "citations": citations,
        "status": "completed",
    }
