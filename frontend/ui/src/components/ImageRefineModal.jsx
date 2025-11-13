import { useEffect, useMemo, useState } from "react";
import "./ImageRefineModal.css";

function ImageRefineModal({
  isOpen,
  concepts = [],
  activeIndex = 0,
  onClose,
  onSubmit,
  isSubmitting,
  errorMessage,
}) {
  const [index, setIndex] = useState(activeIndex);
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIndex(activeIndex);
      setPrompt("");
    }
  }, [isOpen, activeIndex]);

  const concept = useMemo(() => concepts[index] ?? null, [concepts, index]);

  if (!isOpen) {
    return null;
  }

  const total = concepts.length;

  const handlePrev = () => {
    if (total <= 1) return;
    setIndex((prev) => (prev - 1 + total) % total);
    setPrompt("");
  };

  const handleNext = () => {
    if (total <= 1) return;
    setIndex((prev) => (prev + 1) % total);
    setPrompt("");
  };

  const handleSubmit = () => {
    if (!prompt.trim() || !concept) return;
    if (onSubmit) {
      onSubmit(index, prompt.trim());
    }
  };

  return (
    <div className="refine-overlay">
      <div className="refine-modal">
        <div className="refine-header">
          <h2>{concept?.title || "AI 이미지"}</h2>
          <button
            type="button"
            className="refine-close"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ✕
          </button>
        </div>

        <div className="refine-body">
          <div className="refine-preview">
            <div className="refine-preview__frame">
              {concept?.imageUrl ? (
                <img src={concept.imageUrl} alt={concept.title} />
              ) : (
                <div className="refine-preview__placeholder">이미지를 불러올 수 없습니다.</div>
              )}
            </div>
            <div className="refine-preview__controls">
              <button
                type="button"
                onClick={handlePrev}
                disabled={total <= 1 || isSubmitting}
              >
                Prev
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={total <= 1 || isSubmitting}
              >
                Next
              </button>
            </div>
          </div>

          <div className="refine-form">
            <div className="refine-form__meta">
              <h3>{concept?.title || "선택된 이미지"}</h3>
              {concept?.description && <p>{concept.description}</p>}
              {concept?.catalogFurnitures?.length > 0 && (
                <div className="refine-form__catalog">
                  <span>사용 가구</span>
                  <ul>
                    {concept.catalogFurnitures.map((item, idx) => (
                      <li key={`${item.goods_id || idx}`}>
                        {item.name || item.goods_name || `가구 ${idx + 1}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <label className="refine-form__label" htmlFor="refine-prompt">
              수정할 사항을 입력하세요
            </label>
            <textarea
              id="refine-prompt"
              placeholder="예: 창가 쪽에 작은 화분을 추가하고, 벽 색상을 밝게 조정해줘."
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              disabled={isSubmitting}
              rows={5}
            />
            {errorMessage && <div className="refine-form__error">{errorMessage}</div>}
            <button
              type="button"
              className="refine-submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !prompt.trim() || !concept}
            >
              {isSubmitting ? "생성 중..." : "생성"}
            </button>
          </div>
        </div>

        {isSubmitting && (
          <div className="refine-spinner">
            <div className="global-loader">
              <div className="global-loader__spinner" aria-hidden="true" />
              <div className="global-loader__text">
                <p className="global-loader__title">수정 이미지를 생성 중입니다</p>
                <p className="global-loader__note">선택한 조건을 반영해 새 버전을 준비하고 있어요.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageRefineModal;
