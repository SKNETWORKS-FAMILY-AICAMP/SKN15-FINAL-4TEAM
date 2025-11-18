from __future__ import annotations

import logging
from functools import lru_cache
from pathlib import Path
from threading import Lock
from typing import Sequence

import torch
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from transformers import AutoModelForCausalLM, AutoTokenizer

logger = logging.getLogger(__name__)
_GENERATION_LOCK = Lock()


def _resolve_model_dir() -> Path:
    model_dir = Path(getattr(settings, "SLLM_MODEL_DIR", "")).expanduser()
    if not model_dir.exists():
        raise ImproperlyConfigured(
            f"SLLM 모델 경로({model_dir})가 존재하지 않습니다. SLLM_MODEL_DIR 설정을 확인하세요."
        )
    return model_dir


def _resolve_device() -> str:
    configured = (getattr(settings, "SLLM_DEVICE", "auto") or "auto").lower()
    if configured != "auto":
        return configured
    if torch.cuda.is_available():
        return "cuda"
    if torch.backends.mps.is_available():  # type: ignore[attr-defined]
        return "mps"
    return "cpu"


@lru_cache(maxsize=1)
def _load_tokenizer():
    model_dir = _resolve_model_dir()
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    if tokenizer.pad_token_id is None:
        tokenizer.pad_token = tokenizer.eos_token or tokenizer.unk_token
        tokenizer.pad_token_id = tokenizer.eos_token_id or tokenizer.unk_token_id
    tokenizer.padding_side = "left"
    return tokenizer


@lru_cache(maxsize=1)
def _load_model():
    model_dir = _resolve_model_dir()
    target_device = _resolve_device()
    use_half = target_device.startswith("cuda")
    torch_dtype = torch.float16 if use_half else torch.float32

    logger.info("SLLM 로딩 시작 (dir=%s, device=%s, dtype=%s)", model_dir, target_device, torch_dtype)
    if target_device == "cuda" and torch.cuda.device_count() > 1:
        model = AutoModelForCausalLM.from_pretrained(
            model_dir,
            torch_dtype=torch_dtype,
            device_map="auto",
        )
        model_device = next(model.parameters()).device
    else:
        model = AutoModelForCausalLM.from_pretrained(
            model_dir,
            torch_dtype=torch_dtype,
        )
        model_device = torch.device(target_device)
        model.to(model_device)

    model.eval()
    logger.info("SLLM 로딩 완료 (device=%s)", model_device)
    return model, model_device


def is_sllm_available() -> bool:
    try:
        _resolve_model_dir()
        return True
    except ImproperlyConfigured:
        return False


def _build_eos_token_ids(tokenizer) -> Sequence[int]:
    eos_candidates = [tok_id for tok_id in [tokenizer.eos_token_id, tokenizer.pad_token_id] if tok_id is not None]
    try:
        eot_id = tokenizer.convert_tokens_to_ids("<|eot_id|>")
        if isinstance(eot_id, int) and eot_id >= 0:
            eos_candidates.append(eot_id)
    except Exception:  # pragma: no cover - optional token
        pass
    return list(dict.fromkeys(eos_candidates))


def generate_chat_completion(
    messages: Sequence[dict],
    *,
    max_new_tokens: int | None = None,
    temperature: float | None = None,
    top_p: float | None = None,
    top_k: int | None = None,
) -> str:
    """
    로컬 SLLM 모델을 사용하여 채팅 응답을 생성한다.
    """
    tokenizer = _load_tokenizer()
    model, model_device = _load_model()

    generation_kwargs = {
        "max_new_tokens": max_new_tokens or getattr(settings, "SLLM_MAX_NEW_TOKENS", 384),
        "temperature": temperature if temperature is not None else getattr(settings, "SLLM_TEMPERATURE", 0.7),
        "top_p": top_p if top_p is not None else getattr(settings, "SLLM_TOP_P", 0.85),
        "top_k": top_k if top_k is not None else getattr(settings, "SLLM_TOP_K", 40),
    }
    do_sample = (generation_kwargs["temperature"] or 0) > 0

    input_ids = tokenizer.apply_chat_template(
        list(messages),
        add_generation_prompt=True,
        return_tensors="pt",
    )
    input_ids = input_ids.to(model_device)

    eos_token_ids = _build_eos_token_ids(tokenizer)

    with torch.no_grad():
        with _GENERATION_LOCK:
            output_ids = model.generate(
                input_ids=input_ids,
                pad_token_id=tokenizer.pad_token_id,
                eos_token_id=eos_token_ids,
                do_sample=do_sample,
                **generation_kwargs,
            )

    generated_sequence = output_ids[0, input_ids.shape[-1]:]
    text = tokenizer.decode(generated_sequence, skip_special_tokens=True)
    return text.strip()
