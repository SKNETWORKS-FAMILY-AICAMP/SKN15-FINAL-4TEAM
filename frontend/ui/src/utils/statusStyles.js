const STATUS_THEMES = {
  progress: {
    label: "진행 중",
    gradient: "linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%)",
    textColor: "#fff",
    shadow: "0 10px 25px rgba(255, 107, 53, 0.35)",
  },
  completed: {
    label: "완료",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#fff",
    shadow: "0 10px 25px rgba(102, 126, 234, 0.35)",
  },
  pending: {
    label: "대기",
    gradient: "linear-gradient(135deg, #9ca3af 0%, #cfd4dc 100%)",
    textColor: "#111827",
    shadow: "0 10px 25px rgba(156, 163, 175, 0.35)",
  },
};

export const normalizeStatus = (rawStatus) => {
  if (!rawStatus) return "pending";
  const value = rawStatus.toString().trim().toLowerCase();
  if (value === "진행중" || value === "진행 중" || value === "progress") return "progress";
  if (value === "완료" || value === "completed") return "completed";
  if (value === "대기" || value === "대기중" || value === "pending") return "pending";
  return value;
};

export const getStatusInfo = (status) => {
  const key = normalizeStatus(status);
  return {
    key,
    ...(STATUS_THEMES[key] || {
      label: status || "대기",
      gradient: "linear-gradient(135deg, #9ca3af 0%, #cfd4dc 100%)",
      textColor: "#111827",
      shadow: "0 10px 25px rgba(156, 163, 175, 0.35)",
    }),
  };
};

export const getStatusLabel = (status) => getStatusInfo(status).label;

export const STATUS_OPTIONS = [
  { value: "progress", label: "진행 중" },
  { value: "completed", label: "완료" },
  { value: "pending", label: "대기" },
];
