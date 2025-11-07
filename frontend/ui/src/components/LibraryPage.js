import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Papa from "papaparse";
import "../App.css";

const ITEMS_PER_PAGE = 10;
const PAPERS_PER_PAGE = 12;
const MAX_PAGE_BUTTONS = 10;

const normalizeText = (text) => {
  if (!text) return "";
  return text.toString().toLowerCase();
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
};

const getPageNumbers = (current, total) => {
  if (total <= MAX_PAGE_BUTTONS) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  if (current <= 6) {
    return Array.from({ length: MAX_PAGE_BUTTONS }, (_, index) => index + 1);
  }

  if (current >= total - 5) {
    return Array.from({ length: MAX_PAGE_BUTTONS }, (_, index) => total - (MAX_PAGE_BUTTONS - 1) + index);
  }

  return Array.from({ length: MAX_PAGE_BUTTONS }, (_, index) => current - 4 + index);
};

function LibraryPage() {
  const [searchInput, setSearchInput] = useState("");
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("news");
  const [newsData, setNewsData] = useState([]);
  const [blogData, setBlogData] = useState([]);
  const [paperData, setPaperData] = useState([]);
  const [paperKeywords, setPaperKeywords] = useState([]);
  const [activeKeyword, setActiveKeyword] = useState("all");
  const [newsPage, setNewsPage] = useState(1);
  const [blogPage, setBlogPage] = useState(1);
  const [currentPaperPage, setCurrentPaperPage] = useState(1);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [isLoadingPaper, setIsLoadingPaper] = useState(true);

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  useEffect(() => {
    setIsLoadingContent(true);
    fetch("/hanssem_contents.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data;

            const parseDate = (value) => {
              if (!value) return new Date(0);
              const parts = value.split("-");
              if (parts.length === 3) {
                return new Date(parts[0], parts[1] - 1, parts[2]);
              }
              return new Date(value);
            };

            const news = data
              .filter((item) => item.source === "news")
              .sort((a, b) => parseDate(b.pubdate) - parseDate(a.pubdate));

            const blogs = data
              .filter((item) => item.source === "blog")
              .sort((a, b) => parseDate(b.pubdate) - parseDate(a.pubdate));

            setNewsData(news);
            setBlogData(blogs);
            setIsLoadingContent(false);
          },
        });
      })
      .catch((error) => {
        console.error("hanssem_contents CSV 로드 오류:", error);
        setIsLoadingContent(false);
      });

    setIsLoadingPaper(true);
    fetch("/riss_FIN2.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data.map((item, index) => ({
              id: `paper_${index}`,
              database: item.database,
              keyword: item.keyword,
              title: item.title,
              authors: item.authors,
              publisher: item.publisher,
              journal: item.journal,
              issue: item.issue,
              year: item.year,
              link: item.link,
            }));

            setPaperData(data);
            const uniqueKeywords = [...new Set(data.map((item) => item.keyword))].filter(Boolean);
            setPaperKeywords(uniqueKeywords);
            setIsLoadingPaper(false);
          },
        });
      })
      .catch((error) => {
        console.error("riss_FIN2 CSV 로드 오류:", error);
        setIsLoadingPaper(false);
      });
  }, []);

  useEffect(() => {
    setNewsPage(1);
    setBlogPage(1);
    setCurrentPaperPage(1);
  }, [searchText]);

  useEffect(() => {
    setCurrentPaperPage(1);
  }, [activeKeyword]);

  useEffect(() => {
    if (activeCategory === "news") {
      setNewsPage(1);
    } else if (activeCategory === "blog") {
      setBlogPage(1);
    } else if (activeCategory === "paper") {
      setCurrentPaperPage(1);
    }
  }, [activeCategory]);

  const categories = [
    {
      id: "news",
      name: "News",
      subtitle: "업계 최신 기사",
      icon: "fas fa-newspaper",
    },
    {
      id: "blog",
      name: "Blog Posts",
      subtitle: "블로그 인사이트",
      icon: "fas fa-blog",
    },
    {
      id: "paper",
      name: "Research Papers",
      subtitle: "논문 자료",
      icon: "fas fa-file-alt",
    },
  ];

  const filteredNews = newsData.filter((item) =>
    normalizeText(item.title).includes(normalizeText(searchText))
  );
  const filteredBlog = blogData.filter((item) =>
    normalizeText(item.title).includes(normalizeText(searchText))
  );

  const filteredPapersBase =
    activeKeyword === "all"
      ? paperData
      : paperData.filter((paper) => paper.keyword === activeKeyword);

  const filteredPapers = filteredPapersBase.filter((paper) =>
    normalizeText(paper.title).includes(normalizeText(searchText))
  );

  const totalNewsPages = Math.max(1, Math.ceil(filteredNews.length / ITEMS_PER_PAGE));
  const totalBlogPages = Math.max(1, Math.ceil(filteredBlog.length / ITEMS_PER_PAGE));
  const totalPaperPages = Math.max(1, Math.ceil(filteredPapers.length / PAPERS_PER_PAGE));

  const currentNewsItems = filteredNews.slice(
    (newsPage - 1) * ITEMS_PER_PAGE,
    newsPage * ITEMS_PER_PAGE
  );
  const currentBlogItems = filteredBlog.slice(
    (blogPage - 1) * ITEMS_PER_PAGE,
    blogPage * ITEMS_PER_PAGE
  );
  const currentPapers = filteredPapers.slice(
    (currentPaperPage - 1) * PAPERS_PER_PAGE,
    currentPaperPage * PAPERS_PER_PAGE
  );

  const handleNewsPageChange = (page) => {
    const next = Math.min(Math.max(page, 1), totalNewsPages);
    setNewsPage(next);
  };

  const handleBlogPageChange = (page) => {
    const next = Math.min(Math.max(page, 1), totalBlogPages);
    setBlogPage(next);
  };

  const handlePaperPageChange = (page) => {
    const next = Math.min(Math.max(page, 1), totalPaperPages);
    setCurrentPaperPage(next);
  };

  const paginationStyles = {
    container: {
      marginTop: "30px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      flexWrap: "wrap",
    },
    button: (active = false) => ({
      minWidth: "44px",
      padding: "10px 16px",
      borderRadius: "12px",
      border: active ? "none" : "1px solid rgba(255, 255, 255, 0.2)",
      background: active ? "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)" : "rgba(255, 255, 255, 0.05)",
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.3s ease",
      opacity: active ? 1 : 0.8,
    }),
  };

  const renderPagination = (current, total, onChange) => {
    if (total <= 1) return null;
    const pages = getPageNumbers(current, total);

    return (
      <div style={paginationStyles.container}>
        <button
          type="button"
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          style={{
            ...paginationStyles.button(),
            opacity: current === 1 ? 0.4 : 0.8,
            cursor: current === 1 ? "default" : "pointer",
          }}
        >
          이전
        </button>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {pages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onChange(page)}
              style={paginationStyles.button(page === current)}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onChange(current + 1)}
          disabled={current === total}
          style={{
            ...paginationStyles.button(),
            opacity: current === total ? 0.4 : 0.8,
            cursor: current === total ? "default" : "pointer",
          }}
        >
          다음
        </button>
      </div>
    );
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#fff",
      }}
    >
      {/* Hero */}
      <motion.div
        className="page-hero"
        style={{
          background:
            "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat",
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
          DESIGN RESOURCES
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
          Asset Library
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
          인테리어 디자인 자료와 영감을 찾아보세요
        </motion.p>
      </motion.div>

      {/* Main Content */}
      <div style={{ display: "flex", maxWidth: "1400px", margin: "0 auto", gap: "30px" }}>
        {/* Sidebar */}
        <motion.aside
          style={{
            width: "280px",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            padding: "30px 25px",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
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
              color: "#fff",
              marginTop: 0,
              marginBottom: "30px",
            }}
          >
            카테고리
          </h2>

          {categories.map((category) => (
            <motion.div
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              style={{
                marginBottom: "15px",
                padding: "15px",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                background: activeCategory === category.id
                  ? "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)"
                  : "rgba(255, 255, 255, 0.05)",
                boxShadow: activeCategory === category.id
                  ? "0 5px 15px rgba(255, 107, 53, 0.3)"
                  : "none",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "8px",
                }}
              >
                <i
                  className={category.icon}
                  style={{
                    fontSize: "1.2rem",
                    color: activeCategory === category.id ? "#fff" : "#ff6b35",
                  }}
                ></i>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: activeCategory === category.id ? "#fff" : "rgba(255, 255, 255, 0.9)",
                    margin: 0,
                  }}
                >
                  {category.name}
                </h3>
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: activeCategory === category.id ? "rgba(255,255,255,0.9)" : "rgba(255, 255, 255, 0.6)",
                  paddingLeft: "32px",
                  margin: 0,
                }}
              >
                {category.subtitle}
              </p>
            </motion.div>
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
            animate="visible"
            variants={fadeUp}
          > 
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSearchText(searchInput.trim());
              }}
              style={{ display: "flex", gap: "12px", flexWrap: "wrap", flex: 1 }}
            >
              <input
                type="text"
                placeholder="Search any documents..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                style={{
                  flex: 1,
                  minWidth: "250px",
                  padding: "14px 20px",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  transition: "all 0.3s ease",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#fff",
                }}
                onFocus={(event) => {
                  event.target.style.borderColor = "#ff6b35";
                  event.target.style.boxShadow = "0 0 0 4px rgba(255, 107, 53, 0.1)";
                }}
                onBlur={(event) => {
                  event.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  event.target.style.boxShadow = "none";
                }}
              />
              <motion.button
                type="submit"
                style={{
                  padding: "14px 30px",
                  background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 12px 28px rgba(255, 107, 53, 0.35)",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Search
              </motion.button>
            </form>
            <motion.button
              style={{
                padding: "14px 25px",
                background: "rgba(255, 255, 255, 0.15)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
              }}
              whileHover={{ scale: 1.02, background: "rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.98 }}
            >
              <i className="fas fa-plus"></i>
              자료 업로드
            </motion.button>
          </motion.div>

          {/* News */}
          {activeCategory === "news" && (
            <section style={{ marginBottom: "50px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "25px",
                }}
              >
                <h2 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, color: "#fff" }}>
                  <i className="fas fa-newspaper" style={{ marginRight: "10px", color: "#ff6b35" }}></i>
                  최신 뉴스
                </h2>
              </div>
              {isLoadingContent ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "100px 20px",
                    color: "#ff6b35",
                    fontSize: "1.2rem",
                  }}
                >
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: "3rem", marginBottom: "20px", display: "block" }}></i>
                  뉴스 데이터를 불러오는 중...
                </div>
              ) : (
                <>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                    {currentNewsItems.map((item, index) => (
                      <li
                        key={item.link || `${item.title}-${index}`}
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "16px",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          padding: "20px",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <a
                          href={item.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "block",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "#fff",
                            marginBottom: "8px",
                            textDecoration: "none",
                          }}
                        >
                          {item.title}
                        </a>
                        <div style={{ display: "flex", gap: "12px", color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9rem" }}>
                          <span>{formatDate(item.pubdate)}</span>
                          {item.source && <span>• {item.source}</span>}
                        </div>
                        {item.description && (
                          <p style={{ marginTop: "12px", color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.6 }}>
                            {item.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                  {filteredNews.length === 0 && (
                    <p style={{ marginTop: "30px", color: "rgba(255, 255, 255, 0.6)", textAlign: "center" }}>
                      검색 조건에 맞는 뉴스가 없습니다.
                    </p>
                  )}
                  {renderPagination(newsPage, totalNewsPages, handleNewsPageChange)}
                </>
              )}
            </section>
          )}

          {/* Blog */}
          {activeCategory === "blog" && (
            <section style={{ marginBottom: "50px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "25px",
                }}
              >
                <h2 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, color: "#fff" }}>
                  <i className="fas fa-blog" style={{ marginRight: "10px", color: "#ff6b35" }}></i>
                  블로그 포스트
                </h2>
              </div>
              {isLoadingContent ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "100px 20px",
                    color: "#ff6b35",
                    fontSize: "1.2rem",
                  }}
                >
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: "3rem", marginBottom: "20px", display: "block" }}></i>
                  블로그 데이터를 불러오는 중...
                </div>
              ) : (
                <>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
                    {currentBlogItems.map((item, index) => (
                      <li
                        key={item.link || `${item.title}-${index}`}
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "16px",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          padding: "20px",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <a
                          href={item.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "block",
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "#fff",
                            marginBottom: "8px",
                            textDecoration: "none",
                          }}
                        >
                          {item.title}
                        </a>
                        <div style={{ display: "flex", gap: "12px", color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9rem" }}>
                          <span>{formatDate(item.pubdate)}</span>
                          {item.blog_name && <span>• {item.blog_name}</span>}
                        </div>
                        {item.description && (
                          <p style={{ marginTop: "12px", color: "rgba(255, 255, 255, 0.7)", lineHeight: 1.6 }}>
                            {item.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                  {filteredBlog.length === 0 && (
                    <p style={{ marginTop: "30px", color: "rgba(255, 255, 255, 0.6)", textAlign: "center" }}>
                      검색 조건에 맞는 블로그 포스트가 없습니다.
                    </p>
                  )}
                  {renderPagination(blogPage, totalBlogPages, handleBlogPageChange)}
                </>
              )}
            </section>
          )}

          {/* Papers */}
          {activeCategory === "paper" && (
            <section style={{ marginBottom: "50px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "25px",
                  flexWrap: "wrap",
                  gap: "16px",
                }}
              >
                <h2 style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0, color: "#fff" }}>
                  <i className="fas fa-file-alt" style={{ marginRight: "10px", color: "#ff6b35" }}></i>
                  논문
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveKeyword("all")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "20px",
                      border: activeKeyword === "all" ? "none" : "1px solid rgba(255, 255, 255, 0.25)",
                      background: activeKeyword === "all"
                        ? "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)"
                        : "rgba(255, 255, 255, 0.05)",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    전체
                  </button>
                  {paperKeywords.map((keyword) => (
                    <button
                      key={keyword}
                      type="button"
                      onClick={() => setActiveKeyword(keyword)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border: activeKeyword === keyword ? "none" : "1px solid rgba(255, 255, 255, 0.25)",
                        background: activeKeyword === keyword
                          ? "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)"
                          : "rgba(255, 255, 255, 0.05)",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      {keyword}
                    </button>
                  ))}
                </div>
              </div>

              {isLoadingPaper ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "100px 20px",
                    color: "#ff6b35",
                    fontSize: "1.2rem",
                  }}
                >
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: "3rem", marginBottom: "20px", display: "block" }}></i>
                  논문 데이터를 불러오는 중...
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: "grid",
                      gap: "24px",
                      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    }}
                  >
                    {currentPapers.map((paper) => (
                      <div
                        key={paper.id}
                        style={{
                          background: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "18px",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          padding: "24px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        <a
                          href={paper.link || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: "1.05rem",
                            fontWeight: 700,
                            color: "#fff",
                            textDecoration: "none",
                          }}
                        >
                          {paper.title}
                        </a>
                        <div style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.6)", lineHeight: 1.6 }}>
                          {paper.authors && <div>저자: {paper.authors}</div>}
                          {paper.year && <div>발행년도: {paper.year}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredPapers.length === 0 && (
                    <p style={{ marginTop: "30px", color: "rgba(255, 255, 255, 0.6)", textAlign: "center" }}>
                      검색 조건에 맞는 논문이 없습니다.
                    </p>
                  )}
                  {renderPagination(currentPaperPage, totalPaperPages, handlePaperPageChange)}
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

export default LibraryPage;
