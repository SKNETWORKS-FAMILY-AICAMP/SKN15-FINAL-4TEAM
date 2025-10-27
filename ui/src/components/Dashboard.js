import { motion } from "framer-motion";
import "../App.css";

function Dashboard() {
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

  // 통계 데이터
  const stats = [
    {
      title: "총 프로젝트",
      value: 12,
      change: "+2 이번 달",
      icon: "fas fa-folder",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "진행 중인 프로젝트",
      value: 5,
      change: "+1 이번 달",
      icon: "fas fa-spinner",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "완료된 프로젝트",
      value: 7,
      change: "-1 지난 달",
      icon: "fas fa-check-circle",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
    {
      title: "생성된 시안",
      value: 138,
      change: "+30 이번 주",
      icon: "fas fa-image",
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    },
  ];

  // 진행중인 프로젝트 카드
  const ongoingProjects = [
    {
      title: "판교 타운하우스 A타입",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500",
      status: "진행중",
      progress: 65,
    },
    {
      title: "모피스빌딩 B동 로비",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500",
      status: "진행중",
      progress: 40,
    },
    {
      title: "디자인 리빙 쇼룸",
      image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=500",
      status: "진행중",
      progress: 80,
    },
  ];

  // 최근 프로젝트 테이블
  const recentProjects = [
    {
      name: "판교 타운하우스 A타입",
      client: "김민준",
      status: "진행중",
      update: "2025.09.24",
      manager: "이수현",
    },
    {
      name: "모피스빌딩 B동 로비",
      client: "(주)글로벌 건설",
      status: "초기 상담 중",
      update: "2025.09.23",
      manager: "이수현",
    },
    {
      name: "디자인 리빙 쇼룸",
      client: "(주)아트앤디자인",
      status: "완료",
      update: "2025.09.20",
      manager: "이수현",
    },
  ];

  const getStatusColor = (status) => {
    if (status === "완료") return "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)";
    if (status === "진행중") return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    return "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)";
  };

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
          My Projects
        </motion.h1>
        <motion.p
          style={{
            fontSize: "1.2rem",
            opacity: 0.95,
            margin: 0,
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
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                style={{
                  background: "#fff",
                  padding: "30px",
                  borderRadius: "20px",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                  position: "relative",
                  overflow: "hidden",
                }}
                variants={fadeUp}
                whileHover={{
                  y: -5,
                  boxShadow: "0 15px 40px rgba(0, 0, 0, 0.12)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ fontSize: "0.95rem", color: "#6c757d", margin: "0 0 12px", fontWeight: 500 }}>
                      {stat.title}
                    </h3>
                    <p style={{ fontSize: "2.5rem", fontWeight: 800, color: "#333", margin: "0 0 8px" }}>
                      {stat.value}
                    </p>
                    <span style={{ fontSize: "0.85rem", color: "#43e97b", fontWeight: 600 }}>
                      {stat.change}
                    </span>
                  </div>
                  <motion.div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "15px",
                      background: stat.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <i className={stat.icon} style={{ fontSize: "1.8em", color: "#fff" }}></i>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* New Project Button */}
          <motion.button
            style={{
              marginTop: "25px",
              padding: "16px 40px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "15px",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 10px 25px rgba(102, 126, 234, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
            whileHover={{ scale: 1.02, boxShadow: "0 15px 35px rgba(102, 126, 234, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            variants={fadeUp}
          >
            <i className="fas fa-plus"></i>
            새 프로젝트 생성
          </motion.button>
        </motion.section>

        {/* Ongoing Projects Section */}
        <motion.section
          style={{ marginBottom: "50px" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "30px", color: "#333" }}>
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
                  background: "#fff",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                  cursor: "pointer",
                }}
                variants={fadeUp}
                whileHover={{
                  y: -10,
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                }}
              >
                {/* Image */}
                <div style={{ position: "relative", overflow: "hidden", height: "200px" }}>
                  <img
                    src={project.image}
                    alt={project.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
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
                      background: "rgba(102, 126, 234, 0.95)",
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
                  <h3 style={{ fontSize: "1.3rem", fontWeight: 700, margin: "0 0 15px", color: "#333" }}>
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
                      <span style={{ fontSize: "0.9rem", color: "#6c757d", fontWeight: 500 }}>진행률</span>
                      <span style={{ fontSize: "0.9rem", color: "#667eea", fontWeight: 700 }}>
                        {project.progress}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        background: "#e9ecef",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <motion.div
                        style={{
                          height: "100%",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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

        {/* Recent Projects Table */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
        >
          <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "30px", color: "#333" }}>
            최근 프로젝트
          </h2>

          <div
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "30px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
              overflowX: "auto",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e9ecef" }}>
                  <th style={{ padding: "15px", textAlign: "left", color: "#6c757d", fontWeight: 600, fontSize: "0.95rem" }}>
                    프로젝트명
                  </th>
                  <th style={{ padding: "15px", textAlign: "left", color: "#6c757d", fontWeight: 600, fontSize: "0.95rem" }}>
                    클라이언트
                  </th>
                  <th style={{ padding: "15px", textAlign: "left", color: "#6c757d", fontWeight: 600, fontSize: "0.95rem" }}>
                    상태
                  </th>
                  <th style={{ padding: "15px", textAlign: "left", color: "#6c757d", fontWeight: 600, fontSize: "0.95rem" }}>
                    최근 업데이트
                  </th>
                  <th style={{ padding: "15px", textAlign: "left", color: "#6c757d", fontWeight: 600, fontSize: "0.95rem" }}>
                    담당자
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((project, index) => (
                  <motion.tr
                    key={index}
                    style={{
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                    }}
                    whileHover={{ backgroundColor: "#f8f9fa" }}
                  >
                    <td style={{ padding: "20px 15px", fontSize: "1rem", fontWeight: 600, color: "#333" }}>
                      {project.name}
                    </td>
                    <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "#6c757d" }}>
                      {project.client}
                    </td>
                    <td style={{ padding: "20px 15px" }}>
                      <span
                        style={{
                          padding: "6px 14px",
                          borderRadius: "12px",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#fff",
                          background: getStatusColor(project.status),
                          display: "inline-block",
                        }}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "#6c757d" }}>
                      {project.update}
                    </td>
                    <td style={{ padding: "20px 15px", fontSize: "0.95rem", color: "#6c757d" }}>
                      {project.manager}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

export default Dashboard;
