const STORAGE_KEY = "fosterPeriods";

/* 임시보호 문의는 조회 API가 없어서, 신청 때 고른 기간을 이 기기에 남겨 캘린더와 활동 내역에 씁니다. */
export function listFosterPeriods() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFosterPeriod(entry) {
  if (!entry?.start || !entry?.end) return;
  const list = listFosterPeriods().filter((item) => String(item.id) !== String(entry.id));
  list.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/* 신청 칸에 저장된 2026.06.17~2027.01.21 형식을 날짜 키로 바꿉니다. */
export function parseFosterPeriod(period) {
  const match = String(period ?? "").match(
    /(\d{4})\.(\d{2})\.(\d{2})(?:~(\d{4})\.(\d{2})\.(\d{2}))?/,
  );
  if (!match) return null;
  const start = `${match[1]}-${match[2]}-${match[3]}`;
  const end = match[4] ? `${match[4]}-${match[5]}-${match[6]}` : start;
  return start <= end ? { start, end } : { start: end, end: start };
}

/* 활동 내역 시계 옆에 2026.11.12~2026.11.19 처럼 보여 줍니다. */
export function formatFosterPeriodLabel(start, end) {
  const dotted = (key) => String(key ?? "").replaceAll("-", ".");
  if (!start) return "";
  if (!end || start === end) return dotted(start);
  return `${dotted(start)}~${dotted(end)}`;
}
