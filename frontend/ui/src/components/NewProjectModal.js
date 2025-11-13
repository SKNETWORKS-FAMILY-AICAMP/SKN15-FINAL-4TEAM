// ✅ NewProjectModal.js (수정 버전)
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createProject } from "../api/projectAPI";
import "./NewProjectModal.css";

function NewProjectModal({ onClose, onCreated }) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState("새 프로젝트 생성");
  const [form, setForm] = useState({
    image: null,
    imagePreview: null,
    type: "",
    space: "",
    budget: "",
    family: "",
    style: "",
    refinement: "",
    emptyRoom: false,
    useCatalogFurniture: false,
    variations: 3,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineResult, setPipelineResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const pipelineImageCount =
    pipelineResult?.count ?? pipelineResult?.images?.length ?? 0;
  const pipelineWarnings = pipelineResult?.warnings ?? [];
  const pipelineStatusText = (() => {
    if (!pipelineResult) return "";
    if (pipelineResult.status === "completed") {
      return `AI 이미지 ${pipelineImageCount}개가 생성되었습니다.`;
    }
    if (pipelineResult.status === "partial") {
      const warning = pipelineWarnings[0]
        ? ` (일부 변형이 실패했습니다: ${pipelineWarnings[0]})`
        : "";
      return `AI 이미지 ${pipelineImageCount}개가 생성되었습니다.${warning}`;
    }
    if (pipelineResult.status === "failed") {
      return `AI 생성이 실패했습니다: ${pipelineResult.reason}`;
    }
    if (pipelineResult.reason) {
      return `AI 생성이 건너뛰어졌습니다: ${pipelineResult.reason}`;
    }
    return "AI 생성이 건너뛰어졌습니다.";
  })();

  // ✅ 입력값 변경
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "variations") {
      const numeric = Math.min(9, Math.max(1, Number(value) || 1));
      setForm({ ...form, variations: numeric });
      return;
    }
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  // ✅ 이미지 업로드
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({
      ...form,
      image: file,
      imagePreview: URL.createObjectURL(file),
    });
  };

  const handleImageRemove = () =>
    setForm({ ...form, image: null, imagePreview: null });

  // ✅ 프로젝트 생성 요청
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setPipelineResult(null);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      const user_id = localStorage.getItem("user_id");

      // ✅ 백엔드 컬럼명에 맞게 key 변경
      formData.append("user_id", user_id);
      formData.append("title", title);
      formData.append("residence_type", form.type);
      formData.append("space_type", form.space);
      formData.append("budget_range", form.budget);
      formData.append("family_type", form.family);
      formData.append("design_style", form.style);
      formData.append("refinement_prompt", form.refinement);
      formData.append("image_variations", String(form.variations || 3));
      formData.append("empty_room", form.emptyRoom ? "true" : "false");
      formData.append("use_catalog_furniture", form.useCatalogFurniture ? "true" : "false");
      if (form.image) formData.append("image", form.image);
      else {
        setErrorMessage("원본 이미지를 업로드해 주세요.");
        setIsLoading(false);
        return;
      }

      const result = await createProject(formData);

      setPipelineResult(result.pipeline);
      onCreated?.(result);
    } catch (error) {
      console.error("❌ 프로젝트 생성 실패:", error.response?.data || error);
      const message =
        error.response?.data?.pipeline?.reason ||
        error.response?.data?.error ||
        "프로젝트 생성 중 오류가 발생했습니다.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isBlocked = isLoading;
  const variationCountText = `${form.variations || 1}개의 인테리어 이미지를 생성 중입니다.`;

  return (
    <AnimatePresence>
      <motion.div
        className={`modal-overlay ${isBlocked ? "is-loading" : ""}`}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <button className="modal-close" onClick={onClose}>✕</button>

          {/* 제목 */}
          <div className="modal-header">
            {isEditingTitle ? (
              <input
                className="title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                autoFocus
              />
            ) : (
              <h2 onClick={() => setIsEditingTitle(true)}>{title} ✏️</h2>
            )}
          </div>

          <form onSubmit={handleSubmit} className="new-project-form">
            {/* ✅ 이미지 업로드 영역 */}
            <div className="image-upload">
              {form.imagePreview ? (
                <div className="image-preview-container">
                  <img
                    src={form.imagePreview}
                    alt="preview"
                    className="uploaded-image"
                  />
                  <button
                    type="button"
                    className="image-remove"
                    onClick={handleImageRemove}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label htmlFor="imageUpload" className="upload-label">
                  <i className="fas fa-cloud-upload-alt"></i> 이미지 업로드
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>

            {/* 우측 폼 */}
            <div className="form-right">
              {[
                { label: "주거유형", name: "type", placeholder: "예: 아파트" },
                { label: "공간", name: "space", placeholder: "예: 거실" },
                { label: "예산", name: "budget", placeholder: "예: 300만원" },
                { label: "가족유형", name: "family", placeholder: "예: 신혼부부" },
                { label: "스타일", name: "style", placeholder: "예: 미니멀리즘" },
              ].map((f, i) => (
                <div key={i} className="form-group">
                  <label>{f.label}</label>
                  <input
                    name={f.name}
                    value={form[f.name]}
                    onChange={handleChange}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}

              <div className="form-group">
                <label>세부 수정 요청</label>
                <textarea
                  name="refinement"
                  value={form.refinement}
                  onChange={handleChange}
                  placeholder="추가로 반영하고 싶은 사항이 있으면 입력하세요. (예: 오른쪽 벽에 액자를 걸어주세요)"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>생성할 시안 개수 (1~9)</label>
                <input
                  type="number"
                  name="variations"
                  min="1"
                  max="9"
                  value={form.variations}
                  onChange={handleChange}
                />
                <p className="field-help">
                  한 번에 생성할 AI 이미지 수를 선택하세요. 최대 9개까지 가능합니다.
                </p>
              </div>

              <label className="checkbox">
                <input
                  type="checkbox"
                  name="emptyRoom"
                  checked={form.emptyRoom}
                  onChange={handleChange}
                />
                빈 방인가요?
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="useCatalogFurniture"
                  checked={form.useCatalogFurniture}
                  onChange={handleChange}
                />
                한샘 가구만 사용하기
              </label>

              <motion.button
                type="submit"
                className="submit-btn"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? "생성 중..." : "프로젝트 생성"}
              </motion.button>

              {errorMessage && (
                <div className="status-message error">{errorMessage}</div>
              )}

          {pipelineResult && (
            <div
              className={`status-message ${
                pipelineResult.status === "failed" ? "error" : "success"
              }`}
            >
              <p>{pipelineStatusText}</p>
              {pipelineWarnings.length > 1 && pipelineResult.status !== "failed" && (
                <ul className="status-message__warnings">
                  {pipelineWarnings.map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                </ul>
              )}
              {pipelineResult.preview_url && pipelineResult.status !== "failed" && (
                <img
                  src={pipelineResult.preview_url}
                  alt="AI 결과물"
                  className="result-image"
                />
              )}
            </div>
          )}
        </div>
      </form>
      {isLoading && (
        <div className="global-loader-overlay" role="status" aria-live="polite">
          <div className="global-loader">
            <div className="global-loader__spinner" aria-hidden="true" />
            <div className="global-loader__text">
              <p className="global-loader__title">{variationCountText}</p>
              <p className="global-loader__note">조금만 기다리시면 결과가 나타납니다.</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  </motion.div>
</AnimatePresence>
  );
}

export default NewProjectModal;
