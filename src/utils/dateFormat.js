/* 서버 시간 글자를 화면 날짜로 바꾸는 함수 모음 */

const SERVER_TIME_ZONE = "+09:00";

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

const pad = (number) => String(number).padStart(2, "0");

export function parseServerTime(text) {
  if (!text) return null;
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/i.test(text);
  const date = new Date(hasZone ? text : `${text}${SERVER_TIME_ZONE}`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDay(date) {
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}(${DAY_NAMES[date.getDay()]})`;
}

export function formatTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatSchedule(startText, endText) {
  const start = parseServerTime(startText);
  if (!start) return null;
  const startLabel = `${formatDay(start)} ${formatTime(start)}`;

  const end = parseServerTime(endText);
  if (!end) return startLabel;
  const isSameDay = formatDay(start) === formatDay(end);
  return `${startLabel} ~ ${isSameDay ? formatTime(end) : `${formatDay(end)} ${formatTime(end)}`}`;
}