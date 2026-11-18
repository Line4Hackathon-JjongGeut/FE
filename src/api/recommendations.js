import { APIService } from "./api.js";

/* 내 추천 활동 */
export function getRecommendations(limit) {
  return APIService.public.get(`/recommendations?limit=${limit}`);
}

/* 추천 카드가 화면에 보였다고 기록 */
export function recordRecommendationImpressions(batchId, itemIds) {
  return APIService.public.post(`/recommendations/${batchId}/impressions`, { itemIds });
}

/* 추천 카드를 눌렀다고 기록 */
export function recordRecommendationClick(batchId, itemId) {
  return APIService.public.post(`/recommendations/${batchId}/items/${itemId}/clicks`);
}