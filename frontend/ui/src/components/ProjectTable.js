import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./ProjectTable.css";

const ROWS_PER_PAGE = 5;

function ProjectTable({ projects = [], onStatusChange }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(projects.length / ROWS_PER_PAGE));

  useEffect(() => {
    setPage(1);
  }, [projects.length]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedProjects = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return projects.slice(start, start + ROWS_PER_PAGE);
  }, [projects, page]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.patch(
        `http://${window.location.hostname}:9000/api/projects/${id}/update/`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (onStatusChange) {
        onStatusChange(id, newStatus);
      }
      console.log("✅ 상태 변경 완료:", res.data);
    } catch (error) {
      console.error("❌ 상태 변경 실패:", error);
    }
  };

  return (
    <div className="recent-section">
      <h2>최근 프로젝트</h2>
      <table className="project-table">
        <thead>
          <tr>
            <th>프로젝트명</th>
            <th>상태</th>
            <th>생성일</th>
            <th>업데이트일</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProjects.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>
                <select
                  value={p.status}
                  onChange={(e) => handleStatusChange(p.id, e.target.value)}
                >
                  <option value="progress">진행 중</option>
                  <option value="completed">완료</option>
                  <option value="pending">대기</option>
                </select>
              </td>
              <td>
                {p.created_at
                  ? new Date(p.created_at).toLocaleDateString()
                  : "-"}
              </td>
              <td>
                {p.updated_at
                  ? new Date(p.updated_at).toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {projects.length > ROWS_PER_PAGE && (
        <div className="pagination-controls">
          <button
            type="button"
            className="pagination-button"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
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
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
}

export default ProjectTable;
