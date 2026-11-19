import { formatSchedule } from "./dateFormat.js";

/* 추천 API 응답 -> 추천 카드가 쓰는 값 */
export function formatDistance(km) {
  if (km === null || km === undefined) return null;
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

function toMatchLabel(tags) {
  const matched = tags
    .filter((tag) => tag.endsWith(" 일치"))
    .slice(0, 2)
    .map((tag) => tag.replace(/ 일치$/, ""));
  if (matched.length > 0) return `${matched.join(", ")} 일치`;
  return tags[0] ?? "";
}

function toRecommendCard(item, batchId) {
  const posting = item.posting ?? {};
  const tags = item.reasonTags ?? [];
  return {
    id: item.recommendationItemId,
    batchId,
    postId: posting.postingId,
    title: posting.title,
    shelter: posting.shelterName,
    region: posting.region?.sigungu ?? "",
    tags,
    matchLabel: toMatchLabel(tags),
    distance: formatDistance(posting.distanceKm),
    schedule: formatSchedule(posting.activityStartAt, posting.activityEndAt),
    thumbnailUrl: posting.thumbnailUrl ?? null,
  };
}

export function fromRecommendationResponse(data) {
  const batchId = data?.recommendationBatchId ?? null;
  const cards = (data?.items ?? []).map((item) =>
    toRecommendCard(item, batchId),
  );
  return { batchId, cards };
}
