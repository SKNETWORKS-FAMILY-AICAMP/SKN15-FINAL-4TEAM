import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../App.css";

function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 20px 60px",
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

      {/* Floating Shapes */}
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
        animate={floatingAnimation}
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
          y: [0, 30, 0],
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />

      {/* Main Content */}
      <motion.div
        style={{
          maxWidth: "1200px",
          width: "100%",
          position: "relative",
          zIndex: 1,
        }}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: "80px" }}>
          <motion.h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 5rem)",
              fontWeight: 900,
              color: "#fff",
              marginBottom: "25px",
              lineHeight: "1.2",
              textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
            }}
            variants={fadeUp}
          >
            AI-driven Interior
            <br />
            Proposals in Minutes
          </motion.h1>

          <motion.p
            style={{
              fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
              color: "rgba(255, 255, 255, 0.95)",
              marginBottom: "50px",
              maxWidth: "700px",
              margin: "0 auto 50px",
              lineHeight: "1.7",
            }}
            variants={fadeUp}
          >
            ASSEMBLE은 사용자의 요청사항에 맞게
            <br />
            AI 기반 인테리어를 추천합니다
          </motion.p>

          <motion.div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
            variants={fadeUp}
          >
            <motion.button
              onClick={() => navigate(isAuthenticated ? "/projects" : "/login")}
              style={{
                padding: "18px 45px",
                fontSize: "1.2rem",
                fontWeight: 700,
                border: "none",
                borderRadius: "15px",
                background: "#fff",
                color: "#667eea",
                cursor: "pointer",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                transition: "all 0.3s ease",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 15px 40px rgba(0, 0, 0, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>

            <motion.button
              onClick={() => navigate("/about")}
              style={{
                padding: "18px 45px",
                fontSize: "1.2rem",
                fontWeight: 700,
                border: "2px solid rgba(255, 255, 255, 0.8)",
                borderRadius: "15px",
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                color: "#fff",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              whileHover={{
                scale: 1.05,
                background: "rgba(255, 255, 255, 0.2)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "30px",
            marginTop: "80px",
          }}
          variants={staggerContainer}
        >
          {[
            {
              icon: "fas fa-magic",
              title: "AI 자동 생성",
              description: "최첨단 AI 기술로 당신만의 맞춤형 인테리어를 즉시 생성합니다",
              gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            },
            {
              icon: "fas fa-clock",
              title: "빠른 디자인",
              description: "몇 분 안에 다양한 스타일의 인테리어 시안을 확인하세요",
              gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            },
            {
              icon: "fas fa-palette",
              title: "무한한 아이디어",
              description: "다양한 컨셉과 스타일로 당신의 공간을 완벽하게 연출합니다",
              gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            },
            {
              icon: "fas fa-chart-line",
              title: "프로젝트 관리",
              description: "진행 중인 모든 프로젝트를 한눈에 관리하고 추적하세요",
              gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(20px)",
                padding: "40px 30px",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                textAlign: "center",
                cursor: "pointer",
              }}
              variants={fadeUp}
              whileHover={{
                y: -10,
                background: "rgba(255, 255, 255, 0.15)",
                transition: { duration: 0.3 },
              }}
            >
              <motion.div
                style={{
                  width: "80px",
                  height: "80px",
                  margin: "0 auto 25px",
                  borderRadius: "20px",
                  background: feature.gradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
                }}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <i className={feature.icon} style={{ fontSize: "2.2em", color: "#fff" }}></i>
              </motion.div>

              <h3
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: "15px",
                }}
              >
                {feature.title}
              </h3>

              <p
                style={{
                  fontSize: "1rem",
                  color: "rgba(255, 255, 255, 0.85)",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexWrap: "wrap",
            gap: "40px",
            marginTop: "100px",
            padding: "50px 30px",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(20px)",
            borderRadius: "25px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
          variants={fadeUp}
        >
          {[
            { value: "10,000+", label: "완성된 프로젝트" },
            { value: "5,000+", label: "만족한 사용자" },
            { value: "50+", label: "디자인 스타일" },
            { value: "99%", label: "고객 만족도" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              style={{ textAlign: "center" }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                style={{
                  fontSize: "clamp(2.5rem, 4vw, 3.5rem)",
                  fontWeight: 900,
                  color: "#fff",
                  marginBottom: "10px",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                }}
              >
                {stat.value}
              </h2>
              <p
                style={{
                  fontSize: "1.1rem",
                  color: "rgba(255, 255, 255, 0.9)",
                  margin: 0,
                }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}

export default Hero;
