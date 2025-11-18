from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from functools import lru_cache
from typing import List, Optional, Sequence

from django.core.exceptions import ImproperlyConfigured

from .catalog_poc_furniture_repository import FurnitureItem
from .sllm_client import generate_chat_completion, is_sllm_available

logger = logging.getLogger(__name__)

DEFAULT_SYSTEM_PROMPT = (
    "너는 한샘에서 활동하는 시니어 인테리어 디자이너이자 기획자이다. "
    "고객의 요구사항을 분석해 이미지 합성 모델이 이해할 수 있는 구체적인 가구 배치 지침을 작성하고, "
    "완성된 디자인을 고객에게 설명하는 짧은 메모도 함께 제안한다."
)

FALLBACK_VARIATION_IDEAS = [
    "다양한 색상의 가구를 사용하고 대칭적인 구도로 안정감을 표현한다.",
    "차분한 모노톤에 비대칭 배치를 조합해 모던한 긴장감을 준다.",
    "우드 톤과 식물을 중심으로 자연 친화적인 공간을 만든다.",
    "파스텔 톤과 소품을 활용해 부드럽고 따뜻한 인상을 만든다.",
    "강렬한 포인트 컬러를 한두 개 사용하고 나머지는 뉴트럴 톤으로 조화시킨다.",
    "미니멀한 가구를 최소한으로 배치해 여백의 미를 살린다.",
    "벨벳/리넨/가죽 등 다양한 텍스처를 섞어 풍부한 질감을 표현한다.",
    "빈티지 요소를 강조하고 독특한 소품으로 개성을 더한다.",
    "실용적인 수납가구를 중심으로 기능성과 스타일을 동시에 확보한다.",
]


@dataclass
class VariantPlan:
    instruction: str
    design_memo: Optional[str] = None
    product_names: List[str] = field(default_factory=list)


