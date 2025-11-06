import { useEffect, useMemo, useState } from "react";
import "../App.css";

const CARDS_PER_PAGE = 4;

function ProjectCards({ projects = [] }) {
  const visibleProjects = useMemo(
    () => projects.filter((p) => p.status === "progress"),
    [projects]
  );

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

  const handlePrev = () => setPage((prev) => Math.max(1, prev - 1));
  const handleNext = () => setPage((prev) => Math.min(totalPages, prev + 1));

  return (
    <div className="project-section">
      <h2>현재 진행중인 인테리어 프로젝트</h2>
      <div className="project-cards">
        {paginatedProjects.length > 0 ? (
          paginatedProjects.map((p) => {
            const hasImage = Boolean(p.project_image);

            return (
              <div key={p.id} className="project-card">
                <div
                  className={`project-card__media ${hasImage ? "has-image" : ""}`}
                >
                  {hasImage ? (
                    <img src={p.project_image} alt={p.title} />
                  ) : (
                    <div className="project-card__placeholder">
                      <span>이미지가 준비되지 않았습니다</span>
                    </div>
                  )}
                </div>

                <div className="project-card__body">
                  <p className="project-card__title">{p.title}</p>
                  <span className="project-card__date">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleDateString()
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
            className="pagination-button"
            onClick={handlePrev}
            disabled={page === 1}
          >
            이전
          </button>
          <span className="pagination-info">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className="pagination-button"
            onClick={handleNext}
            disabled={page === totalPages}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

export default ProjectCards;
