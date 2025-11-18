export const SPACE_OPTIONS = [
  { code: "spa_0001", name: "거실" },
  { code: "spa_0002", name: "다이닝룸" },
  { code: "spa_0003", name: "드레스룸" },
  { code: "spa_0004", name: "발코니" },
  { code: "spa_0005", name: "서재/멀티룸" },
  { code: "spa_0006", name: "아이방" },
  { code: "spa_0007", name: "욕실" },
  { code: "spa_0008", name: "전체" },
  { code: "spa_0009", name: "침실" },
  { code: "spa_0010", name: "키친" },
  { code: "spa_0011", name: "현관" },
  { code: "spa_9999", name: "기타" },
];

export const COST_OPTIONS = [
  { code: "cos_0001", name: "1억원 이상" },
  { code: "cos_0002", name: "1천만원 미만" },
  { code: "cos_0003", name: "1천만원대" },
  { code: "cos_0004", name: "2천만원대" },
  { code: "cos_0005", name: "3천만원대" },
  { code: "cos_0006", name: "4천만원대" },
  { code: "cos_0007", name: "5천만원대" },
  { code: "cos_0008", name: "6천만원대" },
  { code: "cos_0009", name: "7천만원 이상" },
];

export const STYLE_OPTIONS = [
  { code: "sty_0001", name: "내추럴" },
  { code: "sty_0002", name: "모던" },
  { code: "sty_0003", name: "빈티지&앤틱" },
  { code: "sty_0004", name: "심플&미니멀" },
  { code: "sty_0005", name: "클래식" },
  { code: "sty_0006", name: "한국&동양적" },
  { code: "sty_9999", name: "기타" },
];

export const formatOptionLabel = (option) => option.name;
