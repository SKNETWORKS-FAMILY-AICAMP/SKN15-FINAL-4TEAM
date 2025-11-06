// src/api/projectAPI.js
import axios from "axios";

/**
 * 환경에 따라 API base URL 자동 결정
 * - 개발 환경: http://localhost:8000/api
 * - 배포 환경 (Docker+Nginx): /api
 * - 환경변수 REACT_APP_API_BASE 가 있으면 그 값 사용
 */
const getApiBase = () => {
  // ✅ 1. 환경변수로 명시된 경우 (가장 우선)
  if (process.env.REACT_APP_API_BASE) {
    return process.env.REACT_APP_API_BASE;
  }

  // ✅ 2. 개발 환경 (npm start)
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:8000/api";
  }

  // ✅ 3. 배포 환경 (Nginx reverse proxy)
  return "/api";
};

const API_BASE = getApiBase();

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 240000, // 기본 타임아웃 (이미지 생성 등)
});

/* ------------------ 🧩 사용자 / 인증 관련 ------------------ */

// ✅ 회원가입
export const registerUser = async (user_id, password, extraFields = {}) => {
  const res = await api.post("/register/", { user_id, password, ...extraFields });
  return res.data;
};

// ✅ 로그인
export const loginUser = async (user_id, password) => {
  const res = await api.post("/login/", { user_id, password });
  return res.data;
};

/* ------------------ 🧩 프로젝트 관련 ------------------ */

// ✅ 프로젝트 생성
export const createProject = async (formData) => {
  const res = await api.post("/projects/create/", formData, { timeout: 240000 });
  return res.data;
};

// ✅ 사용자별 프로젝트 목록 조회
export const getProjects = async (user_id) => {
  const res = await api.get(`/projects/${user_id}/`);
  return res.data;
};

// ✅ 프로젝트 이미지 목록 조회
export const getProjectAiImages = async (project_id) => {
  const res = await api.get(`/projects/${project_id}/ai-images/`);
  return res.data;
};

// ✅ 프로젝트 이미지 부분 수정
export const refineProjectImage = async (project_id, image_id, refinement_prompt) => {
  const res = await api.post(
    `/projects/${project_id}/ai-images/${image_id}/refine/`,
    { refinement_prompt },
    { timeout: 180000 }
  );
  return res.data;
};

// ✅ 프로젝트 상태 변경
export const updateProjectStatus = async (project_id, newStatus) => {
  const res = await api.patch(`/projects/${project_id}/update/`, { status: newStatus });
  return res.data;
};

// ✅ 통계 조회
export const getStats = async (user_id) => {
  try {
    const res = await api.get(`/projects/${user_id}/stats/`);
    return res.data;
  } catch (error) {
    console.error("❌ 통계 조회 실패:", error.response?.data || error);
    return { total_projects: 0, in_progress: 0, completed: 0, recent_increase: 0 };
  }
};

/* ------------------ 🧩 관리자 기능 ------------------ */

// ✅ 가입 대기자 조회
export const adminGetPendingUsers = async (adminId, statusFilter = "pending") => {
  const res = await api.get(`/admin/pending-users/`, {
    params: { admin_id: adminId, ...(statusFilter ? { status: statusFilter } : {}) },
  });
  return res.data;
};

// ✅ 가입 승인
export const adminApprovePendingUser = async (adminId, pendingId) => {
  const res = await api.patch(`/admin/pending-users/${pendingId}/approve/`, {}, {
    params: { admin_id: adminId },
  });
  return res.data;
};

// ✅ 가입 거절
export const adminRejectPendingUser = async (adminId, pendingId, reason) => {
  const res = await api.patch(
    `/admin/pending-users/${pendingId}/reject/`,
    { reason },
    { params: { admin_id: adminId } }
  );
  return res.data;
};

// ✅ 가입 요청 삭제
export const adminDeletePendingUser = async (adminId, pendingId) => {
  const res = await api.delete(`/admin/pending-users/${pendingId}/`, {
    params: { admin_id: adminId },
  });
  return res.data;
};

// ✅ 등록된 사용자 목록
export const adminGetUsers = async (adminId) => {
  const res = await api.get(`/admin/users/`, { params: { admin_id: adminId } });
  return res.data;
};

// ✅ 사용자 삭제
export const adminDeleteUser = async (adminId, userId) => {
  const res = await api.delete(`/admin/users/${userId}/`, {
    params: { admin_id: adminId },
  });
  return res.data;
};
