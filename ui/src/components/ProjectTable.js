function ProjectTable() {
  const rows = [
    { name: "판교 타운하우스 A타입", client: "김민준", status: "진행중", update: "2025.09.24", manager: "이수현" },
    { name: "모피스빌딩 B동 로비", client: "(주)글로벌 건설", status: "초기 상담 중", update: "2025.09.23", manager: "이수현" },
    { name: "디자인 리빙 쇼룸", client: "(주)아트앤디자인", status: "완료", update: "2025.09.20", manager: "이수현" },
  ];

  return (
    <div className="recent-section">
      <h2>최근 프로젝트</h2>
      <table className="project-table">
        <thead>
          <tr>
            <th>프로젝트명</th>
            <th>클라이언트</th>
            <th>상태</th>
            <th>최근 업데이트</th>
            <th>담당자</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.name}</td>
              <td>{r.client}</td>
              <td><span className={`status ${r.status === "완료" ? "done" : r.status === "진행중" ? "progress" : "pending"}`}>{r.status}</span></td>
              <td>{r.update}</td>
              <td>{r.manager}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProjectTable;
