import { useState } from "react";
import { motion } from "framer-motion";
import "../App.css";

function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchText, setSearchText] = useState("");

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

  // 목업 데이터 - 나중에 DB에서 가져올 데이터
  // TODO: API 연동 시 이 부분을 fetch/axios로 교체
  const furnitureData = [
    {
      id: 1,
      category: "sofa",
      name: "제로 501 3인용 가죽 소파",
      description: "착좌감이 편안한 부드러운 가죽 소파로, 거실을 우아하게 연출합니다.",
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
    },
    {
      id: 2,
      category: "bed",
      name: "제로 503 침대",
      description: "깔끔한 디자인과 견고한 프레임으로 수면을 돕는 침대입니다.",
      imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500",
    },
    {
      id: 3,
      category: "table",
      name: "제로 502 다이닝 테이블",
      description: "모던한 디자인의 다이닝 테이블로, 가족 식사 공간을 업그레이드합니다.",
      imageUrl: "https://images.unsplash.com/photo-1517705008128-361805f42e86?w=500",
    },
    {
      id: 4,
      category: "storage",
      name: "제로 504 5단 서랍장",
      description: "넉넉한 수납 공간과 세련된 디자인으로 어떤 공간에도 잘 어울립니다.",
      imageUrl: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500",
    },
    {
      id: 5,
      category: "sofa",
      name: "컴포트 릴렉스 소파",
      description: "깊이감 있는 좌방석과 편안한 등받이로 완벽한 휴식을 제공합니다.",
      imageUrl: "https://images.unsplash.com/photo-1550254478-ead40cc54513?w=500",
    },
    {
      id: 6,
      category: "bed",
      name: "모던 플랫폼 침대",
      description: "침대 아래 평판이 통합된 플랫폼으로 실용적이며 공간 효율적입니다.",
      imageUrl: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=500",
    },
    {
      id: 7,
      category: "table",
      name: "루체 콘솔 테이블",
      description: "현관이나 거실에 포인트를 주는 슬림한 디자인의 콘솔 테이블입니다.",
      imageUrl: "https://images.unsplash.com/photo-1557979619-445218f326b9?w=500",
    },
    {
      id: 8,
      category: "storage",
      name: "키즈 수납장",
      description: "아이들의 장난감이나 옷을 깔끔하게 정리할 수 있는 다용도 수납장입니다.",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
    },
  ];

  // 카테고리 버튼 데이터
  const categories = [
    { id: "all", label: "전체", icon: "fas fa-th" },
    { id: "sofa", label: "소파", icon: "fas fa-couch" },
    { id: "bed", label: "침대", icon: "fas fa-bed" },
    { id: "table", label: "식탁/테이블", icon: "fas fa-table" },
    { id: "storage", label: "수납장", icon: "fas fa-box" },
  ];

  // 필터링 로직
  const filteredFurniture = furnitureData.filter((item) => {
    const categoryMatch = activeCategory === "all" || item.category === activeCategory;
    const searchMatch = item.name.toLowerCase().includes(searchText.toLowerCase());
    return categoryMatch && searchMatch;
  });

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
          한샘 가구 둘러보기
        </motion.h1>
        <motion.p
          style={{
            fontSize: "1.2rem",
            opacity: 0.95,
            margin: 0,
          }}
          variants={fadeUp}
        >
          다양한 스타일의 가구를 탐색하고 영감을 얻으세요
        </motion.p>
      </motion.div>

      {/* Controls Section */}
      <motion.div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 40px",
          padding: "0 20px",
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        {/* Category Filters */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            justifyContent: "center",
            marginBottom: "30px",
          }}
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: "25px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
                background:
                  activeCategory === category.id
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#fff",
                color: activeCategory === category.id ? "#fff" : "#333",
                boxShadow:
                  activeCategory === category.id
                    ? "0 8px 20px rgba(102, 126, 234, 0.3)"
                    : "0 2px 8px rgba(0, 0, 0, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 25px rgba(102, 126, 234, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <i className={category.icon}></i>
              {category.label}
            </motion.button>
          ))}
        </div>

        {/* Search Bar */}
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          <i
            className="fas fa-search"
            style={{
              position: "absolute",
              left: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#999",
              fontSize: "1.1em",
            }}
          ></i>
          <input
            type="text"
            placeholder="가구 검색..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              width: "100%",
              padding: "16px 20px 16px 50px",
              border: "2px solid #e9ecef",
              borderRadius: "25px",
              fontSize: "1rem",
              boxSizing: "border-box",
              transition: "all 0.3s ease",
              background: "#fff",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#667eea";
              e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e9ecef";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
      </motion.div>

      {/* Furniture Grid */}
      <motion.div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={staggerContainer}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "30px",
          }}
        >
          {filteredFurniture.length > 0 ? (
            filteredFurniture.map((item) => (
              <motion.div
                key={item.id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "20px",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                variants={fadeUp}
                whileHover={{
                  y: -10,
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                }}
              >
                {/* Image */}
                <div
                  style={{
                    width: "100%",
                    height: "220px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
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
                  {/* Category Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "15px",
                      right: "15px",
                      padding: "6px 14px",
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "15px",
                      fontSize: "0.85em",
                      fontWeight: 600,
                      color: "#667eea",
                    }}
                  >
                    {categories.find((c) => c.id === item.category)?.label || item.category}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "25px" }}>
                  <h3
                    style={{
                      fontSize: "1.3em",
                      fontWeight: 700,
                      margin: "0 0 12px",
                      color: "#333",
                    }}
                  >
                    {item.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.95em",
                      color: "#6c757d",
                      lineHeight: "1.6",
                      margin: 0,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "60px 20px",
              }}
              variants={fadeUp}
            >
              <i
                className="fas fa-search"
                style={{
                  fontSize: "4em",
                  color: "#dee2e6",
                  marginBottom: "20px",
                  display: "block",
                }}
              ></i>
              <h3 style={{ fontSize: "1.5em", color: "#6c757d", margin: 0 }}>
                검색 결과가 없습니다
              </h3>
              <p style={{ color: "#adb5bd", marginTop: "10px" }}>
                다른 검색어나 카테고리를 선택해보세요
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Results Count */}
      {filteredFurniture.length > 0 && (
        <motion.div
          style={{
            textAlign: "center",
            marginTop: "50px",
            color: "#6c757d",
            fontSize: "1rem",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          총 <strong style={{ color: "#667eea" }}>{filteredFurniture.length}</strong>개의 가구를
          찾았습니다
        </motion.div>
      )}
    </main>
  );
}

export default ResourcesPage;
