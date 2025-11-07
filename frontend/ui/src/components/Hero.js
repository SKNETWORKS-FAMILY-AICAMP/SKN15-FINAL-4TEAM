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

  return (
    <main
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Hero Section with Background Image */}
      <motion.div
        className="page-hero"
        style={{
          background:
            "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat",
        }}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
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
          PROFESSIONAL AI DESIGN PLATFORM
        </motion.div>

        <motion.h1
          style={{
            fontSize: "clamp(3rem, 6vw, 4.5rem)",
            fontWeight: 900,
            color: "#fff",
            marginBottom: "20px",
            lineHeight: "1.2",
            maxWidth: "800px",
            textShadow: "3px 3px 6px rgba(0,0,0,0.5)",
          }}
          variants={fadeUp}
        >
          AI-driven Interior<br />Proposals in Minutes
        </motion.h1>

        <motion.p
          style={{
            fontSize: "1.3rem",
            color: "rgba(255, 255, 255, 0.95)",
            marginBottom: "40px",
            maxWidth: "600px",
            lineHeight: "1.6",
          }}
          variants={fadeUp}
        >
          ASSEMBLE은 사용자의 요청사항에 맞게<br />
          AI 기반 인테리어를 추천합니다
        </motion.p>

        <motion.div
          style={{
            display: "flex",
            gap: "20px",
          }}
          variants={fadeUp}
        >
          <motion.button
            onClick={() => navigate("/about")}
            style={{
              padding: "16px 35px",
              fontSize: "1.1rem",
              fontWeight: 600,
              border: "2px solid #fff",
              borderRadius: "30px",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            whileHover={{
              scale: 1.05,
              background: "rgba(255, 255, 255, 0.1)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Learn More
          </motion.button>

          <motion.button
            onClick={() => navigate(isAuthenticated ? "/projects" : "/login")}
            style={{
              padding: "16px 35px",
              fontSize: "1.1rem",
              fontWeight: 600,
              border: "none",
              borderRadius: "30px",
              background: "#ff6b35",
              color: "#fff",
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(255, 107, 53, 0.4)",
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 12px 30px rgba(255, 107, 53, 0.5)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <div style={{
        background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.7) 0%, #1a1a1a 20%, #1a1a1a 100%)",
        padding: "80px 20px",
        marginTop: "40px",
        position: "relative",
      }}>
        <motion.div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {/* Section Title */}
          <motion.h2
            style={{
              fontSize: "clamp(2rem, 4vw, 2.5rem)",
              fontWeight: 800,
              color: "#fff",
              textAlign: "center",
              marginBottom: "60px",
            }}
            variants={fadeUp}
          >
            디자이너를 위한 혁신적인 기능
          </motion.h2>

          <motion.p
            style={{
              fontSize: "1.1rem",
              color: "rgba(255, 255, 255, 0.7)",
              textAlign: "center",
              marginBottom: "60px",
            }}
            variants={fadeUp}
          >
            전문가를 위한 프로페셔널 인테리어 솔루션
          </motion.p>

          {/* Features Grid */}
          <motion.div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "30px",
            }}
            variants={staggerContainer}
          >
          {[
            {
              emoji: "✨",
              title: "AI 자동 생성",
              description: "최첨단 AI 기술로 당신만의 맞춤형 인테리어를 즉시 생성합니다",
            },
            {
              emoji: "⚡",
              title: "빠른 디자인",
              description: "몇 분 안에 다양한 스타일의 인테리어 시안을 확인하세요",
            },
            {
              emoji: "💡",
              title: "무한한 아이디어",
              description: "다양한 컨셉과 스타일로 당신의 공간을 완벽하게 연출합니다",
            },
            {
              emoji: "🗂️",
              title: "프로젝트 관리",
              description: "진행 중인 모든 프로젝트를 한눈에 관리하고 추적하세요",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                padding: "40px 30px",
                borderRadius: "20px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                textAlign: "center",
                cursor: "pointer",
              }}
              variants={fadeUp}
              whileHover={{
                y: -10,
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 107, 53, 0.3)",
                transition: { duration: 0.3 },
              }}
            >
              <motion.div
                style={{
                  margin: "0 auto 25px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <span style={{ fontSize: "4em" }}>{feature.emoji}</span>
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
                  color: "rgba(255, 255, 255, 0.7)",
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
              gap: "60px",
              marginTop: "100px",
              padding: "60px 40px",
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              borderRadius: "25px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
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
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <h2
                  style={{
                    fontSize: "clamp(2.5rem, 5vw, 4rem)",
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    marginBottom: "10px",
                  }}
                >
                  {stat.value}
                </h2>
                <p
                  style={{
                    fontSize: "1.1rem",
                    color: "rgba(255, 255, 255, 0.8)",
                    margin: 0,
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}

export default Hero;