class DesignAdvisor:
    def __init__(self, system_prompt: str = DEFAULT_SYSTEM_PROMPT):
        self.system_prompt = system_prompt

    def plan_variant(
        self,
        *,
        style_prompt: str,
        variation_index: int,
        catalog_items: Optional[Sequence[FurnitureItem]] = None,
        catalog_instruction: str = "",
        use_catalog_furniture: bool = False,
    ) -> Optional[VariantPlan]:
        catalog_text = self._format_catalog_items(catalog_items or [])
        variation_label = variation_index + 1
        prompt = self._build_prompt(
            style_prompt=style_prompt,
            variation_label=variation_label,
            catalog_instruction=catalog_instruction,
            catalog_text=catalog_text,
            use_catalog=use_catalog_furniture,
        )

        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": prompt},
        ]

        try:
            raw = generate_chat_completion(
                messages,
                max_new_tokens=320,
                temperature=0.15,
                top_p=0.85,
                top_k=20,
            )
        except ImproperlyConfigured:
            raise
        except Exception as exc:  # pragma: no cover - defensive
            logger.warning("SLLM 변형 프롬프트 생성 실패(index=%s): %s", variation_label, exc)
            return None

        plan = self._parse_plan(raw)
        if plan:
            return plan

        fallback_memo = self._extract_fallback_memo(raw)
        if fallback_memo:
            logger.warning(
                "SLLM 응답 파싱 실패(index=%s) - 원문을 메모로 대체합니다.", variation_label
            )
            return VariantPlan(instruction="", design_memo=fallback_memo)

        logger.warning("SLLM 응답 파싱 실패(index=%s): %s", variation_label, raw)
        return None

    def _build_prompt(
        self,
        *,
        style_prompt: str,
        variation_label: int,
        catalog_instruction: str,
        catalog_text: str,
        use_catalog: bool,
    ) -> str:
        catalog_goal = "선택된 한샘 카탈로그 가구만 사용한다." if use_catalog else "필요하면 가구를 새롭게 생성한다."
        variation_reference = "\n".join(f"- {idea}" for idea in FALLBACK_VARIATION_IDEAS)
        return f"""
고객 요구 요약:
{style_prompt.strip() or '별도 설명 없음'}

카탈로그 활용 지침:
{catalog_instruction.strip() or '별다른 추가 지침 없음'}

참고 가구 목록:
{catalog_text or '선택된 가구 없음'}

Variation #{variation_label} 목표:
- {catalog_goal}
- 상단의 고객 요구사항을 그대로 반영한다.
- 필요하다면 아래 참조 아이디어를 적절히 변주한다.

참조 아이디어:
{variation_reference}

작성 규칙:
1. variation_instruction: 이미지 합성 모델에 전달할 구체적 가이드. 4문장 내외, 현실적인 배치/소재/색감을 명확히 지시.
2. design_memo: 고객에게 보여줄 설명. 3문장 내외, 존댓말, 추천 포인트와 예상 분위기를 요약. 마지막엔 반드시 `1)`, `2)` 형식으로 사용한 한샘몰 제품명을 번호 순서로 소개한다.
3. recommended_products: JSON 배열. design_memo에 적은 한샘몰 제품명을 그대로 최소 2개~최대 5개 담는다. 각 항목은 문자열만 허용.
4. 반드시 JSON 객체 **한 개만** 출력한다. JSON 바깥에는 여는/닫는 따옴표, 주석, 인사말, 설명문 등 어떤 텍스트도 추가하지 않는다.
5. 모든 문자열은 이스케이프된 줄바꿈(`\\n`)을 사용하고, 따옴표는 JSON 규칙에 맞게 `"` 로 감싼다.
6. design_memo 안에서도 존댓말과 번호 표기를 지키되, JSON 구조는 절대 변경하지 않는다.

응답 스키마(JSON 그대로 복사):
{{
  "variation_instruction": "...",
  "design_memo": "...",
  "recommended_products": ["...", "..."]
}}

위 스키마를 그대로 따르지 않으면 작업이 실패한다. JSON 외의 어떠한 설명도 출력하지 마라.
""".strip()

    @staticmethod
    def _format_catalog_items(items: Sequence[FurnitureItem]) -> str:
        lines: List[str] = []
        for item in items:
            lines.append(
                f"- {item.goods_name} (ID: {item.goods_id}, 분류: {item.big_cat or '-'} / {item.small_cat or '-'})"
            )
        return "\n".join(lines)

    @staticmethod
    def _normalize_response(raw_text: str) -> str:
        cleaned = raw_text.strip()
        if cleaned.startswith("```"):
            fenced = cleaned[3:]
            if fenced.lower().startswith("json"):
                fenced = fenced[4:]
            closing = fenced.find("```")
            cleaned = fenced[:closing] if closing != -1 else fenced
        return cleaned.strip()

    @staticmethod
    def _load_first_json(cleaned: str) -> Optional[dict]:
        decoder = json.JSONDecoder()
        stripped = cleaned.strip()
        if not stripped:
            return None

        def _try_payload(text: str) -> Optional[dict]:
            try:
                loaded = json.loads(text)
                if isinstance(loaded, dict):
                    return loaded
                return None
            except json.JSONDecodeError:
                try:
                    obj, _ = decoder.raw_decode(text)
                    if isinstance(obj, dict):
                        return obj
                except json.JSONDecodeError:
                    return None
            return None

        payload = _try_payload(stripped)
        if payload:
            return payload

        for idx, char in enumerate(stripped):
            if char != "{":
                continue
            fragment = stripped[idx:]
            payload = _try_payload(fragment)
            if payload:
                return payload
        return None

    @classmethod
    def _parse_plan(cls, raw_text: str) -> Optional[VariantPlan]:
        cleaned = cls._normalize_response(raw_text)
        payload = cls._load_first_json(cleaned)
        if not payload:
            return None

        instruction = (payload.get("variation_instruction") or payload.get("instruction") or "").strip()
        memo = (payload.get("design_memo") or payload.get("memo") or "").strip()
        if not instruction:
            return None

        product_names: List[str] = []
        raw_products = payload.get("recommended_products")
        if isinstance(raw_products, list):
            for item in raw_products:
                if isinstance(item, str):
                    normalized = item.strip()
                    if normalized:
                        product_names.append(normalized)

        return VariantPlan(
            instruction=instruction,
            design_memo=memo or None,
            product_names=product_names,
        )

    @classmethod
    def _extract_fallback_memo(cls, raw_text: str) -> Optional[str]:
        cleaned = cls._normalize_response(raw_text)
        if not cleaned:
            return None
        # 제거 가능한 JSON 헤더/푸터를 제외하고 텍스트만 반환
        if cleaned.startswith("{") and cleaned.endswith("}"):
            return None
        return cleaned


@lru_cache(maxsize=1)
def get_design_advisor() -> DesignAdvisor:
    if not is_sllm_available():
        raise ImproperlyConfigured("SLLM 모델이 구성되지 않았습니다.")
    return DesignAdvisor()
