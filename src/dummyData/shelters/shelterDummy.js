/* 보호시설 상세와 봉사 공고 상세에 쓰는 임시 데이터입니다. 나중에 API 응답으로 바꾸면 됩니다. */

export const SHELTER_DETAIL = {
  id: "yongsan",
  name: "아이조아 요양보호소 서울용산점",
  postedAgo: "5일 전",
  title: "유기견 주말 돌봄 봉사",
  date: "2026.11.04 (수)",
  time: "3시간 10:00 ~ 13:00",
  requirement: "만 18세 이상, 초보 가능",
  capacity: "5명 중 3명 신청 가능",
  activity:
    "보호 중인 유기견의 산책 보조, 놀이 활동, 사료 급여를 함께 합니다. 반려동물 경험 없어도 참여 가능합니다.",
  supplies: "편한 복장, 운동화, 개인 물병",
  caution:
    "향수, 진한 향기 제품 사용 자제/ 당일 취소 시 사전 연락 필수\n/ 보호소 내 사진 촬영 제한 구역 준수",
  applicants: "아직 지원자가 없어요",
  address: "서울 용산구 녹사평대로32길 28",
  station: "녹사평역",
  stationLine: "6",
  walk: "걸어서 3분",
};

/* 봉사 공고 상세의 세 탭이 공통으로 쓰는 내용입니다. */
const postTabs = {
  activity: {
    description:
      "보호소 아이들과 함께 산책하고,\n생활 공간을 청소하며 아이들이 더 쾌적하게 지낼 수 있도록 도와주는 봉사활동이에요.",
    items: ["아이들과 산책 및 놀이", "견사 및 보호 공간 청소"],
  },
  items: {
    description: "안전하고 편안하게 활동할 수 있도록\n준비해주세요.",
    items: ["오염되어도 괜찮은 편한 옷", "발을 덮는 운동화", "개인 물과 수건"],
  },
  notes: {
    description: "사람과 동물 모두 안전한 시간을\n보낼 수 있도록 꼭 확인 해 주세요.",
    items: [
      "동물에게 다가가기 전 담당자 안내 따르기",
      "간식은 담당자 확인 후 주기",
      "불참하거나 늦을 경우 미리 연락하기",
    ],
  },
};

export const VOLUNTEER_POSTS = [
  {
    id: 1,
    shelterId: SHELTER_DETAIL.id,
    title: "유기견 주말 돌봄 봉사",
    shelterName: "아이조아 보호소",
    schedule: "11/14(토) 10:00 - 13:00",
    level: "초보자 참여 가능",
    recruit: "모집 6명",
    remain: "잔여 4명",
    donationNote: "생필품, 사료 등 실물 후원이 가능한 공고에요.",
    tabs: postTabs,
  },
  {
    id: 2,
    shelterId: SHELTER_DETAIL.id,
    title: "보호소 산책 봉사",
    shelterName: "아이조아 보호소",
    schedule: "11/08(일) 14:00 - 16:00",
    level: "초보자 참여 가능",
    recruit: "모집 4명",
    remain: "잔여 2명",
    donationNote: "생필품, 사료 등 실물 후원이 가능한 공고에요.",
    tabs: postTabs,
  },
  {
    id: 3,
    shelterId: SHELTER_DETAIL.id,
    title: "착한 고양이입니다. 임시보호자 분을 찾습니다!",
    shelterName: "아이조아 보호소",
    schedule: "상시 모집",
    level: "초보자 참여 가능",
    recruit: "모집 1명",
    remain: "잔여 1명",
    donationNote: "생필품, 사료 등 실물 후원이 가능한 공고에요.",
    tabs: postTabs,
  },
  {
    id: 4,
    shelterId: SHELTER_DETAIL.id,
    title: "사료 후원이 필요한 보호소입니다",
    shelterName: "아이조아 보호소",
    schedule: "11/12(목) 10:00 - 18:00",
    level: "초보자 참여 가능",
    recruit: "모집 10명",
    remain: "잔여 7명",
    donationNote: "생필품, 사료 등 실물 후원이 가능한 공고에요.",
    tabs: postTabs,
  },
  {
    id: 5,
    shelterId: SHELTER_DETAIL.id,
    title: "착한 고양이입니다. 임시보호자 분을 찾습니다!",
    shelterName: "아이조아 보호소",
    schedule: "상시 모집",
    level: "초보자 참여 가능",
    recruit: "모집 1명",
    remain: "잔여 1명",
    donationNote: "생필품, 사료 등 실물 후원이 가능한 공고에요.",
    tabs: postTabs,
  },
  {
    id: 6,
    shelterId: SHELTER_DETAIL.id,
    title: "조용한 강아지의 임시보호자를 찾습니다",
    shelterName: "아이조아 보호소",
    schedule: "상시 모집",
    level: "초보자 참여 가능",
    recruit: "모집 1명",
    remain: "잔여 1명",
    donationNote: "생필품, 사료 등 실물 후원이 가능한 공고에요.",
    tabs: postTabs,
  },
];

/* 주소의 공고 번호로 상세를 찾고, 없으면 첫 공고를 보여 줍니다. */
export function findVolunteerPost(postId) {
  return VOLUNTEER_POSTS.find((post) => post.id === Number(postId)) ?? VOLUNTEER_POSTS[0];
}
