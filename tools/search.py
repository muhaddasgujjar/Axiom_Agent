import asyncio
import logging
import os
from typing import Any, Dict, List

from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

MAX_RESULTS_PER_QUERY = 10


def _client():
    from tavily import AsyncTavilyClient

    api_key = os.environ.get("TAVILY_API_KEY")
    if not api_key:
        raise RuntimeError("TAVILY_API_KEY is not set in the environment.")
    return AsyncTavilyClient(api_key=api_key)


@retry(
    retry=retry_if_exception_type(Exception),
    wait=wait_exponential(multiplier=1, min=2, max=30),
    stop=stop_after_attempt(3),
    reraise=False,
)
async def tavily_search(query: str, max_results: int = MAX_RESULTS_PER_QUERY) -> List[Dict[str, Any]]:
    try:
        client = _client()
        response = await client.search(query=query, max_results=max_results, include_answer=False)
        results = response.get("results", [])
        return [
            {
                "url": r.get("url", ""),
                "title": r.get("title", ""),
                "content": r.get("content", ""),
                "score": r.get("score", 0.0),
                "query": query,
            }
            for r in results
            if r.get("url")
        ]
    except Exception as exc:  # noqa: BLE001
        logger.warning("tavily_search failed for query '%s': %s", query, exc)
        return []


async def multi_search(queries: List[str], max_results: int = MAX_RESULTS_PER_QUERY) -> List[Dict[str, Any]]:
    tasks = [tavily_search(query, max_results=max_results) for query in queries]
    batches = await asyncio.gather(*tasks, return_exceptions=True)

    by_url: Dict[str, Dict[str, Any]] = {}
    for batch in batches:
        if isinstance(batch, Exception):
            logger.warning("A search batch failed: %s", batch)
            continue
        for item in batch:
            url = item.get("url")
            if not url:
                continue
            normalized = url.rstrip("/")
            if normalized in by_url:
                existing = by_url[normalized]
                if item.get("score", 0.0) > existing.get("score", 0.0):
                    by_url[normalized] = item
            else:
                by_url[normalized] = item

    results = list(by_url.values())
    results.sort(key=lambda r: r.get("score", 0.0), reverse=True)
    return results
