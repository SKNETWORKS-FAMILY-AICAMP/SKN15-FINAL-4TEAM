import { motion } from "framer-motion";

const CARD_CONFIG = [
  {
    key: "total_projects",
    label: "총 프로젝트",
    icon: "fas fa-layer-group",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    note: "누적 생성 건수",
  },
  {
    key: "in_progress",
    label: "진행 중",
    icon: "fas fa-spinner",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    note: "현재 작업 중인 프로젝트",
  },
  {
    key: "completed",
    label: "완료",
    icon: "fas fa-check-circle",
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    note: "완료된 프로젝트",
  },
  {
    key: "recent_increase",
    label: "최근 30일 증가",
    icon: "fas fa-chart-line",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    note: "최근 한 달 증감",
  },
];

const formatValue = (value, key) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;

  if (key === "recent_increase") {
    if (safeValue === 0) return "0";
    const prefix = safeValue > 0 ? "+" : "";
    return `${prefix}${safeValue}`;
  }

  return safeValue;
};

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
          const rawValue = safeStats[card.key] ?? 0;

          return (
            <motion.div
              key={card.key}
              className="stats-card"
              style={{ background: card.gradient }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <div className="stats-card__icon" aria-hidden="true">
                <i className={card.icon} />
              </div>
              <div className="stats-card__meta">
                <span className="stats-card__label">{card.label}</span>
                <span className="stats-card__value">
                  {formatValue(rawValue, card.key)}
                </span>
                <span className="stats-card__note">{card.note}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

export default ProjectStats;
