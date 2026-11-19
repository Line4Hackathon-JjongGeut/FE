import { APIService } from "./api.js";
import { deleteShelterBookmark, postShelterBookmark } from "./shelters.js";
import { deletePostingBookmark, postPostingBookmark } from "./postings.js";

/* 값이 없는 조건은 쿼리에서 빼서, 필요한 조건만 경로 뒤에 붙입니다. */
function toQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.append(key, String(value));
  });
  const search = query.toString();
  return search ? `?${search}` : "";
}

/*
  내 참여 이력 조회.
  완료, 취소, 반려, 불참 상태의 과거 신청을 활동 시작이 최근인 순으로 가져옵니다.
  status로 상태를 거를 수 있고, page와 size는 값이 있을 때만 붙입니다.
  응답 data.items에는 applicationId, status, postingId, postingTitle,
  shelterId, shelterName, activityStartAt, appliedAt가 들어 있습니다.
*/
export function getParticipationHistory(params = {}) {
  return APIService.public.get(`/users/me/participation-history${toQuery(params)}`);
}

/*
  내 관심 시설 목록 조회.
  저장한 보호시설을 최근 저장순으로 가져옵니다.
  시설마다 모집 중인 공고 수도 함께 옵니다.
  page와 size는 값이 있을 때만 붙입니다.
  응답 data.items에는 shelterId, name, region, openPostingCount, bookmarkedAt가 들어 있습니다.
*/
export function getBookmarkedShelters(params = {}) {
  return APIService.public.get(`/users/me/bookmarked-shelters${toQuery(params)}`);
}

/*
  내 관심 공고 목록 조회.
  저장한 모집공고를 모집 상태와 함께 최근 저장순으로 가져옵니다.
  status는 OPEN 또는 CLOSED이고, page와 size는 값이 있을 때만 붙입니다.
  응답 data.items에는 postingId, postingType, title, status, shelterId, shelterName,
  region, activityCategories, animalType, activityStartAt, capacity, applicantCount, bookmarkedAt가 들어 있습니다.
*/
export function getBookmarkedPostings(params = {}) {
  return APIService.public.get(`/users/me/bookmarked-postings${toQuery(params)}`);
}

/* 이미 저장됐거나 이미 빠진 경우는 성공으로 봅니다. */
async function runFavorite(request, saved) {
  try {
    await request;
  } catch (error) {
    if (saved && error?.status === 404) return;
    if (!saved && error?.status === 409) return;
    throw error;
  }
}

/*
  발바닥으로 보호시설 또는 공고를 저장하거나 해제합니다.
  시설은 보호시설 상세에서만, 공고는 그 공고 카드에서만 저장합니다.
*/
export function setSavedFavorite({ shelterId, postingIds = [], saved }) {
  const jobs = [];
  if (shelterId != null && shelterId !== "") {
    jobs.push(runFavorite(saved ? deleteShelterBookmark(shelterId) : postShelterBookmark(shelterId), saved));
  }
  postingIds.filter((id) => id != null && id !== "").forEach((postingId) => {
    jobs.push(runFavorite(saved ? deletePostingBookmark(postingId) : postPostingBookmark(postingId), saved));
  });
  return Promise.all(jobs);
}
