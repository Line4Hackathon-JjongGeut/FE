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

/*
  봉사 신청.
  선택한 일정의 정원과 중복 신청을 확인한 뒤, 신청을 승인 대기 상태로 접수합니다.
  필수 질문이 있으면 answers로 답하고, experienceId를 주면 그 시점의 경험 내용을 함께 저장합니다.
*/
export function postVolunteerApplication(scheduleId, { answers, message, experienceId } = {}) {
  const body = {};
  if (answers?.length) body.answers = answers;
  if (message !== undefined) body.message = message;
  if (experienceId !== undefined && experienceId !== null && experienceId !== "") {
    body.experienceId = experienceId;
  }
  return APIService.public.post(`/schedules/${scheduleId}/applications`, body);
}

/*
  내 봉사 신청 목록 조회.
  상태별로 내 신청을 최근 신청순으로 가져옵니다.
  status에는 상태 하나, 또는 진행 중(ONGOING), 지난 신청(HISTORY) 묶음을 넣을 수 있습니다.
  page와 size는 값이 있을 때만 붙입니다.
*/
export function getMyApplications(params = {}) {
  return APIService.public.get(`/users/me/applications${toQuery(params)}`);
}

/*
  봉사 신청 상세 조회.
  내 신청 정보, 상태, 일정, 준비물, 첨부한 경험과 변경 이력을 가져옵니다.
*/
export function getApplicationDetail(applicationId) {
  return APIService.public.get(`/applications/${applicationId}`);
}

/*
  봉사 신청 취소.
  진행 중인 내 신청을 일정 시작 24시간 전까지 취소하고 상태 이력에 남깁니다.
  reason은 취소 사유이며, 없으면 보내지 않습니다.
*/
export function deleteVolunteerApplication(applicationId, reason) {
  const body = reason ? { reason } : undefined;
  return APIService.public.delete(`/applications/${applicationId}`, body);
}

/*
  신청 상태 이력 조회.
  접수부터 승인, 반려, 취소, 완료, 불참까지의 상태 변경을 오래된 순으로 가져옵니다.
*/
export function getApplicationStatusHistory(applicationId) {
  return APIService.public.get(`/applications/${applicationId}/status-history`);
}
