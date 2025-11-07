"""
간단한 카탈로그 가구 삽입 POC 실행 스크립트.

사용 예시:
    python -m interior.services.catalog_poc_demo \\
        --base-image ./example_room.png \\
        --limit 3
"""

from __future__ import annotations

import argparse
from pathlib import Path

from .catalog_poc_furniture_repository import fetch_furniture, fetch_furniture_by_ids
from .catalog_poc_injector import (
    download_asset,
    inject_with_gemini,
    inject_with_overlay,
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Catalog furniture injection POC")
    parser.add_argument("--base-image", required=True, help="방 이미지 경로")
    parser.add_argument(
        "--goods-ids",
        nargs="*",
        type=int,
        help="직접 사용할 goods_id 목록 (미지정 시 카테고리/랜덤)",
    )
    parser.add_argument("--big-cat", help="가구 대분류 필터 (예: room_0002)")
    parser.add_argument("--small-cat", help="가구 소분류 필터 (예: fur_type0004)")
    parser.add_argument("--limit", type=int, default=3, help="랜덤 선택 개수")
    parser.add_argument(
        "--mode",
        choices=("gemini", "overlay"),
        default="gemini",
        help="합성 방식",
    )
    parser.add_argument(
        "--instruction",
        default="",
        help="Gemini 프롬프트에 추가할 지시사항",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    base_image = Path(args.base_image)
    if not base_image.exists():
        raise FileNotFoundError(base_image)

    if args.goods_ids:
        furniture = fetch_furniture_by_ids(args.goods_ids)
    else:
        furniture = fetch_furniture(
            limit=args.limit, big_cat=args.big_cat, small_cat=args.small_cat
        )

    if not furniture:
        raise RuntimeError("선택된 가구가 없습니다. 필터 조건을 확인하세요.")

    if args.mode == "overlay":
        asset_paths = [download_asset(item) for item in furniture]
        result_path = inject_with_overlay(base_image, asset_paths)
        print(f"[overlay] 결과: {result_path}")
        return

    result = inject_with_gemini(
        base_image,
        furniture,
        instruction=args.instruction,
    )
    print("=== Gemini 합성 결과 ===")
    print(f"Output: {result.output_path}")
    print("Prompt:")
    print(result.prompt)


if __name__ == "__main__":
    main()

