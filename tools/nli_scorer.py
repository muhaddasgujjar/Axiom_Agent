import asyncio
import logging
import os
from typing import Dict, List, Tuple

try:
    import torch  # noqa: E402

    _TORCH_AVAILABLE = True
except ImportError:  # pragma: no cover
    torch = None  # type: ignore[assignment]
    _TORCH_AVAILABLE = False

logger = logging.getLogger(__name__)

if not _TORCH_AVAILABLE:
    logger.warning(
        "torch is not installed; NLI verification is disabled and "
        "claims will be marked unverified (see agents/verifier.py)."
    )

MODEL_NAME = "cross-encoder/nli-deberta-v3-small"
LABELS: List[str] = ["contradiction", "entailment", "neutral"]
CHUNK_SIZE = 512
ENTAILMENT_THRESHOLD = 0.6

_MODEL = None
_DEVICE = None


def _resolve_device() -> str:
    if not _TORCH_AVAILABLE:
        return "cpu"
    if torch.cuda.is_available():
        device = os.environ.get("NLI_DEVICE", "cuda")
        props = torch.cuda.get_device_properties(0)
        logger.info(
            "NLI device: %s (%s, %d MB VRAM)",
            device,
            props.name,
            props.total_memory // (1024 * 1024),
        )
        torch.backends.cudnn.benchmark = True
        torch.backends.cuda.matmul.allow_tf32 = True
        torch.set_grad_enabled(False)
        return device
    return "cpu"


def _get_model():
    global _MODEL, _DEVICE
    if not _TORCH_AVAILABLE:
        return None
    if _MODEL is None:
        from sentence_transformers import CrossEncoder

        _DEVICE = _resolve_device()
        if _DEVICE.startswith("cuda"):
            torch.cuda.set_device(0)
        _MODEL = CrossEncoder(
            MODEL_NAME,
            device=_DEVICE,
            model_kwargs={
                "torch_dtype": torch.float16 if _DEVICE.startswith("cuda") else torch.float32
            },
        )
        logger.info("Loaded NLI model %s on %s", MODEL_NAME, _DEVICE)
    return _MODEL


def _chunk_text(text: str, size: int = CHUNK_SIZE) -> List[str]:
    chunks: List[str] = []
    current: List[str] = []
    current_len = 0
    for word in text.split():
        if current_len + len(word) + 1 > size and current:
            chunks.append(" ".join(current))
            current = []
            current_len = 0
        current.append(word)
        current_len += len(word) + 1
    if current:
        chunks.append(" ".join(current))
    return chunks


def _unavailable_result() -> Dict[str, object]:
    return {
        "label": "neutral",
        "confidence": 0.0,
        "verified": False,
        "entailment_score": 0.0,
        "window_scores": [],
    }


def verify_claim(claim: str, source_text: str) -> Dict[str, object]:
    model = _get_model()
    if model is None:
        return _unavailable_result()
    if _DEVICE.startswith("cuda"):
        torch.cuda.synchronize()

    windows = _chunk_text(source_text)
    if not windows:
        return {
            "label": "neutral",
            "confidence": 0.0,
            "verified": False,
            "entailment_score": 0.0,
            "window_scores": [],
        }

    pairs: List[Tuple[str, str]] = [(claim, window) for window in windows]
    scores = model.predict(pairs, apply_softmax=True)

    entailment_scores: List[float] = []
    window_scores: List[Dict[str, float]] = []
    for score, window in zip(scores, windows):
        probs = score.tolist()
        window_scores.append(
            {
                "window": window[:120],
                "contradiction": float(probs[LABELS.index("contradiction")]),
                "entailment": float(probs[LABELS.index("entailment")]),
                "neutral": float(probs[LABELS.index("neutral")]),
            }
        )
        entailment_scores.append(float(probs[LABELS.index("entailment")]))

    best_index = int(torch.argmax(torch.tensor(scores[0]))) if len(scores) == 1 else None
    if best_index is not None:
        label = LABELS[best_index]
        confidence = float(scores[0][best_index])
    else:
        max_ent = max(entailment_scores)
        label = "entailment" if max_ent > ENTAILMENT_THRESHOLD else "neutral"
        confidence = max_ent

    return {
        "label": label,
        "confidence": confidence,
        "verified": max(entailment_scores) > ENTAILMENT_THRESHOLD,
        "entailment_score": max(entailment_scores),
        "window_scores": window_scores,
    }


async def verify_claim_async(claim: str, source_text: str) -> Dict[str, object]:
    return await asyncio.to_thread(verify_claim, claim, source_text)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    result = verify_claim(
        "The model achieves 92% accuracy on the benchmark.",
        "The proposed model reaches 92% accuracy on the standard benchmark, "
        "outperforming all baselines. Evaluations were repeated across five "
        "runs with a fixed random seed.",
    )
    print(result)
