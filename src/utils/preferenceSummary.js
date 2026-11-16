/* 온보딩에서 고른 값을 홈 "내 참여 조건"에 보여 줄 한 줄 문장으로 바꿈 */
const DAY_ORDER = ["월", "화", "수", "목", "금", "토", "일"];

const TIME_SLOT_LABELS = {
  morning: "오전",
  afternoon: "오후",
  evening: "저녁",
  allday: "종일",
};

const EXPERIENCE_LABELS = {
  none: "초보",
  few: "경험 1~3회",
  many: "경험 4회 이상",
};

export function formatPreferenceSummary(preferences) {
  const { region, days, timeSlots, activityTypes, experienceLevel } = preferences;
  // 온보딩 마지막 단계까지 끝내야 값이 다 차 있으므로, 마지막 값이 없으면 설정 전으로
  if (!region || !experienceLevel) return null;

  // "서울 성북구 정릉로 77" → "서울 성북구"
  const area = region.road.split(" ").slice(0, 2).join(" ");

  // 요일은 월~일 순서로 정렬하고, 하나면 "일요일", 여러 개면 "토·일"
  const sortedDays = [...days].sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
  const dayText = sortedDays.length === 1 ? `${sortedDays[0]}요일` : sortedDays.join("·");
  const timeText = timeSlots.map((id) => TIME_SLOT_LABELS[id]).join("·");

  // 활동이 여러 개면 "산책 봉사 외 2개"
  const activityText =
    activityTypes.length > 1 ? `${activityTypes[0]} 외 ${activityTypes.length - 1}개` : activityTypes[0];

  return [area, `${dayText} ${timeText}`.trim(), activityText, EXPERIENCE_LABELS[experienceLevel]]
    .filter(Boolean)
    .join(" · ");
}