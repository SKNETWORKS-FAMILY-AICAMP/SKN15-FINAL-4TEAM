#!/usr/bin/env python3
"""
간단한 url_context 실험 스크립트.

예시:
  python backend/interior/services/url_context_experiment.py \
      --room-url https://example.com/room.jpg \
      --goods-ids 101 202 303 \
      --style "모던하고 아늑한 거실"
"""

import argparse
import base64
import os
import sys
import time
from pathlib import Path
from typing import List

import django
from django.db import connection


def ensure_google_client():
    try:
        from google import genai  # type: ignore
        from google.genai.types import GenerateContentConfig, Tool  # type: ignore
    except ImportError as exc:  # pragma: no cover
        raise RuntimeError(
            "google-genai 패키지를 찾을 수 없습니다. pip install google-genai 로 설치해 주세요."
        ) from exc
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY 환경변수가 설정되어 있지 않습니다.")
    client = genai.Client(api_key=api_key)
    return client, GenerateContentConfig, Tool


def fetch_furniture(goods_ids: List[int]):
    placeholders = ", ".join(["%s"] * len(goods_ids))
    query = (
        "SELECT goods_id, goods_name, image_url_path "
        f"FROM furniture WHERE goods_id IN ({placeholders})"
    )
    with connection.cursor() as cursor:
        cursor.execute(query, goods_ids)
        rows = cursor.fetchall()
    return rows


def extract_image_bytes(response) -> bytes:
    candidate = response.candidates[0]
    for part in candidate.content.parts:
        inline = getattr(part, "inline_data", None)
        if inline and getattr(inline, "data", None):
            data = inline.data
            if isinstance(data, str):
                return base64.b64decode(data)
            return data
        text = getattr(part, "text", "") or ""
        if "base64," in text:
            encoded = text.split("base64,", 1)[-1].strip()
            try:
                return base64.b64decode(encoded)
            except Exception:
                continue
    raise RuntimeError("응답에 이미지 데이터가 포함되어 있지 않습니다.")


def main():
    parser = argparse.ArgumentParser(description="Gemini url_context 실험 도구")
    parser.add_argument("--room-url", required=True, help="빈 방 이미지 URL (S3 등)")
    parser.add_argument(
        "--goods-ids",
        nargs="+",
        type=int,
        required=True,
        help="한샘 가구 goods_id 목록",
    )
    parser.add_argument(
        "--style",
        default="모던하고 아늑한 거실",
        help="모델에게 전달할 스타일/분위기 설명",
    )
    parser.add_argument(
        "--output-dir",
        default="url_context_outputs",
        help="결과 이미지를 저장할 디렉터리",
    )
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parents[2]
    if str(project_root) not in sys.path:
        sys.path.append(str(project_root))
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")
    django.setup()

    client, GenerateContentConfig, Tool = ensure_google_client()

    furniture_rows = fetch_furniture(args.goods_ids)
    if not furniture_rows:
        raise RuntimeError("요청한 goods_id에 해당하는 가구를 찾을 수 없습니다.")

    furniture_lines = []
    furniture_urls = []
    for goods_id, goods_name, image_url in furniture_rows:
        if not image_url:
            print(
                f"[WARN] goods_id={goods_id} ({goods_name}) 는 image_url_path가 비어 있어 건너뜁니다.",
                file=sys.stderr,
            )
            continue
        furniture_lines.append(f"- {goods_name} (ID: {goods_id}) -> {image_url}")
        furniture_urls.append(image_url)

    if not furniture_urls:
        raise RuntimeError("사용 가능한 가구 이미지 URL이 없습니다.")

    furniture_section = "\n".join(furniture_lines)
    prompt = f"""
당신은 고급 인테리어 디자이너입니다.
아래 URL을 참고하여 '{args.style}' 무드로 인테리어를 구성하세요.

# 입력 자료
- 빈 방 이미지: {args.room_url}
- 반드시 참고해야 할 한샘 가구 이미지들:
{furniture_section}

# 지침
1. 빈 방 구조나 카메라 앵글을 바꾸지 말고 가구만 자연스럽게 배치하세요.
2. 가구의 형태와 색상을 유지하되, 방 조명에 맞게 밝기만 조정하세요.
3. 가구가 바닥에 닿아 있고 서로 겹치지 않도록 배치하세요.
4. 최종 결과로 이미지 한 장만 반환하세요.
5. 결과 이미지를 PNG로 생성한 뒤 Base64로 인코딩하여 `data:image/png;base64,...` 형식의 문자열만 응답하세요.
6. 텍스트 설명은 넣지 마세요.
""".strip()

    tools = [Tool(url_context={})]
    config = GenerateContentConfig(tools=tools)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=config,
    )

    image_bytes = extract_image_bytes(response)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"url_context_result_{int(time.time())}.png"
    output_path.write_bytes(image_bytes)
    print(f"[OK] 결과 이미지 저장: {output_path}")

    metadata = getattr(response.candidates[0], "url_context_metadata", None)
    if metadata:
        print("모델이 참고한 URL:")
        for item in metadata:
            print(f"- {item.get('url')}")


if __name__ == "__main__":
    main()
