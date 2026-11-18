import { formatDistance } from "./recommendationMapper.js";

const TYPE_FROM_API = { VOLUNTEER: "staff", SPONSOR: "goods" };

/* 카드 종류별 상세 화면 주소 */
const DETAIL_PATH = {
  staff: (postingId) => `/shelters/volunteer/${postingId}`,
  goods: (postingId) => `/donations/${postingId}`,
};

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

function parseServerTime(text) {
  if (!text) return null;
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/i.test(text);
  const date = new Date(hasZone ? text : `${text}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

const pad = (number) => String(number).padStart(2, "0");

function formatDay(date) {
  return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}(${DAY_NAMES[date.getDay()]})`;
}

function formatTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toUrgentPost(item) {
  const type = TYPE_FROM_API[item.postingType];
  if (!type) return null;

  const base = {
    id: item.postingId,
    type,
    title: item.title,
    shelterId: item.shelter?.shelterId,
    shelter: item.shelter?.name ?? "",
    region: item.shelter?.region?.sigungu ?? "",
    distance: formatDistance(item.distanceKm),
    detailPath: DETAIL_PATH[type](item.postingId),
  };

  if (type === "staff") {
    const start = parseServerTime(item.activityStartAt);
    return {
      ...base,
      current: item.applicantCount ?? 0,
      total: item.capacity ?? 0,
      schedule: start ? `${formatDay(start)} ${formatTime(start)}` : null,
    };
  }

  const end = parseServerTime(item.recruitEndAt);
  return {
    ...base,
    percent: item.donationProgressRate ?? 0,
    schedule: end ? `${formatDay(end)}까지` : null,
  };
}

/* GET /postings 응답의 data → 카드 목록 */
export function fromUrgentResponse(data) {
  return (data?.items ?? []).map(toUrgentPost).filter(Boolean);
}