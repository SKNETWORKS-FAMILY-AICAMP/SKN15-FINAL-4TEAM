import { motion } from "framer-motion";

const CARD_CONFIG = [
  {
    label: "총 프로젝트",
    emoji: "📁",
    value: (stats) => stats.total_projects ?? stats.total ?? 0,
    note: (value) => `${value}개 프로젝트`,
  },
  {
    label: "진행 중인 프로젝트",
    emoji: "⚡",
    value: (stats) => stats.in_progress ?? stats.inProgress ?? 0,
    note: (value) => `${value}개 진행중`,
  },
  {
    label: "완료된 프로젝트",
    emoji: "✅",
    value: (stats) => stats.completed ?? stats.completed_projects ?? 0,
    note: (value) => `${value}개 완료`,
  },
  {
    label: "생성된 시안",
    emoji: "🖼️",
    value: (stats) =>
      stats.total_designs ??
      stats.generated_designs ??
      stats.designs ??
      stats.design_count ??
      0,
    note: (value) => `총 ${value}개`,
  },
];

function ProjectStats({ stats, onNewProject }) {
  const safeStats = stats || {};

  return (
    <motion.section
      className="stats-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="stats-header">
        <div className="stats-header__copy">
          <p className="stats-eyebrow">Dashboard</p>
          <h2>프로젝트 현황 요약</h2>
          <p className="stats-subcopy">
            최근 30일 기준으로 집계된 지표입니다. 실시간 진행 상황을 확인해 보세요.
          </p>
        </div>

        {onNewProject && (
          <motion.button
            type="button"
            className="new-project-btn"
            onClick={onNewProject}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            + 새 프로젝트 생성
          </motion.button>
        )}
      </div>

      <div className="stats-grid">
        {CARD_CONFIG.map((card, index) => {
          const rawValue = Number(card.value(safeStats)) || 0;

          return (
            <motion.div
              key={card.label}
              className="stats-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              variants={{
                hover: { y: -8 },
              }}
              whileHover="hover"
            >
              <motion.div
                className="stats-card__icon"
                aria-hidden="true"
                variants={{
                  hover: { rotate: 360 },
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <span role="img" aria-hidden="true">
                  {card.emoji}
                </span>
              </motion.div>
              <div className="stats-card__meta">
                <span className="stats-card__label">{card.label}</span>
                <span className="stats-card__value">
                  {rawValue}
                </span>
                <span className="stats-card__note">{card.note(rawValue, safeStats)}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

export default ProjectStats;
