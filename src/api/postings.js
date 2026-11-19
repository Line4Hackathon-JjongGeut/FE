import { APIService } from "./api.js";

/* 값이 없는 조건은 쿼리에서 빼서, 필요한 조건만 경로 뒤에 붙입니다. */
function toQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    const values = Array.isArray(value) ? value : [value];
    values.forEach((item) => {
      if (item === undefined || item === null || item === "") return;
      query.append(key, String(item));
    });
  });
  const search = query.toString();
  return search ? `?${search}` : "";
}

/*
  모집공고 검색.
  활동 유형, 위치, 거리, 일정, 경험, 동물, 긴급 여부로 모집 중인 공고를 찾고 정렬합니다.
  값이 있는 조건만 쿼리에 붙입니다.
*/
export function getPostings(params = {}) {
  return APIService.public.get(`/postings${toQuery(params)}`);
}

/*
  모집공고 상세 조회.
  유형별 상세 정보, 시설 정보, 모집 상태와 참여 조건을 가져옵니다.
  후원 공고의 필요 물품은 sponsor.neededItems에 있습니다.
  좌표를 보내면 거리도 함께 옵니다.
*/
export function getPostingDetail(postingId, params = {}) {
  return APIService.public.get(`/postings/${postingId}${toQuery(params)}`);
}

/*
  봉사 가능 일정 조회.
  봉사 공고에서 신청할 수 있는 일정과 잔여 정원을 가져옵니다.
*/
export function getPostingSchedules(postingId) {
  return APIService.public.get(`/postings/${postingId}/schedules`);
}

/*
  봉사 신청 질문 조회.
  봉사 신청서에 표시할 필수·선택 질문과 선택지를 가져옵니다.
*/
export function getPostingQuestions(postingId) {
  return APIService.public.get(`/postings/${postingId}/application-questions`);
}

/*
  임시보호 참여 의사 전달.
  앱 문의 방식의 임시보호 공고에 참여 의사를 시설에 전달합니다.
  message는 시설에 전할 말이고, contactPhone은 연락받을 번호입니다.
*/
export function postFosterInquiry(postingId, { message, contactPhone } = {}) {
  return APIService.public.post(`/postings/${postingId}/foster-inquiries`, {
    message,
    contactPhone,
  });
}

/*
  관심 공고 저장.
  공고를 내 관심 목록에 넣습니다. 이미 저장했다면 409입니다.
*/
export function postPostingBookmark(postingId) {
  return APIService.public.post(`/postings/${postingId}/bookmarks`);
}

/*
  관심 공고 해제.
  공고를 내 관심 목록에서 뺍니다. 저장하지 않은 공고면 404입니다.
*/
export function deletePostingBookmark(postingId) {
  return APIService.public.delete(`/postings/${postingId}/bookmarks`);
}
