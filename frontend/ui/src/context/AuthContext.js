import { createContext, useContext, useState, useEffect } from "react";
import { initializeAdminUser } from "../utils/initializeAdmin";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 로컬 스토리지에서 사용자 정보 로드
  useEffect(() => {
    // 초기 관리자 계정 생성
    initializeAdminUser();

    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // 회원가입된 사용자 목록 가져오기
  const getRegisteredUsers = () => {
    const users = localStorage.getItem("registeredUsers");
    return users ? JSON.parse(users) : [];
  };

  // 회원가입된 사용자 목록 저장하기
  const saveRegisteredUsers = (users) => {
    localStorage.setItem("registeredUsers", JSON.stringify(users));
  };

  // 사용자 존재 여부 확인
  const userExists = (username) => {
    const users = getRegisteredUsers();
    return users.some((u) => u.username === username);
  };

  // 로그인 함수
  const login = (username, password) => {
    // 회원가입된 사용자 목록에서 확인
    const users = getRegisteredUsers();
    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      // 승인 상태 확인
      if (foundUser.status === "pending") {
        return { success: false, error: "pendingApproval" };
      } else if (foundUser.status === "rejected") {
        return { success: false, error: "rejected" };
      } else if (foundUser.status === "approved") {
        const userData = {
          username: foundUser.username,
          email: foundUser.email,
          loginTime: new Date().toISOString(),
          role: foundUser.role || "user",
        };
        setUser(userData);
        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("user_id", foundUser.username); // user_id 저장
        return { success: true };
      } else {
        // 상태값이 없거나 다른 값인 경우 (기존 사용자 호환성)
        const userData = {
          username: foundUser.username,
          email: foundUser.email,
          loginTime: new Date().toISOString(),
          role: foundUser.role || "user",
        };
        setUser(userData);
        localStorage.setItem("currentUser", JSON.stringify(userData));
        localStorage.setItem("user_id", foundUser.username); // user_id 저장
        return { success: true };
      }
    } else if (users.some((u) => u.username === username)) {
      // 아이디는 존재하지만 비밀번호가 틀림
      return { success: false, error: "wrongPassword" };
    }

    // 아이디가 존재하지 않음
    return { success: false, error: "userNotFound" };
  };

  // 로그아웃 함수
  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("user_id");
  };

  // 회원가입 함수 (관리자 승인 대기 상태로 저장)
  const register = (username, email, password) => {
    const users = getRegisteredUsers();

    // 이미 존재하는 아이디 확인
    if (users.some((u) => u.username === username)) {
      return { success: false, error: "userExists" };
    }

    // 이미 존재하는 이메일 확인
    if (users.some((u) => u.email === email)) {
      return { success: false, error: "emailExists" };
    }

    // 새 사용자 추가 (승인 대기 상태)
    const newUser = {
      username: username,
      email: email,
      password: password, // 실제로는 암호화해야 함
      status: "pending", // pending, approved, rejected
      registeredAt: new Date().toISOString(),
      approvedAt: null,
      approvedBy: null,
    };

    users.push(newUser);
    saveRegisteredUsers(users);

    // 승인 대기 상태이므로 자동 로그인 안 함
    return { success: true, pending: true };
  };

  // 관리자: 사용자 승인
  const approveUser = (username) => {
    const users = getRegisteredUsers();
    const userIndex = users.findIndex((u) => u.username === username);

    if (userIndex !== -1) {
      users[userIndex].status = "approved";
      users[userIndex].approvedAt = new Date().toISOString();
      users[userIndex].approvedBy = user?.username || "admin";
      saveRegisteredUsers(users);
      return true;
    }
    return false;
  };

  // 관리자: 사용자 거부
  const rejectUser = (username) => {
    const users = getRegisteredUsers();
    const userIndex = users.findIndex((u) => u.username === username);

    if (userIndex !== -1) {
      users[userIndex].status = "rejected";
      saveRegisteredUsers(users);
      return true;
    }
    return false;
  };

  // 대기 중인 사용자 목록 가져오기
  const getPendingUsers = () => {
    const users = getRegisteredUsers();
    return users.filter((u) => u.status === "pending");
  };

  // 모든 사용자 목록 가져오기
  const getAllUsers = () => {
    return getRegisteredUsers();
  };

  // 관리자: 사용자 삭제
  const deleteUser = (username) => {
    // admin 계정은 삭제할 수 없음
    if (username === "admin") {
      return { success: false, error: "cannotDeleteAdmin" };
    }

    const users = getRegisteredUsers();
    const userIndex = users.findIndex((u) => u.username === username);

    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      saveRegisteredUsers(users);
      return { success: true };
    }
    return { success: false, error: "userNotFound" };
  };

  const value = {
    user,
    login,
    logout,
    register,
    userExists,
    approveUser,
    rejectUser,
    getPendingUsers,
    getAllUsers,
    deleteUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
