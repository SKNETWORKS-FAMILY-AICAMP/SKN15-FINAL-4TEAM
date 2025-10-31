import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import NewProjectModal from "./NewProjectModal";
import "../App.css";

function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    designs: 0
  });
  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  // 프로젝트 로드
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    const userId = localStorage.getItem("user_id") || "guest";

    try {
      // 백엔드에서 프로젝트 데이터 가져오기
      const response = await fetch(`http://127.0.0.1:8000/api/projects/${userId}/`);

      if (response.ok) {
        const backendProjects = await response.json();

        // 백엔드 데이터를 프론트엔드 형식으로 변환
        const userProjects = backendProjects.map(p => ({
          id: p.id,
          userId: userId,
          title: p.title,
          status: p.status === "progress" ? "진행중" : p.status === "completed" ? "완료" : "대기",
          imagePreview: p.project_image,
          createdAt: p.created_at,
          type: p.residence_type || "-",
          space: p.space_type || "-",
          budget: p.budget_range || "-",
          family: p.family_type || "-",
          style: p.design_style || "-"
        }));

        setProjects(userProjects);

        // 통계 계산
        const inProgress = userProjects.filter(p => p.status === "진행중").length;
        const completed = userProjects.filter(p => p.status === "완료").length;

        setStats({
          total: userProjects.length,
          inProgress: inProgress,
          completed: completed,
          designs: userProjects.length * 10 // 임시: 프로젝트당 10개 시안
        });
      } else {
        console.warn("백엔드에서 프로젝트를 불러올 수 없습니다. localStorage 사용");
        // 백엔드 실패 시 localStorage 사용
        loadProjectsFromLocalStorage(userId);
      }
    } catch (error) {
      console.error("프로젝트 로드 중 오류:", error);
      // 네트워크 오류 시 localStorage 사용
      loadProjectsFromLocalStorage(userId);
    }
  };

  // localStorage에서 프로젝트 로드 (폴백)
  const loadProjectsFromLocalStorage = (userId) => {
    const allProjects = JSON.parse(localStorage.getItem("projects") || "[]");
    const userProjects = allProjects.filter(p => p.userId === userId);
    setProjects(userProjects);

    const inProgress = userProjects.filter(p => p.status === "진행중").length;
    const completed = userProjects.filter(p => p.status === "완료").length;

    setStats({
      total: userProjects.length,
      inProgress: inProgress,
      completed: completed,
      designs: userProjects.length * 10
    });
  };

  // 통계 데이터
  const statsData = [
    {
      title: "총 프로젝트",
      value: stats.total,
      change: `${stats.total}개 프로젝트`,
      emoji: "📁",
      gradient: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
    },
    {
      title: "진행 중인 프로젝트",
      value: stats.inProgress,
      change: `${stats.inProgress}개 진행중`,
      emoji: "⚡",
      gradient: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
    },
    {
      title: "완료된 프로젝트",
      value: stats.completed,
      change: `${stats.completed}개 완료`,
      emoji: "✅",
      gradient: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
    },
    {
      title: "생성된 시안",
      value: stats.designs,
      change: `총 ${stats.designs}개`,
      emoji: "🖼️",
      gradient: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
    },
  ];

  // 진행중인 프로젝트만 필터링
  const ongoingProjects = projects
    .filter(p => p.status === "진행중")
    .map(p => ({
      title: p.title,
      image: p.imagePreview || "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500",
      status: p.status,
      progress: Math.floor(Math.random() * 40) + 40, // 임시 진행률
      type: p.type,
      space: p.space,
    }));

  // 최근 프로젝트 (최신 순으로 정렬)
  const recentProjects = projects
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map(p => ({
      name: p.title,
      client: p.family || "-",
      status: p.status,
      update: new Date(p.createdAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\. /g, '.').replace('.', '.'),
      manager: "이수현",
      type: p.type,
      space: p.space,
    }));

  const getStatusColor = (status) => {
    if (status === "진행중") return "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)";
    if (status === "초기 상담 중") return "linear-gradient(135deg, #9ca3af 0%, #b8bfc9 100%)";
    if (status === "완료") return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    return "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)";
  };

  const getStatusTextColor = (status) => {
    return "#fff";
  };

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
          background: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat",
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
          PROJECT DASHBOARD
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
          My Projects
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
          진행중인 프로젝트와 현황을 한눈에 확인하세요
        </motion.p>
      </motion.div>

      {/* Main Content */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 30px 60px" }}>
        {/* Stats Section */}
        <motion.section
          style={{ marginBottom: "50px" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "25px",
            }}
          >
            {statsData.map((stat, index) => (
              <motion.div
                key={index}
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  padding: "30px",
                  borderRadius: "20px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                  position: "relative",
                  overflow: "hidden",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
                variants={fadeUp}
                whileHover={{
                  y: -5,
                  boxShadow: "0 15px 40px rgba(0, 0, 0, 0.5)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.7)", margin: "0 0 12px", fontWeight: 500 }}>
                      {stat.title}
                    </h3>
                    <p style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
                      {stat.value}
                    </p>
                    <span style={{ fontSize: "0.85rem", color: "#ff6b35", fontWeight: 600 }}>
                      {stat.change}
                    </span>
                  </div>
                  <motion.div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "15px",
                      background: "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2.5em",
                    }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {stat.emoji}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* New Project Button */}
          <motion.button
            onClick={() => setShowModal(true)}
            style={{
              marginTop: "25px",
              padding: "16px 40px",
              background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "15px",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 10px 25px rgba(255, 107, 53, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            whileHover={{ scale: 1.02, boxShadow: "0 15px 35px rgba(255, 107, 53, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            variants={fadeUp}
          >
            <i className="fas fa-plus"></i>
            새 프로젝트 생성
          </motion.button>
        </motion.section>

        {/* Empty State or Project Lists */}
        {projects.length === 0 ? (
          <motion.section
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: "50px",
            }}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <motion.div
              style={{
                fontSize: "4em",
                marginBottom: "20px",
              }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              📁
            </motion.div>
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "15px", color: "#fff" }}>
              아직 프로젝트가 없습니다
            </h2>
            <p style={{ fontSize: "1.1rem", color: "rgba(255, 255, 255, 0.7)", marginBottom: "30px" }}>
              새 프로젝트를 생성하여 인테리어 디자인을 시작해보세요!
            </p>
            <motion.button
              onClick={() => setShowModal(true)}
              style={{
                padding: "16px 40px",
                background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "15px",
                fontSize: "1.1rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(255, 107, 53, 0.3)",
              }}
              whileHover={{ scale: 1.05, boxShadow: "0 15px 35px rgba(255, 107, 53, 0.4)" }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="fas fa-plus"></i> 첫 프로젝트 만들기
            </motion.button>
          </motion.section>
        ) : (
          <>
            {/* Ongoing Projects Section */}
            {ongoingProjects.length > 0 && (
              <motion.section
                style={{ marginBottom: "50px" }}
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "30px", color: "#fff" }}>
                  현재 진행중인 인테리어 가상
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "30px",
                  }}
                >
                  {ongoingProjects.map((project, index) => (
                    <motion.div
                      key={index}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        borderRadius: "20px",
                        overflow: "hidden",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                        cursor: "pointer",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                      }}
                      variants={fadeUp}
                      whileHover={{
                        y: -10,
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
                      }}
                    >
                      {/* Image */}
                      <div style={{ position: "relative", overflow: "hidden", height: "280px" }}>
                        <img
                          src={project.image}
                          alt={project.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            transition: "transform 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.transform = "scale(1)";
                          }}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/500x300?text=No+Image";
                          }}
                        />
                        {/* Status Badge */}
                        <div
                          style={{
                            position: "absolute",
                            top: "15px",
                            right: "15px",
                            padding: "8px 16px",
                            background: "rgba(255, 107, 53, 0.95)",
                            backdropFilter: "blur(10px)",
                            borderRadius: "12px",
                            color: "#fff",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          {project.status}
                        </div>
                      </div>

                      {/* Info */}
                      <div style={{ padding: "25px" }}>
                        <h3 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 15px", color: "#fff" }}>
                          {project.title}
                        </h3>

                        {/* Progress Bar */}
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <span style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.7)", fontWeight: 500 }}>진행률</span>
                            <span style={{ fontSize: "0.9rem", color: "#ff6b35", fontWeight: 700 }}>
                              {project.progress}%
                            </span>
                          </div>
                          <div
                            style={{
                              width: "100%",
                              height: "8px",
                              background: "rgba(255, 255, 255, 0.1)",
                              borderRadius: "10px",
                              overflow: "hidden",
                            }}
                          >
                            <motion.div
                              style={{
                                height: "100%",
                                background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
                                borderRadius: "10px",
                              }}
                              initial={{ width: 0 }}
                              animate={{ width: `${project.progress}%` }}
                              transition={{ duration: 1, delay: 0.3 }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Recent Projects Table */}
            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
            >
              <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "30px", color: "#fff" }}>
                최근 프로젝트
              </h2>

              <div
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
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(255, 255, 255, 0.1)" }}>
                      <th style={{ padding: "15px", textAlign: "left", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600, fontSize: "0.95rem" }}>
                        프로젝트명
                      </th>
                      <th style={{ padding: "15px", textAlign: "left", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600, fontSize: "0.95rem" }}>
                        클라이언트
                      </th>
                      <th style={{ padding: "15px", textAlign: "left", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600, fontSize: "0.95rem" }}>
                        상태
                      </th>
                      <th style={{ padding: "15px", textAlign: "left", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600, fontSize: "0.95rem" }}>
                        최근 업데이트
                      </th>
                      <th style={{ padding: "15px", textAlign: "left", color: "rgba(255, 255, 255, 0.7)", fontWeight: 600, fontSize: "0.95rem" }}>
                        담당자
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProjects.map((project, index) => (
                      <motion.tr
                        key={index}
                        style={{
                          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                          cursor: "pointer",
                        }}
                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                      >
                        <td style={{ padding: "20px 15px", fontSize: "1rem", fontWeight: 600, color: "#fff" }}>
                          {project.name}
                        </td>
                        <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.7)" }}>
                          {project.client}
                        </td>
                        <td style={{ padding: "20px 15px" }}>
                          <span
                            style={{
                              padding: "6px 14px",
                              borderRadius: "12px",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              color: getStatusTextColor(project.status),
                              background: getStatusColor(project.status),
                              display: "inline-block",
                            }}
                          >
                            {project.status}
                          </span>
                        </td>
                        <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.7)" }}>
                          {project.update}
                        </td>
                        <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.7)" }}>
                          {project.manager}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.section>
          </>
        )}
      </div>

      {/* New Project Modal */}
      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            loadProjects(); // 프로젝트 목록 새로고침
          }}
        />
      )}
    </main>
  );
}

export default Dashboard;
