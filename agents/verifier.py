import asyncio
import logging
import re
from typing import Any, Dict, List

from agents.state import ResearchState
from tools.nli_scorer import verify_claim

logger = logging.getLogger(__name__)

MIN_SENTENCE_CHARS = 25
CONFIDENCE_ACCEPT_THRESHOLD = 0.35
GPU_SEMAPHORE_LIMIT = 1


def extract_claims_from_text(text: str) -> List[str]:
    claims: List[str] = []
    for line in re.split(r"\n+", text):
        line = line.strip()
        if not line:
            continue
        for sentence in re.split(r"(?<=[.!?])\s+", line):
            sentence = sentence.strip()
            if not sentence:
                continue
            if len(sentence) < MIN_SENTENCE_CHARS:
                continue
            if not re.search(r"[.!?]$", sentence):
                continue
            claims.append(sentence)
    return claims


def _matches_url(source_url: str, doc_url: str) -> bool:
    return source_url.rstrip("/") == doc_url.rstrip("/")


def _collect_source_text(section: Dict[str, Any], extracted: List[Dict[str, Any]]) -> str:
    sources_used = section.get("sources_used", []) or []
    matched = []
    for doc in extracted:
        if not doc.get("fetch_success"):
            continue
        if any(_matches_url(source_url, doc.get("url", "")) for source_url in sources_used):
            matched.append(doc.get("full_text", ""))
    if not matched:
        matched = [
            doc.get("full_text", "")
            for doc in extracted
            if doc.get("fetch_success") and doc.get("full_text")
        ]
    return "\n\n".join(text for text in matched if text)


def _is_verified(result: Dict[str, object]) -> bool:
    if result.get("verified"):
        return True
    confidence = float(result.get("confidence", 0.0))
    label = str(result.get("label", "neutral"))
    return confidence > CONFIDENCE_ACCEPT_THRESHOLD and label != "contradiction"


async def _verify_one(
    claim: str,
    source_text: str,
    source_urls: List[str],
    semaphore: asyncio.Semaphore,
) -> Dict[str, Any]:
    async with semaphore:
        result = await asyncio.to_thread(verify_claim, claim, source_text)
    return {
        "claim": claim,
        "source_urls": source_urls,
        "confidence": float(result.get("confidence", 0.0)),
        "label": str(result.get("label", "neutral")),
        "verified": _is_verified(result),
    }


async def verifier_node(state: ResearchState) -> Dict[str, Any]:
    draft_sections = state.get("draft_sections", []) or []
    extracted = state.get("extracted", []) or []

    semaphore = asyncio.Semaphore(GPU_SEMAPHORE_LIMIT)
    verified_sections: List[Dict[str, Any]] = []
    removed_claims: List[Dict[str, Any]] = []
    verified_count = 0
    total_count = 0

    for section in draft_sections:
        content = section.get("content", "")
        source_urls = section.get("sources_used", []) or []
        source_text = _collect_source_text(section, extracted)

        claims = extract_claims_from_text(content)
        if not claims:
            verified_sections.append(
                {
                    "title": section.get("title", ""),
                    "content": content,
                    "claims": [],
                    "sources_used": source_urls,
                }
            )
            continue

        tasks = [
            _verify_one(claim, source_text, source_urls, semaphore)
            for claim in claims
        ]
        results = await asyncio.gather(*tasks)

        verified_claims: List[str] = []
        for result in results:
            total_count += 1
            if result["verified"]:
                verified_count += 1
                verified_claims.append(result["claim"])
            else:
                removed_claims.append(
                    {
                        "text": result["claim"],
                        "source_urls": result["source_urls"],
                        "confidence": result["confidence"],
                        "verified": False,
                        "sub_question_id": "",
                    }
                )

        verified_sections.append(
            {
                "title": section.get("title", ""),
                "content": content,
                "claims": verified_claims,
                "sources_used": source_urls,
            }
        )

    verification_score = (verified_count / total_count) if total_count else 0.0
    return {
        "verified_sections": verified_sections,
        "removed_claims": removed_claims,
        "verification_score": round(verification_score, 4),
    }
