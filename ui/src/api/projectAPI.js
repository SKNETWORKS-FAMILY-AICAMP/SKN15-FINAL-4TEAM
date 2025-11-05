// src/api/projectAPI.js
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api"; // Django 서버 주소

// ✅ 회원가입
export const registerUser = async (user_id, password) => {
  try {
    const res = await axios.post(`${API_BASE}/register/`, {
      user_id,
      password,
    });
    return res.data;
  } catch (error) {
    console.error("❌ 회원가입 실패:", error.response?.data || error);
    throw error;
  }
};

// ✅ 로그인
export const loginUser = async (user_id, password) => {
  try {
    const res = await axios.post(`${API_BASE}/login/`, {
      user_id,
      password,
    });
    return res.data; // ✅ 데이터만 반환
  } catch (error) {
    console.error("❌ 로그인 실패:", error.response?.data || error);
    throw error;
  }
};

// ✅ 프로젝트 생성
export const createProject = async (formData) => {
  try {
    const res = await axios.post(`${API_BASE}/projects/create/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (error) {
    console.error("❌ 프로젝트 생성 실패:", error.response?.data || error);
    throw error;
  }
};

// ✅ 사용자별 프로젝트 목록 조회
export const getProjects = async (user_id) => {
  try {
    const res = await axios.get(`${API_BASE}/projects/${user_id}/`);
    return res.data;
  } catch (error) {
    console.error("❌ 프로젝트 목록 조회 실패:", error.response?.data || error);
    throw error;
  }
};

// ✅ 프로젝트 상태 변경 (진행 중 / 완료 / 대기)
export const updateProjectStatus = async (project_id, newStatus) => {
  try {
    const res = await axios.patch(`${API_BASE}/projects/${project_id}/update/`, {
      status: newStatus,
    });
    return res.data;
  } catch (error) {
    console.error("❌ 상태 변경 실패:", error.response?.data || error);
    throw error;
  }
};

// ✅ 프로젝트 통계 조회 (대시보드)
export const getStats = async (user_id) => {
  try {
    const res = await axios.get(`${API_BASE}/projects/${user_id}/stats/`);
    return res.data;
  } catch (error) {
    console.error("❌ 통계 조회 실패:", error.response?.data || error);
    return { total_projects: 0, in_progress: 0, completed: 0, recent_increase: 0 };
  }
};

// ✅ 관리자: 가입 대기자 목록
export const adminGetPendingUsers = async (adminId, statusFilter = "pending") => {
  try {
    const res = await axios.get(`${API_BASE}/admin/pending-users/`, {
      params: {
        admin_id: adminId,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
    });
    return res.data;
  } catch (error) {
    console.error("❌ 가입 대기자 조회 실패:", error.response?.data || error);
    throw error;
  }
};

// ✅ 관리자: 가입 대기자 승인
export const adminApprovePendingUser = async (adminId, pendingId) => {
  try {
    const res = await axios.patch(`${API_BASE}/admin/pending-users/${pendingId}/approve/`, {}, {
      params: { admin_id: adminId },
    });
    return res.data;
  } catch (error) {
    console.error("❌ 가입 승인 실패:", error.response?.data || error);
    throw error;
  }
};

// ✅ 관리자: 가입 대기자 거절
export const adminRejectPendingUser = async (adminId, pendingId, reason) => {
  try {
    const res = await axios.patch(
      `${API_BASE}/admin/pending-users/${pendingId}/reject/`,
      { reason },
      {
        params: { admin_id: adminId },
      }
    );
    return res.data;
  } catch (error) {
    console.error("❌ 가입 거절 실패:", error.response?.data || error);
    throw error;
  }
};

// ✅ 관리자: 가입 대기자 삭제
export const adminDeletePendingUser = async (adminId, pendingId) => {
  try {
    const res = await axios.delete(`${API_BASE}/admin/pending-users/${pendingId}/`, {
      params: { admin_id: adminId },
    });
    return res.data;
  } catch (error) {
    console.error("❌ 가입 요청 삭제 실패:", error.response?.data || error);
    throw error;
  }
};

// ✅ 관리자: 등록된 사용자 목록
export const adminGetUsers = async (adminId) => {
  try {
    const res = await axios.get(`${API_BASE}/admin/users/`, {
      params: { admin_id: adminId },
    });
    return res.data;
  } catch (error) {
    console.error("❌ 사용자 목록 조회 실패:", error.response?.data || error);
    throw error;
  }
};

// ✅ 관리자: 사용자 계정 삭제
export const adminDeleteUser = async (adminId, userId) => {
  try {
    const res = await axios.delete(`${API_BASE}/admin/users/${userId}/`, {
      params: { admin_id: adminId },
    });
    return res.data;
  } catch (error) {
    console.error("❌ 사용자 삭제 실패:", error.response?.data || error);
    throw error;
  }
};
