import json
import logging
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Optional

import numpy as np
import torch
from PIL import Image
from torch import nn
from torch.nn.functional import normalize
from torchvision import transforms
from torchvision.models import efficientnet_b0

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parents[2]
ROOM_CLEAR_DIR = BACKEND_DIR / "room_clear"
MODEL_PATH = ROOM_CLEAR_DIR / "room_model.pth"
PROTOTYPE_PATH = ROOM_CLEAR_DIR / "prototype_mu.npy"
THRESHOLD_PATH = ROOM_CLEAR_DIR / "threshold.json"

IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)


class _EfficientNetFeatureExtractor(nn.Module):
    """EfficientNet-B0 backbone that returns a flattened 1280-d embedding."""

    def __init__(self, state_dict: "OrderedDict[str, torch.Tensor]") -> None:
        super().__init__()
        backbone = efficientnet_b0(weights=None)
        backbone.classifier = nn.Identity()
        missing, unexpected = backbone.load_state_dict(state_dict, strict=False)
        if unexpected:
            logger.warning(
                "RoomClear model load: unexpected keys (%d): %s",
                len(unexpected),
                sorted(list(unexpected))[:5],
            )
        if missing:
            logger.warning(
                "RoomClear model load: missing keys (%d): %s",
                len(missing),
                sorted(list(missing))[:5],
            )
        if not missing and not unexpected:
            logger.info("RoomClear model weights loaded successfully.")
        self.backbone = backbone
        self.avgpool = nn.AdaptiveAvgPool2d(1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:  # type: ignore[override]
        with torch.no_grad():
            feats = self.backbone.features(x)
            pooled = self.avgpool(feats)
            flattened = torch.flatten(pooled, 1)
        return flattened


@dataclass(frozen=True)
class RoomDetectionResult:
    score: float
    threshold: float

    @property
    def is_room(self) -> bool:
        return self.score >= self.threshold


class RoomClearDetector:
    """Heuristic detector that flags already-empty rooms."""

    def __init__(
        self,
        model_path: Path = MODEL_PATH,
        prototype_path: Path = PROTOTYPE_PATH,
        threshold_path: Path = THRESHOLD_PATH,
        device: Optional[str] = None,
    ) -> None:
        if not model_path.exists():
            raise FileNotFoundError(f"Room model not found: {model_path}")
        if not prototype_path.exists():
            raise FileNotFoundError(f"Prototype data not found: {prototype_path}")
        if not threshold_path.exists():
            raise FileNotFoundError(f"Threshold file not found: {threshold_path}")

        state = torch.load(model_path, map_location="cpu")
        self.device = torch.device(device or ("cuda" if torch.cuda.is_available() else "cpu"))

        self.model = _EfficientNetFeatureExtractor(state).to(self.device).eval()
        prototype = np.load(prototype_path).astype("float32")
        proto_tensor = torch.from_numpy(prototype).view(1, -1)
        self.prototype = normalize(proto_tensor, dim=1).to(self.device)

        with threshold_path.open("r", encoding="utf-8") as file:
            payload = json.load(file)
        self.threshold = float(payload.get("tau", 0.0))

        self.transform = transforms.Compose(
            [
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD),
            ]
        )

    def _preprocess(self, image_path: str) -> torch.Tensor:
        with Image.open(image_path) as source:
            tensor = self.transform(source.convert("RGB"))
        return tensor.unsqueeze(0).to(self.device)

    def compute_score(self, image_path: str) -> float:
        tensor = self._preprocess(image_path)
        embedding = self.model(tensor)
        embedding = normalize(embedding, dim=1)
        score = torch.sum(embedding * self.prototype, dim=1)
        return float(score.item())

    def evaluate(self, image_path: str) -> RoomDetectionResult:
        score = self.compute_score(image_path)
        return RoomDetectionResult(score=score, threshold=self.threshold)

    def is_room_image(self, image_path: str) -> bool:
        return self.evaluate(image_path).is_room


@lru_cache(maxsize=1)
def get_room_clear_detector() -> Optional[RoomClearDetector]:
    try:
        detector = RoomClearDetector()
        logger.info(
            "RoomClearDetector loaded (threshold=%.4f, device=%s)",
            detector.threshold,
            detector.device,
        )
        return detector
    except FileNotFoundError as exc:
        logger.warning("RoomClearDetector unavailable: %s", exc)
        return None
    except Exception as exc:  # pragma: no cover - defensive
        logger.exception("Failed to initialize RoomClearDetector: %s", exc)
        return None


__all__ = [
    "RoomClearDetector",
    "RoomDetectionResult",
    "get_room_clear_detector",
]
