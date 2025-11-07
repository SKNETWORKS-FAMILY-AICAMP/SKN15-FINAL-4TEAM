import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
} from "../api/projectAPI";
import "./MyPage.css";

function MyPage() {
  const { user, updateUserContext } = useAuth();
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [profileMessage, setProfileMessage] = useState(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  useEffect(() => {
    if (!user?.user_id) {
      return;
    }

    let isMounted = true;
    setIsProfileLoading(true);
    setProfileError(null);

    getUserProfile(user.user_id)
      .then((data) => {
        if (!isMounted) return;
        setName(data.name || "");
        setRole(data.role || "");
      })
      .catch((error) => {
        if (!isMounted) return;
        const message = error.response?.data?.error || "프로필 정보를 불러오지 못했습니다.";
        setProfileError(message);
      })
      .finally(() => {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user?.user_id]);

  if (!user?.user_id) {
    return (
      <main className="mypage-container">
        <div className="mypage-card">
          <p>로그인이 필요합니다.</p>
        </div>
      </main>
    );
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileMessage(null);
    setProfileError(null);

    try {
      const res = await updateUserProfile(user.user_id, { name: name.trim() });
      setProfileMessage(res.message || "프로필이 업데이트되었습니다.");
      updateUserContext({ name: res.name });
    } catch (error) {
      const message = error.response?.data?.error || "프로필을 업데이트하지 못했습니다.";
      setProfileError(message);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      setPasswordError("모든 비밀번호 입력란을 채워주세요.");
      return;
    }

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsPasswordLoading(true);
    try {
      const res = await changeUserPassword(user.user_id, {
        current_password: passwordForm.current,
        new_password: passwordForm.next,
        confirm_password: passwordForm.confirm,
      });
      setPasswordMessage(res.message || "비밀번호가 변경되었습니다.");
      setPasswordForm({
        current: "",
        next: "",
        confirm: "",
      });
    } catch (error) {
      const message = error.response?.data?.error || "비밀번호를 변경하지 못했습니다.";
      setPasswordError(message);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handlePasswordInputChange = (event) => {
    const { name: field, value } = event.target;
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <main className="mypage-container">
      <motion.section
        className="mypage-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <header className="mypage-header">
          <h1>마이 페이지</h1>
          <p>계정 정보를 확인하고 비밀번호를 변경할 수 있습니다.</p>
        </header>

        <div className="mypage-grid">
          <form className="mypage-panel" onSubmit={handleProfileSubmit}>
            <h2>프로필 정보</h2>
            {isProfileLoading ? (
              <p className="mypage-status">프로필 정보를 불러오는 중...</p>
            ) : (
              <>
                <div className="form-row">
                  <label htmlFor="userId">아이디</label>
                  <input id="userId" value={user.user_id} readOnly />
                </div>
                <div className="form-row">
                  <label htmlFor="displayName">이름</label>
                  <input
                    id="displayName"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="이름을 입력하세요"
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="role">권한</label>
                  <input id="role" value={role} readOnly />
                </div>
                <button type="submit" className="mypage-primary">
                  변경 사항 저장
                </button>
                {profileMessage && <p className="mypage-message success">{profileMessage}</p>}
                {profileError && <p className="mypage-message error">{profileError}</p>}
              </>
            )}
          </form>

          <form className="mypage-panel" onSubmit={handlePasswordChange}>
            <h2>비밀번호 변경</h2>
            <div className="form-row">
              <label htmlFor="currentPassword">현재 비밀번호</label>
              <input
                id="currentPassword"
                type="password"
                name="current"
                value={passwordForm.current}
                onChange={handlePasswordInputChange}
                placeholder="현재 비밀번호"
              />
            </div>
            <div className="form-row">
              <label htmlFor="newPassword">새 비밀번호</label>
              <input
                id="newPassword"
                type="password"
                name="next"
                value={passwordForm.next}
                onChange={handlePasswordInputChange}
                placeholder="새 비밀번호"
              />
            </div>
            <div className="form-row">
              <label htmlFor="confirmPassword">새 비밀번호 확인</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirm"
                value={passwordForm.confirm}
                onChange={handlePasswordInputChange}
                placeholder="새 비밀번호 확인"
              />
            </div>
            <button type="submit" className="mypage-primary" disabled={isPasswordLoading}>
              {isPasswordLoading ? "변경 중..." : "비밀번호 변경"}
            </button>
            {passwordMessage && <p className="mypage-message success">{passwordMessage}</p>}
            {passwordError && <p className="mypage-message error">{passwordError}</p>}
          </form>
        </div>
      </motion.section>
    </main>
  );
}

export default MyPage;
