import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Papa from "papaparse";
import "../App.css";

function ResourcesPage() {
  const [activeRoomCategory, setActiveRoomCategory] = useState("all");
  const [activeSmallCategory, setActiveSmallCategory] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [furnitureData, setFurnitureData] = useState([]);
  const [roomCategories, setRoomCategories] = useState([]);
  const [smallCategories, setSmallCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 12;

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

  // CSV 파일에서 데이터 로드
  useEffect(() => {
    setIsLoading(true);
    fetch("/20251020_가구종합.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data.map((item, index) => ({
              id: `${item.goods_id}_${index}`,
              goods_id: item.goods_id,
              name: item.goods_name,
              price: item.price,
              imageUrl: item["Image URL"],
              roomName: item.room_name,
              smallCatName: item.small_cat_name,
            }));

            setFurnitureData(data);
            setIsLoading(false);

            // room_name으로 카테고리 추출
            const uniqueRooms = [...new Set(data.map((item) => item.roomName))].filter(Boolean);
            setRoomCategories([{ id: "all", label: "전체" }, ...uniqueRooms.map((room) => ({ id: room, label: room }))]);

            // small_cat_name으로 서브 카테고리 추출
            const uniqueSmallCats = [...new Set(data.map((item) => item.smallCatName))].filter(Boolean);

            // 단일 단어 카테고리와 복합 단어 카테고리 분리
            const singleWordCats = uniqueSmallCats.filter(cat => {
              const words = cat.trim().split(/[\s,/]+/);
              return words.length === 1;
            });

            const multiWordCats = uniqueSmallCats.filter(cat => {
              const words = cat.trim().split(/[\s,/]+/);
              return words.length > 1;
            });

            // 카테고리 구성: 전체 + 단일 단어 + 세트
            const categories = [
              { id: "all", label: "전체" },
              ...singleWordCats.map((cat) => ({ id: cat, label: cat })),
            ];

            // 복합 단어 카테고리가 있으면 "세트" 추가
            if (multiWordCats.length > 0) {
              categories.push({ id: "set", label: "세트" });
            }

            setSmallCategories(categories);
          },
        });
      })
      .catch((error) => {
        console.error("CSV 로드 오류:", error);
        setIsLoading(false);
      });
  }, []);

  // 필터링 로직
  const filteredFurniture = furnitureData.filter((item) => {
    const roomMatch = activeRoomCategory === "all" || item.roomName === activeRoomCategory;

    // "세트" 카테고리 선택 시: 2개 이상의 단어를 가진 카테고리만 표시
    let smallCatMatch;
    if (activeSmallCategory === "set") {
      const words = item.smallCatName?.trim().split(/[\s,/]+/) || [];
      smallCatMatch = words.length > 1;
    } else if (activeSmallCategory === "all") {
      smallCatMatch = true;
    } else {
      smallCatMatch = item.smallCatName === activeSmallCategory;
    }

    const searchMatch = item.name?.toLowerCase().includes(searchText.toLowerCase());
    return roomMatch && smallCatMatch && searchMatch;
  });

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredFurniture.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFurniture = filteredFurniture.slice(startIndex, endIndex);

  // 카테고리 변경 시 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [activeRoomCategory, activeSmallCategory, searchText]);

  // 페이지 번호 생성 함수 (최대 10개까지만 표시)
  const getPageNumbers = () => {
    const maxPagesToShow = 10;
    const pages = [];

    if (totalPages <= maxPagesToShow) {
      // 페이지가 10개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 페이지가 10개 초과일 때
      if (currentPage <= 6) {
        // 앞쪽에 있을 때: 1 2 3 4 5 6 7 8 9 10
        for (let i = 1; i <= 10; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 5) {
        // 뒤쪽에 있을 때: (totalPages-9) ... totalPages
        for (let i = totalPages - 9; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 중간에 있을 때: (currentPage-4) ... (currentPage+5)
        for (let i = currentPage - 4; i <= currentPage + 5; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  };

  // room 카테고리 변경 시 small 카테고리 필터링
  const availableSmallCategories = activeRoomCategory === "all"
    ? smallCategories
    : (() => {
        const filteredCats = smallCategories.filter((cat) => {
          if (cat.id === "all" || cat.id === "set") return true;
          return furnitureData.some(
            (item) => item.roomName === activeRoomCategory && item.smallCatName === cat.id
          );
        });

        // "세트" 카테고리가 해당 room에 복합 단어 카테고리가 있는지 확인
        const hasMultiWord = furnitureData.some((item) => {
          if (item.roomName !== activeRoomCategory) return false;
          const words = item.smallCatName?.trim().split(/[\s,/]+/) || [];
          return words.length > 1;
        });

        return filteredCats.filter(cat => cat.id !== "set" || hasMultiWord);
      })();

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
        {/* Room Category Filters (큰 카테고리) */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{
            textAlign: "center",
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#495057",
            marginBottom: "15px"
          }}>
            공간 선택
          </h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            {roomCategories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => {
                  setActiveRoomCategory(category.id);
                  setActiveSmallCategory("all");
                }}
                style={{
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "25px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  background:
                    activeRoomCategory === category.id
                      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      : "#fff",
                  color: activeRoomCategory === category.id ? "#fff" : "#333",
                  boxShadow:
                    activeRoomCategory === category.id
                      ? "0 8px 20px rgba(102, 126, 234, 0.3)"
                      : "0 2px 8px rgba(0, 0, 0, 0.08)",
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(102, 126, 234, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                {category.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Small Category Filters (작은 카테고리) */}
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{
            textAlign: "center",
            fontSize: "1.1rem",
            fontWeight: 600,
            color: "#495057",
            marginBottom: "15px"
          }}>
            가구 종류
          </h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              justifyContent: "center",
            }}
          >
            {availableSmallCategories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveSmallCategory(category.id)}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "20px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  background:
                    activeSmallCategory === category.id
                      ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                      : "#fff",
                  color: activeSmallCategory === category.id ? "#fff" : "#333",
                  boxShadow:
                    activeSmallCategory === category.id
                      ? "0 6px 15px rgba(245, 87, 108, 0.3)"
                      : "0 2px 8px rgba(0, 0, 0, 0.08)",
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 8px 20px rgba(245, 87, 108, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                {category.label}
              </motion.button>
            ))}
          </div>
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
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 20px",
        }}
      >
        {isLoading ? (
          <div style={{
            textAlign: "center",
            padding: "100px 20px",
            color: "#667eea",
            fontSize: "1.2rem"
          }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: "3rem", marginBottom: "20px", display: "block" }}></i>
            가구 데이터를 불러오는 중...
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "30px",
            }}
          >
            {currentFurniture.length > 0 ? (
              currentFurniture.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "20px",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-10px)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.08)";
                  }}
                >
                  {/* Image */}
                  <div
                    style={{
                      width: "100%",
                      height: "220px",
                      overflow: "hidden",
                      position: "relative",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        loading="lazy"
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
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: item.imageUrl ? "none" : "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f0f0f0",
                        color: "#999",
                        fontSize: "1rem",
                      }}
                    >
                      이미지 없음
                    </div>
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
                    {item.smallCatName}
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
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px"
                  }}>
                    <span style={{
                      fontSize: "0.9em",
                      color: "#6c757d",
                    }}>
                      {item.roomName}
                    </span>
                    <span style={{
                      fontSize: "1.1em",
                      fontWeight: 700,
                      color: "#667eea",
                    }}>
                      {item.price ? `₩${parseInt(item.price).toLocaleString()}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "60px 20px",
              }}
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
            </div>
          )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredFurniture.length > 0 && totalPages > 1 && (
        <motion.div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            marginTop: "50px",
            marginBottom: "30px",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            {getPageNumbers().map((page) => (
              <motion.button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: "8px 14px",
                  border: currentPage === page ? "2px solid #667eea" : "1px solid #dee2e6",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  fontWeight: currentPage === page ? 700 : 500,
                  cursor: "pointer",
                  background: currentPage === page ? "#667eea" : "#fff",
                  color: currentPage === page ? "#fff" : "#495057",
                  transition: "all 0.2s ease",
                  minWidth: "40px",
                }}
                whileHover={{
                  scale: 1.05,
                  borderColor: "#667eea",
                }}
                whileTap={{ scale: 0.95 }}
              >
                {page}
              </motion.button>
            ))}

            {/* 다음 페이지 화살표 */}
            {currentPage < totalPages && (
              <motion.button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #dee2e6",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  background: "#fff",
                  color: "#667eea",
                  transition: "all 0.2s ease",
                }}
                whileHover={{
                  scale: 1.05,
                  borderColor: "#667eea",
                  background: "#f8f9fa",
                }}
                whileTap={{ scale: 0.95 }}
              >
                다음 <i className="fas fa-chevron-right"></i>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

    </main>
  );
}

export default ResourcesPage;
