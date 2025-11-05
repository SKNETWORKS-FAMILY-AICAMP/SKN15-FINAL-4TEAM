// ✅ NewProjectModal.js (수정 버전)
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
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
    emptyRoom: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 입력값 변경
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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

    const user_id = localStorage.getItem("user_id") || "guest";

    try {
      const formData = new FormData();

      // ✅ 백엔드 컬럼명에 맞게 key 변경
      formData.append("user_id", user_id);
      formData.append("title", title);
      formData.append("residence_type", form.type);
      formData.append("space_type", form.space);
      formData.append("budget_range", form.budget);
      formData.append("family_type", form.family);
      formData.append("design_style", form.style);
      if (form.image) formData.append("image", form.image);

      const response = await axios.post(
        "http://127.0.0.1:8000/api/projects/create/",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 5000,
        }
      );

      console.log("✅ 프로젝트 생성 성공:", response.data);
      alert("프로젝트가 성공적으로 생성되었습니다!");
      if (onCreated) {
        onCreated();
      } else if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("❌ 프로젝트 생성 실패:", error.response?.data || error);

      // 백엔드 서버가 없는 경우 로컬 저장소에 임시 저장
      if (error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED") {
        console.log("⚠️ 백엔드 서버가 실행되지 않았습니다. 로컬에 임시 저장합니다.");

        const project = {
          id: Date.now(),
          userId: user_id,
          title,
          type: form.type,
          space: form.space,
          budget: form.budget,
          family: form.family,
          style: form.style,
          imagePreview: form.imagePreview,
          createdAt: new Date().toISOString(),
          status: "진행중"
        };

        // 로컬 스토리지에 저장
        const existingProjects = JSON.parse(localStorage.getItem("projects") || "[]");
        existingProjects.push(project);
        localStorage.setItem("projects", JSON.stringify(existingProjects));

        alert("백엔드 서버가 실행되지 않아 프로젝트를 임시로 로컬에 저장했습니다.\n\n백엔드 서버를 실행하려면:\npython manage.py runserver");

        if (onCreated) {
          onCreated();
        } else if (onClose) {
          onClose();
        }
      } else {
        alert("프로젝트 생성 중 오류가 발생했습니다.\n\n" + (error.response?.data?.message || error.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
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

              <label className="checkbox">
                <input
                  type="checkbox"
                  name="emptyRoom"
                  checked={form.emptyRoom}
                  onChange={handleChange}
                />
                빈 방인가요?
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
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default NewProjectModal;
