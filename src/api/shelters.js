import { APIService } from "./api.js";

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

/* 관심 시설 저장. 시설을 내 관심 목록에 넣습니다. 이미 저장했다면 409입니다. */
export function postShelterBookmark(shelterId) {
  return APIService.public.post(`/shelters/${shelterId}/bookmarks`);
}

/* 관심 시설 해제. 시설을 내 관심 목록에서 제거합니다. 저장하지 않은 시설이면 404입니다. */
export function deleteShelterBookmark(shelterId) {
  return APIService.public.delete(`/shelters/${shelterId}/bookmarks`);
}

/*
  보호시설 목록 조회.
  지역, 거리, 인증 상태, 보호 동물 유형으로 시설을 찾습니다.
  좌표를 보내면 가까운 순이고, 좌표가 없으면 이름순입니다.
*/
export function getShelters(params = {}) {
  return APIService.public.get(`/shelters${toQuery(params)}`);
}

/*
  보호시설 상세 조회.
  시설 정보, 인증 상태, 연락처, 운영 시간, 방문 안내, 모집 중 공고를 가져옵니다.
  좌표를 보내면 거리도 함께 옵니다.
*/
export function getShelterDetail(shelterId, params = {}) {
  return APIService.public.get(`/shelters/${shelterId}${toQuery(params)}`);
}

/*
  시설 모집공고 목록 조회.
  그 시설에서 모집 중인 봉사, 후원, 임시보호 공고를 활동 시작일이 빠른 순으로 가져옵니다.
  postingType, page, size는 값이 있을 때만 붙입니다.
*/
export function getShelterPostings(shelterId, params = {}) {
  return APIService.public.get(`/shelters/${shelterId}/postings${toQuery(params)}`);
}

/* 보호동물 현황 조회. 그 시설의 강아지, 고양이, 기타 동물 수를 가져옵니다. */
export function getShelterAnimalStats(shelterId) {
  return APIService.public.get(`/shelters/${shelterId}/animal-stats`);
}
