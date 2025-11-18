"""
가구 DB에서 실험용 데이터를 가져오는 헬퍼.

독립적인 POC에서 재사용할 수 있도록 별도 모듈로 분리해 두고,
추후 `run_design_pipeline(..., use_catalog_furniture=True)`와 같은 옵션이
추가되면 이 모듈을 그대로 가져다 쓸 수 있도록 한다.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional, Sequence

from django.db import connection


@dataclass
class FurnitureItem:
    goods_id: int
    goods_name: str
    big_cat: Optional[str]
    small_cat: Optional[str]
    price: Optional[int]
    image_url: str


def _map_row(row: Sequence) -> FurnitureItem:
    return FurnitureItem(
        goods_id=row[0],
        goods_name=row[1],
        big_cat=row[2],
        small_cat=row[3],
        price=row[4],
        image_url=row[5],
    )


def fetch_furniture(
    limit: Optional[int] = None,
    big_cat: Optional[str] = None,
    small_cat: Optional[str] = None,
) -> List[FurnitureItem]:
    """
    furniture 테이블에서 실험에 사용할 가구 목록을 가져온다.

    Args:
        limit: 반환할 최대 개수 (None이면 제한 없음)
        big_cat: 대분류 필터
        small_cat: 소분류 필터
    """

    query = [
        "SELECT goods_id, goods_name, big_cat, small_cat, price, image_url_path",
        "FROM furniture",
        "WHERE image_url_path IS NOT NULL",
    ]
    params: List = []
    if big_cat:
        query.append("AND big_cat = %s")
        params.append(big_cat)
    if small_cat:
        query.append("AND small_cat = %s")
        params.append(small_cat)
    query.append("ORDER BY RANDOM()")
    if limit is not None:
        query.append("LIMIT %s")
        params.append(limit)

    with connection.cursor() as cursor:
        cursor.execute(" ".join(query), params)
        rows = cursor.fetchall()

    return [_map_row(row) for row in rows]


def fetch_furniture_by_ids(goods_ids: Sequence[int]) -> List[FurnitureItem]:
    """
    지정한 goods_id 목록을 그대로 반환한다.
    """
    if not goods_ids:
        return []

    placeholders = ", ".join(["%s"] * len(goods_ids))
    query = (
        "SELECT goods_id, goods_name, big_cat, small_cat, price, image_url_path "
        f"FROM furniture WHERE goods_id IN ({placeholders})"
    )
    with connection.cursor() as cursor:
        cursor.execute(query, list(goods_ids))
        rows = cursor.fetchall()

    return [_map_row(row) for row in rows]
