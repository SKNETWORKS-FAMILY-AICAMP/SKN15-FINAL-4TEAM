import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resetPassword } from "../api/projectAPI";
import "../App.css";

function LoginPage() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [resetErrorMessage, setResetErrorMessage] = useState("");
  const [resetSuccessMessage, setResetSuccessMessage] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setResetErrorMessage("");
    setResetSuccessMessage("");
    setIsResettingPassword(false);
  };

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    const result = await login(username, password);

    if (result.success) {
      alert(`${result.user?.name || username}님 환영합니다!`);
      navigate("/projects");
    } else {
      alert("로그인 실패. 아이디 또는 비밀번호를 확인해주세요.");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetErrorMessage("");
    setResetSuccessMessage("");

    const formData = new FormData(e.target);
    const userId = formData.get("forgotUserId")?.trim();
    const email = formData.get("forgotEmail")?.trim();
    const newPassword = formData.get("forgotNewPassword") || "";
    const confirmPassword = formData.get("forgotConfirmPassword") || "";

    if (!userId || !email) {
      setResetErrorMessage("아이디와 이메일을 모두 입력해 주세요.");
      return;
    }

    if (newPassword.length < 8) {
      setResetErrorMessage("새 비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetErrorMessage("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setIsResettingPassword(true);
      await resetPassword({
        user_id: userId,
        email,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setResetSuccessMessage("새 비밀번호가 설정되었습니다. 새 비밀번호로 로그인해 주세요.");
      e.target.reset();
      setTimeout(() => {
        closeForgotPasswordModal();
      }, 1500);
    } catch (error) {
      const message =
        error.response?.data?.error ||
        "비밀번호 재설정 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
      setResetErrorMessage(message);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const username = e.target.regUsername.value;
    const email = e.target.regEmail.value;
    const password = e.target.regPassword.value;
    const confirmPassword = e.target.regConfirmPassword.value;

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 8) {
      alert("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    const result = await register(username, email, password);

    if (result.success && result.pending) {
      alert("회원가입 신청이 완료되었습니다!\n관리자 승인 후 로그인이 가능합니다.");
      setShowRegister(false);
    } else if (result.error === "userExists") {
      alert("이미 존재하는 아이디입니다.\n다른 아이디를 사용해주세요.");
    } else if (result.error === "emailExists") {
      alert("이미 등록된 이메일입니다.");
    } else {
      alert("회원가입 실패. 다시 시도해주세요.");
    }
  };

  return (
    <main
      style={{
        padding: "0",
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
          opacity: 0.3,
        }}
      />

      {/* Floating Elements */}
      <motion.div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          top: "-100px",
          left: "-100px",
          filter: "blur(60px)",
        }}
        animate={{
          y: [0, 30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          bottom: "-50px",
          right: "-50px",
          filter: "blur(60px)",
        }}
        animate={{
          y: [0, -30, 0],
          x: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Login Container */}
      <motion.div
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          padding: "50px 40px",
          borderRadius: "25px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          width: "100%",
          maxWidth: "450px",
          position: "relative",
          zIndex: 1,
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        {/* Logo/Title */}
        <motion.div
          style={{
            textAlign: "center",
            marginBottom: "40px",
          }}
          variants={fadeUp}
        >
          <motion.div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 20px",
              background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 30px rgba(255, 107, 53, 0.4)",
              fontSize: "2.8em",
              fontWeight: 900,
              color: "#fff",
            }}
            whileHover={{ rotate: 360, scale: 1.05 }}
            transition={{ duration: 0.6 }}
          >
            A
          </motion.div>
          <h1
            style={{
              fontSize: "2.2em",
              fontWeight: 800,
              margin: "0 0 10px",
              background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Assemble
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "1em", margin: 0 }}>
            AI 인테리어 디자인 플랫폼
          </p>
        </motion.div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <motion.div
            style={{ marginBottom: "25px" }}
            variants={fadeUp}
          >
            <label
              htmlFor="username"
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "0.95em",
              }}
            >
              아이디
            </label>
            <input
              type="text"
              id="username"
              placeholder="아이디를 입력하세요"
              required
              style={{
                width: "100%",
                padding: "14px 18px",
                border: "2px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                fontSize: "1em",
                boxSizing: "border-box",
                transition: "all 0.3s ease",
                fontFamily: "inherit",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#ff6b35";
                e.target.style.boxShadow = "0 0 0 4px rgba(255, 107, 53, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.target.style.boxShadow = "none";
              }}
            />
          </motion.div>

          <motion.div
            style={{ marginBottom: "30px" }}
            variants={fadeUp}
          >
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "10px",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: "0.95em",
              }}
            >
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              placeholder="비밀번호를 입력하세요"
              required
              style={{
                width: "100%",
                padding: "14px 18px",
                border: "2px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                fontSize: "1em",
                boxSizing: "border-box",
                transition: "all 0.3s ease",
                fontFamily: "inherit",
                background: "rgba(255, 255, 255, 0.05)",
                color: "#fff",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#ff6b35";
                e.target.style.boxShadow = "0 0 0 4px rgba(255, 107, 53, 0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                e.target.style.boxShadow = "none";
              }}
            />
          </motion.div>

          <motion.button
            type="submit"
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "1.1em",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 10px 25px rgba(255, 107, 53, 0.3)",
              transition: "all 0.3s ease",
            }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 15px 35px rgba(255, 107, 53, 0.4)",
            }}
            whileTap={{ scale: 0.98 }}
            variants={fadeUp}
          >
            로그인
          </motion.button>
        </form>

        {/* Login Options */}
        <motion.div
          style={{
            marginTop: "30px",
            textAlign: "center",
            fontSize: "0.95em",
            color: "rgba(255, 255, 255, 0.6)",
          }}
          variants={fadeUp}
        >
          <button
            type="button"
            onClick={() => {
              setResetErrorMessage("");
              setResetSuccessMessage("");
              setShowForgotPassword(true);
            }}
            style={{
              color: "#ff6b35",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              margin: "0 10px",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#ff8c5a")}
            onMouseLeave={(e) => (e.target.style.color = "#ff6b35")}
          >
            비밀번호 찾기
          </button>
          <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>|</span>
          <button
            type="button"
            onClick={() => {
              setShowRegister(true);
            }}
            style={{
              color: "#ff6b35",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              margin: "0 10px",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#ff8c5a")}
            onMouseLeave={(e) => (e.target.style.color = "#ff6b35")}
          >
            회원가입
          </button>
        </motion.div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1001,
              backdropFilter: "blur(5px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeForgotPasswordModal}
          >
            <motion.div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                padding: "40px",
                borderRadius: "25px",
                width: "90%",
                maxWidth: "500px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                position: "relative",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeForgotPasswordModal}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "none",
                  border: "none",
                  fontSize: "1.8em",
                  color: "rgba(255, 255, 255, 0.5)",
                  cursor: "pointer",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "rgba(255, 255, 255, 0.5)")}
              >
                &times;
              </button>

              <h2
                style={{
                  fontSize: "1.8em",
                  fontWeight: 700,
                  color: "#fff",
                  marginTop: 0,
                  marginBottom: "30px",
                  textAlign: "center",
                }}
              >
                비밀번호 찾기
              </h2>

              <form onSubmit={handleForgotPassword}>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    htmlFor="forgotUserId"
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    아이디
                  </label>
                  <input
                    type="text"
                    id="forgotUserId"
                    name="forgotUserId"
                    placeholder="아이디를 입력하세요"
                    required
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      border: "2px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      fontSize: "1em",
                      boxSizing: "border-box",
                      transition: "all 0.3s ease",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "#fff",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ff6b35";
                      e.target.style.boxShadow = "0 0 0 4px rgba(255, 107, 53, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    htmlFor="forgotEmail"
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    가입 시 사용한 이메일
                  </label>
                  <input
                    type="email"
                    id="forgotEmail"
                    name="forgotEmail"
                    placeholder="이메일 주소를 입력하세요"
                    required
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      border: "2px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      fontSize: "1em",
                      boxSizing: "border-box",
                      transition: "all 0.3s ease",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "#fff",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ff6b35";
                      e.target.style.boxShadow = "0 0 0 4px rgba(255, 107, 53, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    htmlFor="forgotNewPassword"
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    id="forgotNewPassword"
                    name="forgotNewPassword"
                    placeholder="새 비밀번호를 입력하세요 (8자 이상)"
                    required
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      border: "2px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      fontSize: "1em",
                      boxSizing: "border-box",
                      transition: "all 0.3s ease",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "#fff",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ff6b35";
                      e.target.style.boxShadow = "0 0 0 4px rgba(255, 107, 53, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div style={{ marginBottom: "25px" }}>
                  <label
                    htmlFor="forgotConfirmPassword"
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    id="forgotConfirmPassword"
                    name="forgotConfirmPassword"
                    placeholder="새 비밀번호를 다시 입력하세요"
                    required
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      border: "2px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      fontSize: "1em",
                      boxSizing: "border-box",
                      transition: "all 0.3s ease",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "#fff",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ff6b35";
                      e.target.style.boxShadow = "0 0 0 4px rgba(255, 107, 53, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                {(resetErrorMessage || resetSuccessMessage) && (
                  <div style={{ marginBottom: "15px", textAlign: "center" }}>
                    {resetErrorMessage && (
                      <p style={{ color: "#ff6b6b", margin: 0 }}>{resetErrorMessage}</p>
                    )}
                    {resetSuccessMessage && (
                      <p style={{ color: "#4ade80", margin: 0 }}>{resetSuccessMessage}</p>
                    )}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={isResettingPassword}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1.05em",
                    fontWeight: 600,
                    cursor: isResettingPassword ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    opacity: isResettingPassword ? 0.7 : 1,
                  }}
                  whileHover={{ scale: isResettingPassword ? 1 : 1.02 }}
                  whileTap={{ scale: isResettingPassword ? 1 : 0.98 }}
                >
                  {isResettingPassword ? "처리 중..." : "새 비밀번호 설정"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register Modal */}
      <AnimatePresence>
        {showRegister && (
          <motion.div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1001,
              backdropFilter: "blur(5px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRegister(false)}
          >
            <motion.div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                padding: "40px",
                borderRadius: "25px",
                width: "90%",
                maxWidth: "500px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
                position: "relative",
                maxHeight: "90vh",
                overflowY: "auto",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowRegister(false)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "none",
                  border: "none",
                  fontSize: "1.8em",
                  color: "rgba(255, 255, 255, 0.5)",
                  cursor: "pointer",
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => (e.target.style.color = "#fff")}
                onMouseLeave={(e) => (e.target.style.color = "rgba(255, 255, 255, 0.5)")}
              >
                &times;
              </button>

              <h2
                style={{
                  fontSize: "1.8em",
                  fontWeight: 700,
                  color: "#fff",
                  marginTop: 0,
                  marginBottom: "30px",
                  textAlign: "center",
                }}
              >
                회원가입
              </h2>

              <form onSubmit={handleRegister}>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    htmlFor="regUsername"
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    아이디
                  </label>
                  <input
                    type="text"
                    id="regUsername"
                    name="regUsername"
                    placeholder="사용할 아이디를 입력하세요"
                    required
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      border: "2px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      fontSize: "1em",
                      boxSizing: "border-box",
                      transition: "all 0.3s ease",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "#fff",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ff6b35";
                      e.target.style.boxShadow = "0 0 0 4px rgba(255, 107, 53, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    htmlFor="regEmail"
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    이메일 주소
                  </label>
                  <input
                    type="email"
                    id="regEmail"
                    name="regEmail"
                    placeholder="이메일 주소를 입력하세요"
                    required
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      border: "2px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      fontSize: "1em",
                      boxSizing: "border-box",
                      transition: "all 0.3s ease",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "#fff",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ff6b35";
                      e.target.style.boxShadow = "0 0 0 4px rgba(255, 107, 53, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    htmlFor="regPassword"
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    비밀번호
                  </label>
                  <input
                    type="password"
                    id="regPassword"
                    name="regPassword"
                    placeholder="비밀번호를 입력하세요 (8자 이상)"
                    required
                    minLength="8"
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      border: "2px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      fontSize: "1em",
                      boxSizing: "border-box",
                      transition: "all 0.3s ease",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "#fff",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ff6b35";
                      e.target.style.boxShadow = "0 0 0 4px rgba(255, 107, 53, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <div style={{ marginBottom: "25px" }}>
                  <label
                    htmlFor="regConfirmPassword"
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontWeight: 600,
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    비밀번호 확인
                  </label>
                  <input
                    type="password"
                    id="regConfirmPassword"
                    name="regConfirmPassword"
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                    style={{
                      width: "100%",
                      padding: "14px 18px",
                      border: "2px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      fontSize: "1em",
                      boxSizing: "border-box",
                      transition: "all 0.3s ease",
                      background: "rgba(255, 255, 255, 0.05)",
                      color: "#fff",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#ff6b35";
                      e.target.style.boxShadow = "0 0 0 4px rgba(255, 107, 53, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>

                <motion.button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1.05em",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  회원가입
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default LoginPage;
