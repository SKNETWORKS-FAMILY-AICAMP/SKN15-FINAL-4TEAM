import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";

function AdminPage() {
  const { isAdmin, getPendingUsers, getAllUsers, approveUser, rejectUser, deleteUser } = useAuth();
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  // 관리자 권한 확인
  useEffect(() => {
    if (!isAdmin) {
      alert("관리자만 접근할 수 있는 페이지입니다.");
      navigate("/");
    }
  }, [isAdmin, navigate]);

  // 사용자 목록 로드
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setPendingUsers(getPendingUsers());
    setAllUsers(getAllUsers());
  };

  const handleApprove = (username) => {
    if (window.confirm(`${username} 사용자를 승인하시겠습니까?`)) {
      if (approveUser(username)) {
        alert("승인되었습니다.");
        loadUsers();
      } else {
        alert("승인 실패");
      }
    }
  };

  const handleReject = (username) => {
    if (window.confirm(`${username} 사용자를 거부하시겠습니까?`)) {
      if (rejectUser(username)) {
        alert("거부되었습니다.");
        loadUsers();
      } else {
        alert("거부 실패");
      }
    }
  };

  const handleDelete = (username) => {
    if (window.confirm(`${username} 사용자를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      const result = deleteUser(username);
      if (result.success) {
        alert("사용자가 삭제되었습니다.");
        loadUsers();
      } else if (result.error === "cannotDeleteAdmin") {
        alert("관리자 계정은 삭제할 수 없습니다.");
      } else {
        alert("삭제 실패");
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: { bg: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)", label: "승인 대기" },
      approved: { bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", label: "승인됨" },
      rejected: { bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", label: "거부됨" },
    };

    const style = statusStyles[status] || statusStyles.pending;

    return (
      <span
        style={{
          padding: "6px 14px",
          borderRadius: "12px",
          fontSize: "0.85rem",
          fontWeight: 600,
          color: "#fff",
          background: style.bg,
          display: "inline-block",
        }}
      >
        {style.label}
      </span>
    );
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)",
        paddingTop: "0",
        marginTop: "0",
      }}
    >
      {/* Header Section */}
      <motion.div
        style={{
          textAlign: "center",
          padding: "60px 20px 40px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
          marginBottom: "50px",
          marginTop: "0",
        }}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <motion.h1
          style={{
            fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
            fontWeight: 800,
            margin: "0 0 15px",
            textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
          }}
          variants={fadeUp}
        >
          관리자 페이지
        </motion.h1>
        <motion.p
          style={{
            fontSize: "1.2rem",
            opacity: 0.95,
            margin: 0,
          }}
          variants={fadeUp}
        >
          회원 가입 요청을 승인하거나 거부할 수 있습니다
        </motion.p>
      </motion.div>

      {/* Main Content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 30px 60px" }}>
        {/* Tab Navigation */}
        <motion.div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "40px",
            justifyContent: "center",
          }}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <motion.button
            onClick={() => setActiveTab("pending")}
            style={{
              padding: "12px 30px",
              border: "none",
              borderRadius: "15px",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
              background:
                activeTab === "pending"
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "#fff",
              color: activeTab === "pending" ? "#fff" : "#333",
              boxShadow:
                activeTab === "pending"
                  ? "0 8px 20px rgba(102, 126, 234, 0.3)"
                  : "0 4px 10px rgba(0, 0, 0, 0.08)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            승인 대기 ({pendingUsers.length})
          </motion.button>

          <motion.button
            onClick={() => setActiveTab("all")}
            style={{
              padding: "12px 30px",
              border: "none",
              borderRadius: "15px",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
              background:
                activeTab === "all"
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "#fff",
              color: activeTab === "all" ? "#fff" : "#333",
              boxShadow:
                activeTab === "all"
                  ? "0 8px 20px rgba(102, 126, 234, 0.3)"
                  : "0 4px 10px rgba(0, 0, 0, 0.08)",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            전체 사용자 ({allUsers.length})
          </motion.button>
        </motion.div>

        {/* Pending Users Table */}
        {activeTab === "pending" && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "30px", color: "#333" }}>
              승인 대기 중인 사용자
            </h2>

            {pendingUsers.length === 0 ? (
              <motion.div
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "60px",
                  textAlign: "center",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                }}
                variants={fadeUp}
              >
                <i
                  className="fas fa-check-circle"
                  style={{ fontSize: "4em", color: "#43e97b", marginBottom: "20px", display: "block" }}
                ></i>
                <h3 style={{ fontSize: "1.5em", color: "#333", margin: "0 0 10px" }}>
                  승인 대기 중인 사용자가 없습니다
                </h3>
                <p style={{ color: "#6c757d", margin: 0 }}>모든 요청이 처리되었습니다.</p>
              </motion.div>
            ) : (
              <motion.div
                style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "30px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                  overflowX: "auto",
                }}
                variants={fadeUp}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                      <th style={{ padding: "15px", textAlign: "left", color: "#6c757d", fontWeight: 600 }}>
                        아이디
                      </th>
                      <th style={{ padding: "15px", textAlign: "left", color: "#6c757d", fontWeight: 600 }}>
                        이메일
                      </th>
                      <th style={{ padding: "15px", textAlign: "left", color: "#6c757d", fontWeight: 600 }}>
                        신청일
                      </th>
                      <th style={{ padding: "15px", textAlign: "center", color: "#6c757d", fontWeight: 600 }}>
                        액션
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user, index) => (
                      <motion.tr
                        key={index}
                        style={{ borderBottom: "1px solid #f0f0f0" }}
                        whileHover={{ backgroundColor: "#f8f9fa" }}
                      >
                        <td style={{ padding: "20px 15px", fontSize: "1rem", fontWeight: 600, color: "#333" }}>
                          {user.username}
                        </td>
                        <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "#6c757d" }}>
                          {user.email}
                        </td>
                        <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "#6c757d" }}>
                          {new Date(user.registeredAt).toLocaleDateString("ko-KR")}
                        </td>
                        <td style={{ padding: "20px 15px", textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                            <motion.button
                              onClick={() => handleApprove(user.username)}
                              style={{
                                padding: "8px 20px",
                                border: "none",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                                color: "#fff",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: "0 4px 10px rgba(67, 233, 123, 0.3)",
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              승인
                            </motion.button>

                            <motion.button
                              onClick={() => handleReject(user.username)}
                              style={{
                                padding: "8px 20px",
                                border: "none",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                color: "#fff",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: "0 4px 10px rgba(240, 147, 251, 0.3)",
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              거부
                            </motion.button>

                            <motion.button
                              onClick={() => handleDelete(user.username)}
                              style={{
                                padding: "8px 20px",
                                border: "none",
                                borderRadius: "10px",
                                background: "linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)",
                                color: "#fff",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: "0 4px 10px rgba(255, 107, 107, 0.3)",
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              삭제
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </motion.section>
        )}

        {/* All Users Table */}
        {activeTab === "all" && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "30px", color: "#333" }}>
              전체 사용자 목록
            </h2>

            <motion.div
              style={{
                background: "#fff",
                borderRadius: "20px",
                padding: "30px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                overflowX: "auto",
              }}
              variants={fadeUp}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                    <th style={{ padding: "15px", textAlign: "left", color: "#6c757d", fontWeight: 600 }}>
                      아이디
                    </th>
                    <th style={{ padding: "15px", textAlign: "left", color: "#6c757d", fontWeight: 600 }}>
                      이메일
                    </th>
                    <th style={{ padding: "15px", textAlign: "left", color: "#6c757d", fontWeight: 600 }}>
                      상태
                    </th>
                    <th style={{ padding: "15px", textAlign: "left", color: "#6c757d", fontWeight: 600 }}>
                      신청일
                    </th>
                    <th style={{ padding: "15px", textAlign: "left", color: "#6c757d", fontWeight: 600 }}>
                      승인일
                    </th>
                    <th style={{ padding: "15px", textAlign: "center", color: "#6c757d", fontWeight: 600 }}>
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user, index) => (
                    <motion.tr
                      key={index}
                      style={{ borderBottom: "1px solid #f0f0f0" }}
                      whileHover={{ backgroundColor: "#f8f9fa" }}
                    >
                      <td style={{ padding: "20px 15px", fontSize: "1rem", fontWeight: 600, color: "#333" }}>
                        {user.username}
                      </td>
                      <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "#6c757d" }}>
                        {user.email}
                      </td>
                      <td style={{ padding: "20px 15px" }}>{getStatusBadge(user.status)}</td>
                      <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "#6c757d" }}>
                        {new Date(user.registeredAt).toLocaleDateString("ko-KR")}
                      </td>
                      <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "#6c757d" }}>
                        {user.approvedAt ? new Date(user.approvedAt).toLocaleDateString("ko-KR") : "-"}
                      </td>
                      <td style={{ padding: "20px 15px", textAlign: "center" }}>
                        <motion.button
                          onClick={() => handleDelete(user.username)}
                          disabled={user.username === "admin"}
                          style={{
                            padding: "8px 20px",
                            border: "none",
                            borderRadius: "10px",
                            background: user.username === "admin"
                              ? "#ccc"
                              : "linear-gradient(135deg, #ff6b6b 0%, #c92a2a 100%)",
                            color: "#fff",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            cursor: user.username === "admin" ? "not-allowed" : "pointer",
                            boxShadow: user.username === "admin"
                              ? "none"
                              : "0 4px 10px rgba(255, 107, 107, 0.3)",
                            opacity: user.username === "admin" ? 0.5 : 1,
                          }}
                          whileHover={user.username !== "admin" ? { scale: 1.05 } : {}}
                          whileTap={user.username !== "admin" ? { scale: 0.95 } : {}}
                        >
                          삭제
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </motion.section>
        )}
      </div>
    </main>
  );
}

export default AdminPage;
