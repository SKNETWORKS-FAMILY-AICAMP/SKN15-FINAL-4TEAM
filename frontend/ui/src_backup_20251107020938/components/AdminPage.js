import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../App.css";

function AdminPage() {
  const {
    isAdmin,
    getPendingUsers,
    getAllUsers,
    approveUser,
    rejectUser,
    deleteUser,
    deletePendingUser,
  } = useAuth();
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

  const loadUsers = useCallback(async () => {
    try {
      const [pending, users] = await Promise.all([getPendingUsers(), getAllUsers()]);
      setPendingUsers(pending || []);
      setAllUsers(users || []);
    } catch (error) {
      console.error("❌ 사용자 목록 불러오기 실패:", error);
    }
  }, [getPendingUsers, getAllUsers]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, loadUsers]);

  const handleApprove = async (pendingUser) => {
    if (!pendingUser) return;
    if (window.confirm(`${pendingUser.user_id} 사용자를 승인하시겠습니까?`)) {
      try {
        await approveUser(pendingUser.id);
        alert("승인되었습니다.");
        loadUsers();
      } catch (error) {
        console.error(error);
        alert("승인 실패");
      }
    }
  };

  const handleReject = async (pendingUser) => {
    if (!pendingUser) return;
    if (window.confirm(`${pendingUser.user_id} 사용자를 거부하시겠습니까?`)) {
      try {
        await rejectUser(pendingUser.id, "관리자 거절");
        alert("거부되었습니다.");
        loadUsers();
      } catch (error) {
        console.error(error);
        alert("거부 실패");
      }
    }
  };

  const handleDeletePending = async (pendingUser) => {
    if (!pendingUser) return;
    if (window.confirm(`${pendingUser.user_id} 요청을 삭제하시겠습니까?`)) {
      try {
        await deletePendingUser(pendingUser.id);
        alert("요청이 삭제되었습니다.");
        loadUsers();
      } catch (error) {
        console.error(error);
        alert("삭제 실패");
      }
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm(`${userId} 사용자를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      try {
        const result = await deleteUser(userId);
        if (result.success) {
          alert("사용자가 삭제되었습니다.");
          loadUsers();
        } else if (result.error === "cannotDeleteAdmin") {
          alert("관리자 계정은 삭제할 수 없습니다.");
        } else {
          alert("삭제 실패");
        }
      } catch (error) {
        console.error(error);
        alert("삭제 실패");
      }
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        paddingTop: "0",
        marginTop: "0",
      }}
    >
      {/* Header Section */}
      <motion.div
        style={{
          position: "relative",
          height: "70vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "0 80px",
          background: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#fff",
          marginBottom: "50px",
          marginTop: "0",
        }}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <motion.div
          style={{
            display: "inline-block",
            padding: "10px 25px",
            border: "2px solid rgba(255, 107, 53, 0.8)",
            borderRadius: "30px",
            fontSize: "0.9rem",
            fontWeight: 600,
            letterSpacing: "1px",
            marginBottom: "30px",
            color: "#ff6b35",
            background: "rgba(0, 0, 0, 0.3)",
          }}
          variants={fadeUp}
        >
          ADMIN CONTROL PANEL
        </motion.div>

        <motion.h1
          style={{
            fontSize: "clamp(3rem, 6vw, 4.5rem)",
            fontWeight: 900,
            margin: "0 0 20px",
            textShadow: "3px 3px 6px rgba(0,0,0,0.5)",
            lineHeight: "1.2",
            maxWidth: "800px",
          }}
          variants={fadeUp}
        >
          관리자 페이지
        </motion.h1>

        <motion.p
          style={{
            fontSize: "1.3rem",
            opacity: 0.95,
            margin: 0,
            maxWidth: "600px",
            lineHeight: "1.6",
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
              borderRadius: "15px",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
              background:
                activeTab === "pending"
                  ? "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)"
                  : "rgba(255, 255, 255, 0.05)",
              color: "#fff",
              boxShadow:
                activeTab === "pending"
                  ? "0 8px 20px rgba(255, 107, 53, 0.3)"
                  : "0 4px 10px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
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
              borderRadius: "15px",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
              background:
                activeTab === "all"
                  ? "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)"
                  : "rgba(255, 255, 255, 0.05)",
              color: "#fff",
              boxShadow:
                activeTab === "all"
                  ? "0 8px 20px rgba(255, 107, 53, 0.3)"
                  : "0 4px 10px rgba(0, 0, 0, 0.3)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
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
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "30px", color: "#fff" }}>
              승인 대기 중인 사용자
            </h2>

            {pendingUsers.length === 0 ? (
              <motion.div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  borderRadius: "20px",
                  padding: "60px",
                  textAlign: "center",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                variants={fadeUp}
              >
                <i
                  className="fas fa-check-circle"
                  style={{ fontSize: "4em", color: "#ff6b35", marginBottom: "20px", display: "block" }}
                ></i>
                <h3 style={{ fontSize: "1.5em", color: "#fff", margin: "0 0 10px" }}>
                  승인 대기 중인 사용자가 없습니다
                </h3>
                <p style={{ color: "rgba(255, 255, 255, 0.7)", margin: 0 }}>모든 요청이 처리되었습니다.</p>
              </motion.div>
            ) : (
              <motion.div
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  borderRadius: "20px",
                  padding: "30px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                  overflowX: "auto",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                variants={fadeUp}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}>
                      <th style={{ padding: "15px", textAlign: "left", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600 }}>
                        아이디
                      </th>
                      <th style={{ padding: "15px", textAlign: "left", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600 }}>
                        이메일
                      </th>
                      <th style={{ padding: "15px", textAlign: "left", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600 }}>
                        신청일
                      </th>
                      <th style={{ padding: "15px", textAlign: "center", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600 }}>
                        액션
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                  {pendingUsers.map((pending) => (
                    <motion.tr
                      key={pending.id}
                      style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                    >
                      <td style={{ padding: "20px 15px", fontSize: "1rem", fontWeight: 600, color: "#fff" }}>
                        {pending.user_id}
                      </td>
                      <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.7)" }}>
                        {pending.email || "-"}
                      </td>
                      <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.7)" }}>
                        {pending.registered_at ? new Date(pending.registered_at).toLocaleDateString("ko-KR") : "-"}
                      </td>
                      <td style={{ padding: "20px 15px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                          <motion.button
                            onClick={() => handleApprove(pending)}
                            style={{
                              padding: "8px 20px",
                              border: "none",
                              borderRadius: "10px",
                                background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
                                color: "#fff",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: "0 4px 10px rgba(255, 107, 53, 0.3)",
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              승인
                          </motion.button>

                          <motion.button
                            onClick={() => handleReject(pending)}
                            style={{
                              padding: "8px 20px",
                              border: "none",
                              borderRadius: "10px",
                                background: "rgba(255, 255, 255, 0.1)",
                                color: "#fff",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              거부
                          </motion.button>

                          <motion.button
                            onClick={() => handleDeletePending(pending)}
                            style={{
                              padding: "8px 20px",
                              border: "none",
                                borderRadius: "10px",
                                background: "rgba(255, 255, 255, 0.1)",
                                color: "#fff",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
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
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "30px", color: "#fff" }}>
              전체 사용자 목록
            </h2>

            <motion.div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                borderRadius: "20px",
                padding: "30px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                overflowX: "auto",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
              variants={fadeUp}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}>
                    <th style={{ padding: "15px", textAlign: "left", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600 }}>
                      아이디
                    </th>
                    <th style={{ padding: "15px", textAlign: "left", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600 }}>
                      이름
                    </th>
                    <th style={{ padding: "15px", textAlign: "left", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600 }}>
                      권한
                    </th>
                    <th style={{ padding: "15px", textAlign: "left", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600 }}>
                      생성일
                    </th>
                    <th style={{ padding: "15px", textAlign: "left", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600 }}>
                      수정일
                    </th>
                    <th style={{ padding: "15px", textAlign: "center", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600 }}>
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <motion.tr
                      key={user.user_id}
                      style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}
                      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                    >
                      <td style={{ padding: "20px 15px", fontSize: "1rem", fontWeight: 600, color: "#fff" }}>
                        {user.user_id}
                      </td>
                      <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.7)" }}>
                        {user.name || "-"}
                      </td>
                      <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "#fff" }}>
                        {user.user_permission_code}
                      </td>
                      <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.7)" }}>
                        {user.create_day ? new Date(user.create_day).toLocaleDateString("ko-KR") : "-"}
                      </td>
                      <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.7)" }}>
                        {user.update_day ? new Date(user.update_day).toLocaleDateString("ko-KR") : "-"}
                      </td>
                      <td style={{ padding: "20px 15px", textAlign: "center" }}>
                        <motion.button
                          onClick={() => handleDelete(user.user_id)}
                          disabled={user.user_id === "admin"}
                          style={{
                            padding: "8px 20px",
                            border: "none",
                            borderRadius: "10px",
                            background: user.user_id === "admin"
                              ? "rgba(255, 255, 255, 0.1)"
                              : "rgba(255, 255, 255, 0.1)",
                            color: "#fff",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            cursor: user.user_id === "admin" ? "not-allowed" : "pointer",
                            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
                            opacity: user.user_id === "admin" ? 0.5 : 1,
                          }}
                          whileHover={user.user_id !== "admin" ? { scale: 1.05 } : {}}
                          whileTap={user.user_id !== "admin" ? { scale: 0.95 } : {}}
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
