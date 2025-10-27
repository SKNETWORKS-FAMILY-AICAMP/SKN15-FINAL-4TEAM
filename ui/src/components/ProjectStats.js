function ProjectStats() {
  const stats = [
    { title: "총 프로젝트", value: 12, change: "+2 이번 달" },
    { title: "진행 중인 프로젝트", value: 5, change: "+1 이번 달" },
    { title: "완료된 프로젝트", value: 7, change: "-1 지난 달" },
    { title: "생성된 시안", value: 138, change: "+30 이번 주" },
  ];

  return (
    <div className="stats-container">
      {stats.map((item, idx) => (
        <div key={idx} className="stat-card">
          <h3>{item.title}</h3>
          <p className="stat-value">{item.value}</p>
          <span className="stat-change">{item.change}</span>
        </div>
      ))}
      <button className="new-project-btn">+ 새 프로젝트 생성</button>
    </div>
  );
}

export default ProjectStats;
