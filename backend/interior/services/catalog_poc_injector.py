"""
Catalog furniture injection proof of concept utilities.

기존 파이프라인을 건드리지 않고,
가구 카탈로그 이미지를 활용한 합성 실험을 진행하기 위한 헬퍼입니다.
"""

from __future__ import annotations

import mimetypes
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Optional

import google.generativeai as genai
import requests
from PIL import Image

from interior.services.clients import get_generative_model

from .catalog_poc_furniture_repository import FurnitureItem


ASSET_CACHE = Path(os.environ.get("CATALOG_ASSET_CACHE", "/tmp/catalog_assets"))
ASSET_CACHE.mkdir(parents=True, exist_ok=True)


class AssetDownloadError(RuntimeError):
    pass


def download_asset(item: FurnitureItem, cache_dir: Path = ASSET_CACHE) -> Path:
    """
    가구 이미지를 로컬에 다운로드해 캐시 경로를 반환한다.
    """
    cache_dir.mkdir(parents=True, exist_ok=True)
    target = cache_dir / f"{item.goods_id}.png"
    if target.exists():
        return target

    response = requests.get(item.image_url, timeout=30)
    if response.status_code != 200:
        raise AssetDownloadError(f"Failed to download asset: {item.image_url}")

    target.write_bytes(response.content)
    return target


def compose_prompt(base_instruction: str, items: Iterable[FurnitureItem]) -> str:
    """
    Gemini에 전달할 기본 프롬프트를 생성한다.
    """
    lines = [
        "당신은 고급 인테리어 디자이너입니다.",
        base_instruction or "선택한 가구를 방에 자연스럽게 배치해 주세요.",
        "가구 목록:",
    ]
    for item in items:
        lines.append(f"- {item.goods_name} (카테고리: {item.big_cat}/{item.small_cat})")
    lines.append("제품의 형태와 소재가 명확히 보이도록 표현해 주세요.")
    return "\n".join(lines)


@dataclass
class CatalogInjectionResult:
    output_path: Path
    prompt: str


def inject_with_gemini(
    base_image_path: Path,
    furniture_items: Iterable[FurnitureItem],
    *,
    instruction: str = "",
    generative_model=None,
    output_dir: Optional[Path] = None,
) -> CatalogInjectionResult:
    """
    Gemini Images API를 사용해 실험적으로 가구를 삽입해 본다.
    """
    items = list(furniture_items)
    if not items:
        raise ValueError("furniture_items must not be empty")

    generative_model = generative_model or get_generative_model()
    prompt = compose_prompt(instruction, items)

    def _upload(path: Path) -> object:
        mime_type, _ = mimetypes.guess_type(str(path))
        if mime_type not in {"image/png", "image/jpeg", "image/webp"}:
            mime_type = "image/png"
        return genai.upload_file(path=path, mime_type=mime_type)

    base_file = _upload(base_image_path)
    furniture_files = []
    for item in items:
        asset_path = download_asset(item)
        furniture_files.append((item, _upload(asset_path)))

    parts: List = [base_file, {"text": prompt}]
    for item, uploaded in furniture_files:
        parts.append({"text": f"{item.goods_name} 제품 참고 이미지"})
        parts.append(uploaded)

    response = generative_model.generate_content(parts)
    print("Gemini response:", response)

    output_dir = output_dir or Path("./catalog_poc_outputs")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"catalog_injected_{items[0].goods_id}.png"
    if hasattr(response, "save_as_image"):
        response.save_as_image(output_path)
    else:
        # fallback: 일부 버전은 save_as_image가 없으므로 parts에서 추출
        result_bytes = None
        for candidate in getattr(response, "candidates", []):
            for part in getattr(candidate.content, "parts", []):
                inline = getattr(part, "inline_data", None)
                if inline and getattr(inline, "data", None):
                    result_bytes = inline.data
                    break
            if result_bytes:
                break
        if not result_bytes:
            raise RuntimeError("Gemini 응답에 이미지 데이터가 없습니다. 프롬프트/입력을 확인하세요.")
        with open(output_path, "wb") as f:
            f.write(result_bytes)

    return CatalogInjectionResult(output_path=output_path, prompt=prompt)


def inject_with_overlay(
    base_image_path: Path,
    asset_paths: List[Path],
    *,
    output_path: Optional[Path] = None,
) -> Path:
    """
    Pillow를 이용한 간단한 overlay 실험 (정밀 합성 전에 빠르게 결과 확인용).
    """
    base = Image.open(base_image_path).convert("RGBA")
    for idx, asset_path in enumerate(asset_paths):
        asset = Image.open(asset_path).convert("RGBA")
        scale = min(base.width / (3 + idx), base.width * 0.4) / asset.width
        resized = asset.resize(
            (int(asset.width * scale), int(asset.height * scale)),
            resample=Image.LANCZOS,
        )
        position = (
            int(base.width * (0.1 + 0.2 * idx)),
            base.height - resized.height - 30,
        )
        base.alpha_composite(resized, dest=position)

    output_path = output_path or Path("./catalog_poc_outputs/overlay.png")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    base.convert("RGB").save(output_path)
    return output_path
