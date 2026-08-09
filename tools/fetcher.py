import asyncio
import logging
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup
from readability import Document

logger = logging.getLogger(__name__)

MAX_CONCURRENCY = 10
MAX_TEXT_LENGTH = 8000
TIMEOUT_SECONDS = 15.0
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)
SUPPORTED_SCHEMES = {"http", "https"}

_semaphore = asyncio.Semaphore(MAX_CONCURRENCY)


async def fetch_full_content(url: str) -> Dict[str, Any]:
    scheme = urlparse(url).scheme.lower()
    if scheme not in SUPPORTED_SCHEMES:
        return {
            "url": url,
            "title": "",
            "full_text": "",
            "fetch_success": False,
            "error": "unsupported_scheme",
        }

    async with _semaphore:
        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(TIMEOUT_SECONDS),
                follow_redirects=True,
                headers={"User-Agent": USER_AGENT},
            ) as client:
                response = await client.get(url)
                response.raise_for_status()
                html = response.text
        except httpx.HTTPStatusError as exc:
            return {
                "url": url,
                "title": "",
                "full_text": "",
                "fetch_success": False,
                "error": f"http_status_{exc.response.status_code}",
            }
        except (httpx.TimeoutException, httpx.TransportError) as exc:
            return {
                "url": url,
                "title": "",
                "full_text": "",
                "fetch_success": False,
                "error": f"transport_error_{type(exc).__name__}",
            }
        except Exception as exc:  # noqa: BLE001
            logger.warning("fetch_full_content failed for %s: %s", url, exc)
            return {
                "url": url,
                "title": "",
                "full_text": "",
                "fetch_success": False,
                "error": f"error_{type(exc).__name__}",
            }

    try:
        doc = Document(html)
        title = doc.short_title() or ""
        main_html = doc.summary()
        soup = BeautifulSoup(main_html, "lxml")
        text = soup.get_text(separator="\n", strip=True)
        text = "\n".join(line for line in text.splitlines() if line.strip())
        text = text[:MAX_TEXT_LENGTH]
        return {
            "url": url,
            "title": title,
            "full_text": text,
            "fetch_success": bool(text),
            "error": None,
        }
    except Exception as exc:  # noqa: BLE001
        logger.warning("readability extraction failed for %s: %s", url, exc)
        return {
            "url": url,
            "title": "",
            "full_text": "",
            "fetch_success": False,
            "error": f"parse_error_{type(exc).__name__}",
        }


async def fetch_all(urls: List[str]) -> List[Dict[str, Any]]:
    tasks = [fetch_full_content(url) for url in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    collected: List[Dict[str, Any]] = []
    for url, result in zip(urls, results):
        if isinstance(result, Exception):
            collected.append(
                {
                    "url": url,
                    "title": "",
                    "full_text": "",
                    "fetch_success": False,
                    "error": f"error_{type(result).__name__}",
                }
            )
        else:
            collected.append(result)
    return collected
