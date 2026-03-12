from __future__ import annotations

import logging
from typing import Any

from google import genai

from app.core.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash") -> None:
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not configured")
        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name

    def generate_text(self, prompt: str) -> str:
        if not prompt.strip():
            raise ValueError("Prompt must not be empty")

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
        )

        direct_text = getattr(response, "text", None)
        if isinstance(direct_text, str) and direct_text.strip():
            return direct_text.strip()

        # Fallback parsing for SDK responses that do not populate response.text.
        candidates = getattr(response, "candidates", None) or []
        for candidate in candidates:
            content = getattr(candidate, "content", None)
            parts = getattr(content, "parts", None) or []
            fragments: list[str] = []
            for part in parts:
                part_text = getattr(part, "text", None)
                if isinstance(part_text, str) and part_text.strip():
                    fragments.append(part_text.strip())
            if fragments:
                return "\n".join(fragments)

        logger.warning("Gemini returned an empty response body")
        raise RuntimeError("Gemini returned an empty response")


_gemini_service: GeminiService | None = None


def get_gemini_service() -> GeminiService:
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService(api_key=settings.GEMINI_API_KEY)
    return _gemini_service
