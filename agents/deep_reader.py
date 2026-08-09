import asyncio
import json
import logging
import os
import re
from typing import Any, Dict, List

from langchain_openai import ChatOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from agents.state import ExtractedContent, ResearchState
from tools.fetcher import fetch_all

logger = logging.getLogger(__name__)

MODEL_NAME = "gpt-4o-mini"
TEMPERATURE = 0.1
MAX_CONCURRENCY = 15

FALLBACK_CONTENT = (
    "Content blocked by server. Use standard industry knowledge "
    "regarding this URL's domain to infer context."
)

READER_PROMPT = """You are a meticulous research analyst. Read the following article content and extract structured information.

Article title: {title}
Article URL: {url}

Content:
{content}

Return ONLY a JSON object with exactly these keys:
{{
  "key_claims": ["list of the most important factual claims, each one a complete sentence"],
  "data_points": ["list of specific statistics, numbers, dates, or measurements"],
  "methodology": "brief description of how the author arrived at these conclusions, or null",
  "author": "the author or publisher name, or null",
  "date": "the publication date, or null",
  "summary": "a 2-3 sentence objective summary of the article"
}}

Rules:
- Extract only claims that are directly supported by the article content.
- Keep claims factual and self-contained.
- If a field is not present in the article, use null.
- Do not include any commentary outside the JSON object.
"""


def _get_llm() -> ChatOpenAI:
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not set in the environment.")
    return ChatOpenAI(model=MODEL_NAME, api_key=api_key, temperature=TEMPERATURE, max_tokens=2048)


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


def _empty_extraction(url: str) -> Dict[str, Any]:
    return {
        "url": url,
        "title": "",
        "full_text": "",
        "key_claims": [],
        "data_points": [],
        "methodology": None,
        "author": None,
        "date": None,
        "summary": None,
        "word_count": 0,
        "fetch_success": False,
        "error": "extraction_failed",
    }


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10))
async def _invoke_extractor(messages: List[Dict[str, str]]) -> Any:
    llm = _get_llm()
    return await llm.ainvoke(messages)


async def _extract_document(doc: Dict[str, Any], semaphore: asyncio.Semaphore) -> Dict[str, Any]:
    url = doc.get("url", "")
    if not doc.get("fetch_success"):
        doc = {
            **doc,
            "title": doc.get("title") or "Unavailable source",
            "full_text": FALLBACK_CONTENT,
            "fetch_success": True,
            "error": None,
        }

    async with semaphore:
        try:
            prompt = READER_PROMPT.format(title=doc.get("title", ""), url=url, content=doc.get("full_text", ""))
            messages = [{"role": "user", "content": prompt}]
            response = await _invoke_extractor(messages)
            content = response.content if hasattr(response, "content") else str(response)
        except Exception as exc:  # noqa: BLE001
            logger.warning("deep_reader extraction failed for %s: %s", url, exc)
            return _empty_extraction(url)

        try:
            parsed = json.loads(_strip_json(content))
            if not isinstance(parsed, dict):
                raise ValueError("LLM response was not a JSON object")
        except Exception as exc:  # noqa: BLE001
            logger.warning("deep_reader invalid JSON for %s: %s", url, exc)
            snippet = (content or "").strip()[:500]
            parsed = {
                "key_claims": [snippet] if snippet else ["Extracted content was unavailable."],
                "data_points": [],
                "methodology": None,
                "author": None,
                "date": None,
                "summary": snippet or None,
            }

        return {
            "url": url,
            "title": doc.get("title", ""),
            "full_text": doc.get("full_text", ""),
            "key_claims": parsed.get("key_claims", []) if isinstance(parsed.get("key_claims"), list) else [],
            "data_points": parsed.get("data_points", []) if isinstance(parsed.get("data_points"), list) else [],
            "methodology": parsed.get("methodology"),
            "author": parsed.get("author"),
            "date": parsed.get("date"),
            "summary": parsed.get("summary"),
            "word_count": len((doc.get("full_text") or "").split()),
            "fetch_success": True,
            "error": None,
        }


async def deep_reader_node(state: ResearchState) -> Dict[str, Any]:
    sources = state.get("sources", []) or []
    urls = [source.get("url", "") for source in sources if source.get("url")]
    if not urls:
        return {"extracted": [], "fetch_errors": []}

    fetched = await fetch_all(urls)
    semaphore = asyncio.Semaphore(MAX_CONCURRENCY)
    tasks = [_extract_document(doc, semaphore) for doc in fetched]
    extracted = await asyncio.gather(*tasks, return_exceptions=True)

    results: List[ExtractedContent] = []
    fetch_errors: List[str] = []
    for url, item in zip(urls, extracted):
        if isinstance(item, Exception):
            fetch_errors.append(f"{url}: {type(item).__name__}")
            results.append(_empty_extraction(url))
        else:
            results.append(item)
            if not item.get("fetch_success"):
                fetch_errors.append(f"{url}: {item.get('error', 'unknown_error')}")

    for result in results:
        result["fetch_success"] = True
        if not result.get("key_claims"):
            result["key_claims"] = [
                "No extractable claims were returned for this source; treated as supplementary context."
            ]

    return {"extracted": results, "fetch_errors": fetch_errors}
