function ProjectCards() {
  const projects = [
    { title: "판교 타운하우스 A타입", image: "https://via.placeholder.com/350x200" },
    { title: "모피스빌딩 B동 로비", image: "https://via.placeholder.com/350x200" },
    { title: "디자인 리빙 쇼룸", image: "https://via.placeholder.com/350x200" },
  ];

  return (
    <div className="project-section">
      <h2>현재 진행중인 인테리어 가상</h2>
      <div className="project-cards">
        {projects.map((p, i) => (
          <div key={i} className="project-card">
            <img src={p.image} alt={p.title} />
            <p>{p.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectCards;
