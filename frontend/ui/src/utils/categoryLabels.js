import { SPACE_OPTIONS, COST_OPTIONS, STYLE_OPTIONS } from "./categoryOptions";

const buildLabelMap = (options) => {
  const map = {};
  options.forEach(({ code, name }) => {
    if (code) {
      map[code.toString().trim().toLowerCase()] = name;
    }
    if (name) {
      map[name.toString().trim().toLowerCase()] = name;
    }
  });
  return map;
};

const SPACE_LABEL_MAP = buildLabelMap(SPACE_OPTIONS);
const BUDGET_LABEL_MAP = buildLabelMap(COST_OPTIONS);
const STYLE_LABEL_MAP = buildLabelMap(STYLE_OPTIONS);

const formatLabel = (value, map) => {
  if (!value) return "";
  const key = value.toString().trim().toLowerCase();
  return map[key] || value;
};

export const formatSpaceLabel = (value) => formatLabel(value, SPACE_LABEL_MAP);

export const formatBudgetLabel = (value) => formatLabel(value, BUDGET_LABEL_MAP);

export const formatStyleLabel = (value) => formatLabel(value, STYLE_LABEL_MAP);

export const formatCategoryLabel = (type, value) => {
  switch (type) {
    case "space":
      return formatSpaceLabel(value);
    case "budget":
      return formatBudgetLabel(value);
    case "style":
      return formatStyleLabel(value);
    default:
      return value;
  }
};
