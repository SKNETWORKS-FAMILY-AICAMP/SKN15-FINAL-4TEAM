"""
간단한 카탈로그 메타데이터 저장/조회 헬퍼.

DB 스키마를 변경하지 않고도 이미지별로 사용된 가구 정보를
저장하기 위해 default_storage에 JSON 파일을 보관한다.
"""

from __future__ import annotations

import json
from typing import List, Optional

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

META_DIR = "catalog_furniture_meta"


def _ensure_str(data: str) -> str:
    return data if isinstance(data, str) else str(data)


def save_catalog_metadata(image_id: int, furnitures: List[dict]) -> None:
    """
    이미지별 사용 가구 리스트를 저장한다.
    """
    if not furnitures:
        return

    path = f"{META_DIR}/{image_id}.json"
    payload = {
        "image_id": image_id,
        "furnitures": [
            {
                "goods_id": item.get("goods_id"),
                "name": item.get("goods_name") or item.get("name"),
            }
            for item in furnitures
        ],
    }
    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")

    if default_storage.exists(path):
        default_storage.delete(path)
    default_storage.save(path, ContentFile(data))


def load_catalog_metadata(image_id: int) -> Optional[List[dict]]:
    """
    저장된 가구 리스트를 반환한다. 없으면 None을 반환.
    """
    path = f"{META_DIR}/{image_id}.json"
    if not default_storage.exists(path):
        return None

    with default_storage.open(path, "rb") as fp:
        payload = json.load(fp)

    return payload.get("furnitures") or None

