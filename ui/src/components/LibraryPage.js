import { useState } from "react";
import { motion } from "framer-motion";
import "../App.css";

function LibraryPage() {
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

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

  // 카테고리 데이터
  const categories = [
    {
      name: "News & Blogs",
      subtitle: "뉴스 & 블로그",
      items: [],
    },
    {
      name: "Research Papers",
      subtitle: "논문",
      items: [],
    },
    {
      name: "Trends & Reports",
      subtitle: "트렌드 & 리포트",
      items: [],
    },
    {
      name: "References & Guides",
      subtitle: "레퍼런스",
      items: [],
    },
  ];

  // 추천 자료 데이터 (목업)
  const recommendedAssets = [
    {
      id: 1,
      title: "미니멀리즘 컨셉 거실 디자인",
      author: "서울 연대학",
      rating: 4.9,
      imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
    },
    {
      id: 2,
      title: "모던 키친 디자인 가이드 2024",
      author: "한샘 디자인팀",
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=500",
    },
    {
      id: 3,
      title: "따뜻한 감성의 침실 인테리어",
      author: "인테리어 스튜디오",
      rating: 4.7,
      imageUrl: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=500",
    },
    {
      id: 4,
      title: "우아한 다이닝룸 디자인",
      author: "홈스타일링 연구소",
      rating: 4.6,
      imageUrl: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500",
    },
    {
      id: 5,
      title: "편안한 욕실 디자인",
      author: "공간 플래너",
      rating: 4.5,
      imageUrl: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500",
    },
  ];

  // 전체 자료 데이터 (목업)
  const allAssets = [
    {
      id: 1,
      title: "2024 모던 거실 트렌드",
      author: "한샘 디자인팀",
      rating: 4.7,
      imageUrl: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=500",
      category: "Design",
    },
    {
      id: 2,
      title: "내추럴 우드 플로링 가이드",
      author: "건축 자재 연구소",
      rating: 4.7,
      imageUrl: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=500",
      category: "Trend",
    },
    {
      id: 3,
      title: "스마트 홈 인테리어 가이드",
      author: "홈 IoT 연구소",
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
      category: "Education",
    },
    {
      id: 4,
      title: "아이를 위한 안전한 방",
      author: "어린이 공간 연구소",
      rating: 4.6,
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
      category: "Human",
    },
    {
      id: 5,
      title: "북유럽 스타일 주방",
      author: "디자인 허브",
      rating: 4.9,
      imageUrl: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500",
      category: "Design",
    },
    {
      id: 6,
      title: "맞춤형 가구 제작 가이드",
      author: "가구 공방",
      rating: 4.5,
      imageUrl: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500",
      category: "Education",
    },
    {
      id: 7,
      title: "효율적인 수납 솔루션",
      author: "정리 수납 전문가",
      rating: 4.7,
      imageUrl: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500",
      category: "Philosophy",
    },
    {
      id: 8,
      title: "공간을 여는 조명 디자인",
      author: "라이팅 스튜디오",
      rating: 4.8,
      imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500",
      category: "Design",
    },
  ];

  // 필터 버튼 데이터
  const filters = ["All", "Design", "Human", "Philosophy", "Trend", "Education"];

  // 필터링 로직
  const filteredAssets = allAssets.filter((asset) => {
    const categoryMatch = activeFilter === "All" || asset.category === activeFilter;
    const searchMatch = asset.title.toLowerCase().includes(searchText.toLowerCase());
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
          marginBottom: "0",
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
          Asset Library
        </motion.h1>
        <motion.p
          style={{
            fontSize: "1.2rem",
            opacity: 0.95,
            margin: 0,
          }}
          variants={fadeUp}
        >
          인테리어 디자인 자료와 영감을 찾아보세요
        </motion.p>
      </motion.div>

      {/* Main Content */}
      <div style={{ display: "flex", maxWidth: "1400px", margin: "0 auto", gap: "30px" }}>
        {/* Sidebar */}
        <motion.aside
          style={{
            width: "280px",
            background: "#fff",
            padding: "30px 25px",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
            margin: "30px 0 30px 30px",
            height: "fit-content",
            position: "sticky",
            top: "100px",
          }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#333",
              marginTop: 0,
              marginBottom: "30px",
            }}
          >
            카테고리
          </h2>

          {categories.map((category, index) => (
            <div key={index} style={{ marginBottom: "25px" }}>
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "#667eea",
                  marginBottom: "10px",
                  paddingLeft: "10px",
                }}
              >
                {category.name}
              </h3>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "#6c757d",
                  paddingLeft: "10px",
                  margin: 0,
                }}
              >
                {category.subtitle}
              </p>
            </div>
          ))}
        </motion.aside>

        {/* Content Area */}
        <div style={{ flex: 1, padding: "30px 30px 30px 0" }}>
          {/* Search Bar */}
          <motion.div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "40px",
              flexWrap: "wrap",
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <input
              type="text"
              placeholder="Search any documents..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                flex: 1,
                minWidth: "250px",
                padding: "14px 20px",
                border: "2px solid #e9ecef",
                borderRadius: "12px",
                fontSize: "1rem",
                transition: "all 0.3s ease",
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
            <motion.button
              style={{
                padding: "14px 30px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(102, 126, 234, 0.3)",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Search
            </motion.button>
            <motion.button
              style={{
                padding: "14px 25px",
                background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 8px 20px rgba(67, 233, 123, 0.3)",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="fas fa-plus"></i>
              자료 업로드
            </motion.button>
          </motion.div>

          {/* Recommended Section */}
          <motion.section
            style={{ marginBottom: "50px" }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
              }}
            >
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, color: "#333" }}>
                Recommended
              </h2>
              <a
                href="#"
                style={{
                  color: "#667eea",
                  textDecoration: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                }}
              >
                See All &gt;
              </a>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >
              {recommendedAssets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} variants={fadeUp} />
              ))}
            </div>
          </motion.section>

          {/* All Assets Section */}
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
                flexWrap: "wrap",
                gap: "15px",
              }}
            >
              <h2 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, color: "#333" }}>
                All Assets
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {filters.map((filter) => (
                  <motion.button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    style={{
                      padding: "8px 18px",
                      border: "none",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      background:
                        activeFilter === filter
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "#f0f0f0",
                      color: activeFilter === filter ? "#fff" : "#555",
                      boxShadow:
                        activeFilter === filter
                          ? "0 5px 15px rgba(102, 126, 234, 0.3)"
                          : "none",
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {filter}
                  </motion.button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} variants={fadeUp} />
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
                </motion.div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}

// Asset Card Component
function AssetCard({ asset, variants }) {
  return (
    <motion.div
      style={{
        backgroundColor: "#fff",
        borderRadius: "15px",
        overflow: "hidden",
        boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)",
        transition: "all 0.3s ease",
        cursor: "pointer",
        position: "relative",
      }}
      variants={variants}
      whileHover={{
        y: -8,
        boxShadow: "0 15px 30px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", overflow: "hidden", height: "140px" }}>
        <img
          src={asset.imageUrl}
          alt={asset.title}
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
        {/* Rating Badge */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(10px)",
            color: "#fff",
            padding: "5px 10px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <i className="fas fa-star" style={{ color: "#ffc107" }}></i>
          {asset.rating}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "15px" }}>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "#333",
            margin: "0 0 8px",
            lineHeight: "1.4",
          }}
        >
          {asset.title}
        </h3>
        <p
          style={{
            fontSize: "0.85rem",
            color: "#6c757d",
            margin: 0,
          }}
        >
          by {asset.author}
        </p>
      </div>
    </motion.div>
  );
}

export default LibraryPage;
