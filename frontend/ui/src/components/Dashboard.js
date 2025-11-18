import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProjectStats from "./ProjectStats";
import ProjectCards from "./ProjectCards";
import ProjectTable from "./ProjectTable";
import NewProjectModal from "./NewProjectModal";
import { getProjects, getStats } from "../api/projectAPI";
import { normalizeStatus } from "../utils/statusStyles";
import "../App.css";

const DEFAULT_STATS = {
  total_projects: 0,
  in_progress: 0,
  completed: 0,
  recent_increase: 0,
  total_designs: 0,
};

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

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

  const loadFallbackProjects = useCallback(() => {
    const stored = localStorage.getItem("projects");
    if (!stored) {
      setProjects([]);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        setProjects([]);
        return;
      }

      const userProjects = parsed
        .filter((item) => item.userId === userId || item.user_id === userId)
        .map((project) => ({
          ...project,
          id: project.id,
          status: normalizeStatus(project.status),
          project_image:
            project.project_image || project.imagePreview || project.image || "",
          created_at:
            project.created_at || project.createdAt || project.created_at || null,
          updated_at:
            project.updated_at || project.updatedAt || project.updated_at || null,
          residence_type:
            project.residence_type || project.type || project.residenceType || "",
          space_type:
            project.space_type || project.space || project.spaceType || "",
          budget_range:
            project.budget_range || project.budget || project.budgetRange || "",
          family_type:
            project.family_type || project.family || project.familyType || "",
          design_style:
            project.design_style || project.style || project.designStyle || "",
          ai_image_count:
            project.ai_image_count ||
            project.aiImageCount ||
            project.aiImage_count ||
            0,
        }));

      setProjects(userProjects);
      setStats({
        total_projects: userProjects.length,
        in_progress: userProjects.filter((project) => project.status === "progress")
          .length,
        completed: userProjects.filter((project) => project.status === "completed")
          .length,
        recent_increase: 0,
        total_designs: userProjects.reduce(
          (sum, project) =>
            sum +
            (project.ai_image_count ??
              project.aiImageCount ??
              project.ai_imageCount ??
              0),
          0
        ),
      });
    } catch (error) {
      console.error("❌ 로컬 프로젝트 파싱 실패:", error);
      setProjects([]);
    }
  }, [userId]);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setProjects([]);
      setStats(DEFAULT_STATS);
      return;
    }

    try {
      const [projectResponse, statsResponse] = await Promise.all([
        getProjects(userId),
        getStats(userId),
      ]);

      const normalizedProjects = Array.isArray(projectResponse)
        ? projectResponse.map((project) => ({
            ...project,
            status: normalizeStatus(project.status),
            project_image:
              project.project_image || project.imagePreview || project.image || "",
            created_at:
              project.created_at || project.createdAt || project.created_at || null,
            updated_at:
              project.updated_at || project.updatedAt || project.updated_at || null,
            residence_type: project.residence_type || "",
            space_type: project.space_type || "",
            budget_range: project.budget_range || "",
            family_type: project.family_type || "",
            design_style: project.design_style || "",
          }))
        : [];

      setProjects(normalizedProjects);
      const computedDesigns = normalizedProjects.reduce(
        (sum, project) => sum + (project.ai_image_count || 0),
        0
      );
      const mergedStats = {
        ...DEFAULT_STATS,
        ...(statsResponse || {}),
      };
      if (
        mergedStats.total_designs === undefined ||
        mergedStats.total_designs === null
      ) {
        mergedStats.total_designs = computedDesigns;
      }
      setStats(mergedStats);
    } catch (error) {
      console.error("❌ 대시보드 데이터 로드 실패:", error);
      loadFallbackProjects();
    }
  }, [userId, loadFallbackProjects]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProjectCreated = (result) => {
    setIsModalOpen(false);
    fetchData();
    if (result?.project_id) {
      navigate(`/results/${result.project_id}`);
    }
  };

  const handleStatusUpdated = (projectId, newStatus) => {
    let previousStatus = null;
    const normalizedStatus = normalizeStatus(newStatus);
    setProjects((prev) =>
      prev.map((project) => {
        if (project.id === projectId) {
          previousStatus = normalizeStatus(project.status);
          return { ...project, status: normalizedStatus };
        }
        return project;
      })
    );
    if (previousStatus && previousStatus !== normalizedStatus) {
      setStats((prev) => {
        const updated = { ...prev };
        if (previousStatus === "progress") {
          updated.in_progress = Math.max(0, (updated.in_progress || 0) - 1);
        } else if (previousStatus === "completed") {
          updated.completed = Math.max(0, (updated.completed || 0) - 1);
        }

        if (normalizedStatus === "progress") {
          updated.in_progress = (updated.in_progress || 0) + 1;
        } else if (normalizedStatus === "completed") {
          updated.completed = (updated.completed || 0) + 1;
        }
        return updated;
      });
    }
    fetchData();
  };

  const handleProjectDeleted = useCallback((projectId) => {
    setProjects((prev) => {
      const removedProject = prev.find((project) => project.id === projectId);
      const next = prev.filter((project) => project.id !== projectId);
      if (removedProject) {
        setStats((prevStats) => {
          const updated = { ...prevStats };
          updated.total_projects = Math.max(0, (updated.total_projects || 0) - 1);
          const removedStatus = normalizeStatus(removedProject.status);
          if (removedStatus === "progress") {
            updated.in_progress = Math.max(0, (updated.in_progress || 0) - 1);
          } else if (removedStatus === "completed") {
            updated.completed = Math.max(0, (updated.completed || 0) - 1);
          }
          updated.total_designs = Math.max(
            0,
            (updated.total_designs || 0) - (removedProject.ai_image_count || 0)
          );
          return updated;
        });
      }
      return next;
    });
  }, []);

  const progressProjects = useMemo(
    () =>
      projects.filter((project) => {
        const status = normalizeStatus(project.status);
        return status === "progress";
      }),
    [projects]
  );

  const filteredProjects = useMemo(() => {
    if (statusFilter === "all") return projects;
    return projects.filter(
      (project) => normalizeStatus(project.status) === statusFilter
    );
  }, [projects, statusFilter]);

  const cardsProjects = useMemo(() => {
    if (statusFilter === "all") return progressProjects;
    return filteredProjects;
  }, [statusFilter, progressProjects, filteredProjects]);

  const hasProjects = projects.length > 0;

  const statusOptions = [
    { id: "all", label: "전체" },
    { id: "progress", label: "진행 중" },
    { id: "completed", label: "완료" },
    { id: "pending", label: "대기" },
  ];
  const selectedFilterLabel =
    statusOptions.find((option) => option.id === statusFilter)?.label || "전체";
  const cardsSectionTitle =
    statusFilter === "all"
      ? "현재 진행중인 프로젝트"
      : `${selectedFilterLabel} 프로젝트`;
  const cardsSectionSubtitle =
    statusFilter === "all"
      ? "카드당 4개씩 확인하고, 이전/다음 버튼으로 다른 프로젝트도 살펴보세요."
      : `${selectedFilterLabel} 상태에 해당하는 프로젝트만 모아서 보여줍니다.`;

  return (
    <main
      className="dashboard-page"
      style={{
        minHeight: "100vh",
        background: "#0a0a0a",
      }}
    >
      {/* Hero */}
      <motion.section
        className="page-hero"
        style={{
          background:
            "linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop') center/cover no-repeat",
        }}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <motion.span
          style={{
            display: "inline-block",
            padding: "10px 25px",
            border: "2px solid rgba(255, 107, 53, 0.8)",
            borderRadius: "30px",
            fontSize: "0.9rem",
            fontWeight: 600,
            letterSpacing: "0.14em",
            marginBottom: "30px",
            color: "#ff6b35",
            background: "rgba(0, 0, 0, 0.35)",
          }}
          variants={fadeUp}
        >
          PROJECT DASHBOARD
        </motion.span>

        <motion.h1
          style={{
            fontSize: "clamp(3rem, 6vw, 4.5rem)",
            fontWeight: 900,
            margin: "0 0 20px",
            lineHeight: 1.2,
            textShadow: "3px 3px 6px rgba(0,0,0,0.5)",
          }}
          variants={fadeUp}
        >
          My Projects
        </motion.h1>

        <motion.p
          style={{
            fontSize: "1.25rem",
            opacity: 0.9,
            margin: 0,
            maxWidth: "560px",
            lineHeight: 1.6,
          }}
          variants={fadeUp}
        >
          진행 중인 프로젝트와 현황을 한눈에 확인하고, 새로운 프로젝트를 바로 생성해
          보세요.
        </motion.p>

        <motion.button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            marginTop: "35px",
            padding: "16px 40px",
            background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "15px",
            fontSize: "1.05rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 15px 30px rgba(255, 107, 53, 0.35)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
          whileHover={{ scale: 1.02, boxShadow: "0 22px 40px rgba(255, 107, 53, 0.45)" }}
          whileTap={{ scale: 0.96 }}
        >
          <i className="fas fa-plus" /> 새 프로젝트 생성
        </motion.button>
      </motion.section>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 30px 60px" }}>
        <motion.section
          style={{ marginBottom: "60px" }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <ProjectStats stats={stats} onNewProject={() => setIsModalOpen(true)} />
        </motion.section>

        {hasProjects ? (
          <>
            <motion.section
              style={{ marginBottom: "60px" }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp}>
                <h2
                  style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    margin: "0 0 20px",
                    color: "#fff",
                  }}
                >
                  {cardsSectionTitle}
                </h2>
                <p style={{ color: "rgba(255, 255, 255, 0.6)", marginBottom: "25px" }}>
                  {cardsSectionSubtitle}
                </p>
              </motion.div>
              {cardsProjects.length > 0 ? (
                <ProjectCards projects={cardsProjects} statusFilter={statusFilter} />
              ) : (
                <motion.div
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "20px",
                    padding: "40px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    textAlign: "center",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                  variants={fadeUp}
                >
                  {statusFilter === "all"
                    ? '진행 중인 프로젝트가 아직 없습니다. 프로젝트 상태를 "진행 중"으로 업데이트하면 여기에서 확인할 수 있어요.'
                    : "선택한 상태에 해당하는 프로젝트가 없습니다."}
                </motion.div>
              )}
            </motion.section>

            <motion.section
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                  color: "#fff",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>
                    마이 프로젝트
                  </h2>
                  <p style={{ color: "rgba(255, 255, 255, 0.6)", marginTop: "10px" }}>
                    최근 프로젝트를 5개씩 확인하고 상태를 바로 변경할 수 있습니다.
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    flexWrap: "wrap",
                  }}
                >
                  {statusOptions.map((option) => {
                    const isActive = statusFilter === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setStatusFilter(option.id)}
                        style={{
                          padding: "10px 18px",
                          borderRadius: "999px",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          background: isActive
                            ? "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)"
                            : "rgba(255, 255, 255, 0.05)",
                          color: isActive ? "#fff" : "rgba(255, 255, 255, 0.8)",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {filteredProjects.length > 0 ? (
                <ProjectTable
                  projects={filteredProjects}
                  onStatusChange={handleStatusUpdated}
                  onDeleteProject={handleProjectDeleted}
                />
              ) : (
                <motion.div
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "20px",
                    padding: "40px",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    textAlign: "center",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                  variants={fadeUp}
                >
                  선택한 상태에 해당하는 프로젝트가 없습니다.
                </motion.div>
              )}
            </motion.section>
          </>
        ) : (
          <motion.section
            style={{
              textAlign: "center",
              padding: "80px 20px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
          >
            <motion.div
              style={{ fontSize: "4em", marginBottom: "20px" }}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            >
              📁
            </motion.div>
            <h3 style={{ fontSize: "2rem", fontWeight: 700, color: "#fff", marginBottom: 15 }}>
              아직 프로젝트가 없습니다
            </h3>
            <p style={{ color: "rgba(255, 255, 255, 0.65)", fontSize: "1.1rem" }}>
              새 프로젝트를 생성하여 인테리어 디자인을 시작해보세요!
            </p>
            <motion.button
              type="button"
              onClick={() => setIsModalOpen(true)}
              style={{
                marginTop: "25px",
                padding: "16px 40px",
                background: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "15px",
                fontSize: "1.05rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 15px 30px rgba(255, 107, 53, 0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
              }}
              whileHover={{ scale: 1.05, boxShadow: "0 22px 42px rgba(255, 107, 53, 0.45)" }}
              whileTap={{ scale: 0.96 }}
            >
              <i className="fas fa-plus" /> 첫 프로젝트 만들기
            </motion.button>
          </motion.section>
        )}
      </div>

      {isModalOpen && (
        <NewProjectModal
          onClose={() => setIsModalOpen(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </main>
  );
}

export default Dashboard;
