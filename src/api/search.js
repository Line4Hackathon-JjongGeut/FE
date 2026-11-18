import { APIService } from "./api.js";
import { toProfileRequest } from "../utils/profileMapper.js";

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
  내 활동 캘린더 조회.
  확정된 참여 일정과 완료된 활동을 월 단위로 가져옵니다.
  month는 YYYY-MM입니다. 비우면 서버가 이번 달을 돌려줍니다.
  응답 data.items에는 applicationId, status, postingId, postingTitle,
  shelterId, shelterName, activityStartAt가 들어 있습니다.
*/
export function getActivityCalendar(month) {
  return APIService.public.get(`/users/me/activity-calendar${toQuery({ month })}`);
}

/*
  저장 검색 조건 목록 조회.
  사용자가 저장한 활동 검색 조건을 가져옵니다.
  기본 조건이 맨 앞이고, 나머지는 최근 저장한 순서입니다.
  응답 data.savedSearches에는 savedSearchId, name, region, maxDistanceKm,
  availableDays, availableTimeSlots, activityCategories, isDefault, createdAt, updatedAt가 들어 있습니다.
*/
export function getSavedSearches() {
  return APIService.public.get("/users/me/saved-searches");
}

/*
  검색 조건 저장.
  지역, 거리, 요일, 시간, 활동 유형을 이름으로 저장합니다.
  최대 10개이고, isDefault가 true면 기존 기본 조건은 기본에서 빠집니다.
  region에는 sido, sigungu가 필요하고, maxDistanceKm는 1부터 200까지입니다.
*/
export function postSavedSearch({
  name,
  region,
  maxDistanceKm,
  availableDays,
  availableTimeSlots,
  activityCategories,
  isDefault,
} = {}) {
  const body = { name };
  if (region?.sido && region?.sigungu) body.region = region;
  if (maxDistanceKm) body.maxDistanceKm = maxDistanceKm;
  if (availableDays?.length) body.availableDays = availableDays;
  if (availableTimeSlots?.length) body.availableTimeSlots = availableTimeSlots;
  if (activityCategories?.length) body.activityCategories = activityCategories;
  if (typeof isDefault === "boolean") body.isDefault = isDefault;
  return APIService.public.post("/users/me/saved-searches", body);
}

/* 추천 조건 화면의 값을 검색 조건 저장 본문으로 바꿉니다. 기본 조건으로 저장합니다. */
export function toSavedSearch(preferences) {
  const profile = toProfileRequest(preferences);
  const area = preferences.region?.area
    ?? preferences.region?.road?.split(" ").slice(0, 2).join(" ")
    ?? "기본 조건";
  return {
    name: String(area).slice(0, 20) || "기본 조건",
    region: profile.region,
    availableDays: profile.availableDays,
    availableTimeSlots: profile.availableTimeSlots,
    activityCategories: profile.interestCategories,
    isDefault: true,
  };
}
