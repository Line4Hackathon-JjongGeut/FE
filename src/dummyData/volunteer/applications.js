/* 참여내역에 쌓이는 봉사 신청입니다. 화면을 이동해도 이번 방문 동안 유지됩니다. */

const STATUS_COPY = {
  "승인 대기": {
    headline: "보호시설에서 신청을 검토하고있어요.",
    description: "승인되면 참여 일정이 확정돼요.",
  },
  "참여 예정": {
    headline: "참여 일정이 확정됐어요.",
    description: "일정에 맞춰 보호시설에 방문해 주세요.",
  },
  "참여 완료": {
    headline: "참여가 완료됐어요.",
    description: "함께해 주셔서 고마워요.",
  },
};

let applications = [
  {
    id: "seed-wait",
    status: "승인 대기",
    title: "유기견 주말 돌봄 봉사",
    shelter: "아이조아 요양보호소 서울용산본점",
    schedule: "11/08(일) 10:00 ~ 13:00",
    place: "서울 용산구 보호시설",
    appliedAt: "2026. 11. 06",
    applicant: "이현승",
    supplies: "편한 복장과 운동화를 착용해 주세요.\n활동 전 보호시설의 안내를 확인해 주세요.",
  },
  {
    id: "seed-planned",
    status: "참여 예정",
    title: "유기견 주말 돌봄 봉사",
    shelter: "아이조아 요양보호소 서울용산본점",
    schedule: "11/08(일) 10:00 ~ 13:00",
    place: "서울 용산구 보호시설",
    appliedAt: "2026. 11. 02",
    applicant: "이현승",
    supplies: "편한 복장과 운동화를 착용해 주세요.\n활동 전 보호시설의 안내를 확인해 주세요.",
  },
  {
    id: "seed-done",
    status: "참여 완료",
    title: "유기견 주말 돌봄 봉사",
    shelter: "아이조아 요양보호소 서울용산본점",
    schedule: "11/08(일) 10:00 ~ 13:00",
    place: "서울 용산구 보호시설",
    appliedAt: "2026. 10. 20",
    applicant: "이현승",
    supplies: "편한 복장과 운동화를 착용해 주세요.\n활동 전 보호시설의 안내를 확인해 주세요.",
  },
];

export function getStatusCopy(status) {
  return STATUS_COPY[status];
}

export function getApplications() {
  return applications;
}

export function findApplication(id) {
  return applications.find((item) => item.id === id);
}

/* 접수 신청을 마치면 참여내역 맨 앞에 승인 대기로 추가됩니다. */
export function addApplication(data) {
  const item = {
    id: `app-${Date.now()}`,
    status: "승인 대기",
    appliedAt: "2026. 11. 09",
    supplies: "편한 복장과 운동화를 착용해 주세요.\n활동 전 보호시설의 안내를 확인해 주세요.",
    ...data,
  };
  applications = [item, ...applications];
  return item;
}

export function removeApplication(id) {
  applications = applications.filter((item) => item.id !== id);
}
