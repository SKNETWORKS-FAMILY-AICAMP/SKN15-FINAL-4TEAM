import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStatusInfo, normalizeStatus } from "../utils/statusStyles";
import "../App.css";

const CARDS_PER_PAGE = 4;

function ProjectCards({ projects = [] }) {
  const navigate = useNavigate();

  const visibleProjects = useMemo(() => {
    return (projects || []).filter((project) => {
      const status = normalizeStatus(project.status);
      return status === "progress";
    });
  }, [projects]);

  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(visibleProjects.length / CARDS_PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [visibleProjects.length]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedProjects = useMemo(() => {
    const start = (page - 1) * CARDS_PER_PAGE;
    return visibleProjects.slice(start, start + CARDS_PER_PAGE);
  }, [visibleProjects, page]);

  const handleCardClick = (project) => {
    if (!project?.id) {
      return;
    }
    navigate(`/results/${project.id}`);
  };

  const handleCardKeyDown = (event, project) => {
    if (!project?.id) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleCardClick(project);
    }
  };

  const handlePrev = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

  return (
    <div className="project-section">
      <div className="project-cards">
        {paginatedProjects.length > 0 ? (
          paginatedProjects.map((p) => {
            const imageSrc = p.project_image || p.imagePreview || p.image || "";
            const hasImage = Boolean(imageSrc);
            const isClickable = Boolean(p?.id);
            const cardClassName = `project-card${isClickable ? " project-card--clickable" : ""}`;

            const statusInfo = getStatusInfo(p.status);
            return (
              <div
                key={p.id || p.title}
                className={cardClassName}
                onClick={isClickable ? () => handleCardClick(p) : undefined}
                onKeyDown={isClickable ? (event) => handleCardKeyDown(event, p) : undefined}
                role={isClickable ? "button" : undefined}
                tabIndex={isClickable ? 0 : undefined}
              >
                <div
                  className="project-card__status"
                  style={{
                    background: statusInfo.gradient,
                    color: statusInfo.textColor,
                    boxShadow: statusInfo.shadow,
                  }}
                >
                  {statusInfo.label}
                </div>
                <div
                  className={`project-card__media ${hasImage ? "has-image" : ""}`}
                >
                  {hasImage ? (
                    <img src={imageSrc} alt={p.title} />
                  ) : (
                    <div className="project-card__placeholder">
                      <span>이미지가 준비되지 않았습니다</span>
                    </div>
                  )}
                </div>

                <div className="project-card__body">
                  <p className="project-card__title">{p.title}</p>
                  <span className="project-card__date">
                    {p.created_at || p.createdAt
                      ? new Date(p.created_at || p.createdAt).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ color: "#666", textAlign: "center" }}>
            진행 중인 프로젝트가 없습니다.
          </p>
        )}
      </div>

      {visibleProjects.length > CARDS_PER_PAGE && (
        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-button dark"
            onClick={handlePrev}
            disabled={page === 1}
          >
            <span className="chevron">‹</span> 이전
          </button>
          <span className="pagination-info dark">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className="pagination-button dark"
            onClick={handleNext}
            disabled={page === totalPages}
          >
            다음 <span className="chevron">›</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ProjectCards;
