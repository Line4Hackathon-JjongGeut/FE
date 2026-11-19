import { formatDistance } from "./recommendationMapper.js";
import { parseServerTime, formatDay, formatSchedule } from "./dateFormat.js";

const TYPE_FROM_API = { VOLUNTEER: "staff", SPONSOR: "goods" };

/* 카드 종류별 상세 화면 주소 */
const DETAIL_PATH = {
  staff: (postingId) => `/shelters/volunteer/${postingId}`,
  goods: (postingId) => `/donations/${postingId}`,
};

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
    return {
      ...base,
      current: item.applicantCount ?? 0,
      total: item.capacity ?? 0,
      schedule: formatSchedule(item.activityStartAt, item.activityEndAt),
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