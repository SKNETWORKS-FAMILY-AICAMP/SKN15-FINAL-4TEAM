"""
Hanssem Mall search helper.

`backend/sllm/hanssemmall.ipynb`에서 사용하던 크롤링 로직을
서비스 모듈로 정리해 Django 백엔드에서 재사용할 수 있도록 했다.
"""

from __future__ import annotations

import logging
import urllib.parse
from dataclasses import dataclass, asdict
from functools import lru_cache
from typing import Dict, Iterable, List, Optional, Tuple, Union

import requests

logger = logging.getLogger(__name__)

API_URL = "https://gateway.hanssem.com/hanssem/display-service/api/v1/search/goods-search"
DEFAULT_SIZE = 3


@dataclass
class HanssemMallItem:
    goods_no: str
    name: str
    brand: Optional[str]
    price: Optional[int]
    discount_rate: Optional[int]
    url: str

    def to_dict(self) -> Dict[str, Optional[str]]:
        payload = asdict(self)
        payload["price"] = self.price
        payload["discount_rate"] = self.discount_rate
        return payload


def _build_headers(keyword: str) -> Dict[str, str]:
    encoded = urllib.parse.quote(keyword)
    return {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/141.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json, text/plain, */*",
        "Referer": f"https://store.hanssem.com/search/goods?searchKey={encoded}",
        "Origin": "https://store.hanssem.com",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    }


def _parse_contents(payload: Dict) -> List[HanssemMallItem]:
    data = payload.get("data") or {}
    goods_container = data.get("searchGoodsDataList") or {}
    contents = goods_container.get("content") or []
    results: List[HanssemMallItem] = []
    for entry in contents:
        goods_no = entry.get("gdsNo")
        name = entry.get("gdsNm")
        if not goods_no or not name:
            continue
        brand_info = entry.get("goodsBrandInfoDto") or {}
        evaluation_info = entry.get("goodsEvaluationStatInfoDto") or {}
        price = entry.get("dcPrc")
        discount = entry.get("dcRate")
        item = HanssemMallItem(
            goods_no=str(goods_no),
            name=name,
            brand=brand_info.get("brandNm"),
            price=price if isinstance(price, int) else None,
            discount_rate=discount if isinstance(discount, int) else None,
            url=f"https://store.hanssem.com/goods/{goods_no}",
        )
        # 후기 수 같은 추가 정보가 필요해지면 evaluation_info에서 꺼낼 수 있다.
        results.append(item)
    return results


def _search(keyword: str, size: int = DEFAULT_SIZE) -> List[HanssemMallItem]:
    if not keyword:
        return []

    params = {
        "page": 1,
        "searchKey": keyword,
        "searchType": 0,
        "size": max(1, min(size, 20)),
        "sort": "R",
    }

    try:
        resp = requests.get(
            API_URL,
            headers=_build_headers(keyword),
            params=params,
            timeout=10,
        )
        resp.raise_for_status()
    except Exception as exc:
        logger.warning("한샘몰 검색 실패(keyword=%s): %s", keyword, exc)
        return []

    try:
        data = resp.json()
    except ValueError as exc:
        logger.warning("한샘몰 응답 파싱 실패(keyword=%s): %s", keyword, exc)
        return []

    return _parse_contents(data)


@lru_cache(maxsize=256)
def search_hanssemmall(keyword: str, size: int = DEFAULT_SIZE) -> List[HanssemMallItem]:
    """
    지정된 키워드로 한샘몰 상품을 검색한다.

    functools.lru_cache로 익명 요청을 캐시해 반복 호출 시 응답 속도를 높였다.
    """
    normalized = (keyword or "").strip()
    if not normalized:
        return []
    return _search(normalized, size=size)


def fetch_best_match(keyword: str) -> Optional[HanssemMallItem]:
    """
    키워드와 가장 잘 매칭되는 상위 1개의 상품을 반환한다.
    """
    results = search_hanssemmall(keyword, size=1)
    return results[0] if results else None


ProductSource = Union[str, Tuple[str, Dict[str, object]]]


def enrich_product_names(
    product_names: Iterable[ProductSource],
    *,
    limit_per_item: int = 1,
) -> List[Dict[str, Optional[str]]]:
    """
    주어진 가구 이름들을 검색해서 가격/링크 등의 정보를 dict 형태로 반환한다.
    """
    enriched: List[Dict[str, Optional[str]]] = []
    for source in product_names:
        if isinstance(source, tuple):
            raw_name, extra = source
            base_meta = dict(extra or {})
        else:
            raw_name = source
            base_meta = {}

        name = (raw_name or "").strip()
        keyword = (name or "").strip()
        if not keyword:
            continue
        matches = search_hanssemmall(keyword, size=limit_per_item)
        if not matches:
            payload = {"name": keyword}
            payload.update(base_meta)
            enriched.append(payload)
            continue
        for item in matches:
            payload = item.to_dict()
            payload.setdefault("name", keyword or name)
            payload.update(base_meta)
            enriched.append(payload)
    return enriched


__all__ = [
    "HanssemMallItem",
    "search_hanssemmall",
    "fetch_best_match",
    "enrich_product_names",
    "ProductSource",
]
