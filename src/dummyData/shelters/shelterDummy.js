import heroPhoto from "../../assets/icons/map/shelter-photo.png";

/* 보호시설 상세와 봉사 공고 상세에 쓰는 임시 데이터입니다. 나중에 API 응답으로 바꾸면 됩니다. */

export const SHELTER_DETAIL = {
  id: "yongsan",
  name: "아이조아 요양보호소 서울용산점",
  /*
    상단 가로로 긴 직사각형 사진들입니다.
    지금은 같은 사진을 잘라 여덟 장처럼 보여 주고, 나중에 API의 사진 목록으로 바꾸면 됩니다.
    position은 직사각형 안에서 어느 부분을 크게 보일지 정합니다.
  */
  photos: [
    { id: 1, src: heroPhoto, position: "center" },
    { id: 2, src: heroPhoto, position: "left center" },
    { id: 3, src: heroPhoto, position: "right center" },
    { id: 4, src: heroPhoto, position: "center top" },
    { id: 5, src: heroPhoto, position: "20% center" },
    { id: 6, src: heroPhoto, position: "80% center" },
    { id: 7, src: heroPhoto, position: "center bottom" },
    { id: 8, src: heroPhoto, position: "40% 30%" },
  ],
  /* 사진 아래 알약 배지 두 개. filled는 연두색으로 채운 알약, outline은 테두리만 있는 알약입니다. */
  badges: [
    { id: "certified", label: "쫑긋 인증 시설", tone: "filled" },
    { id: "type", label: "지자체 위탁 보호소", tone: "outline" },
  ],
  /* 시설 정보 칸의 왼쪽 회색 라벨과 오른쪽 본문 한 줄입니다. */
  info: [
    { label: "운영 시간", value: "평일, 주말 10:00-18:00 (월 휴무)" },
    { label: "위치", value: "서울 마포구 00로 00" },
    { label: "방문 안내", value: "봉사 신청 후 방문 가능" },
    { label: "연락처", value: "02-000-0000" },
  ],
  intro:
    "유기된 동물들이 안전하고 건강하게 지낼 수 있도록 보호하고, 새로운 가족을 만날 수 있도록 돕는 동물보호시설입니다.",
  /* 지도 API 전, 회색 둥근 사각형 안에 발바닥과 함께 보여줄 자리 표시 문구입니다. */
  mapLabel: "지도 사진",
  address: "서울 용산구 녹사평대로32길 28",
};

/* 봉사 공고 상세의 공통 내용입니다. 공고마다 다른 값은 각 공고에서 덮어씁니다. */
const VOLUNTEER_DETAIL = {
  category: "봉사",
  postedAt: "2026-11-09 14:08",
  time: "10:00~13:00 (3시간)",
  date: "2026.11.04 (수)",
  activity:
    "보호 중인 유기견의 산책 보조, 놀이 활동, 사료 급여를 함께 합니다. 반려동물 경험 없어도 참여 가능합니다.",
  supplies: "편한 복장, 운동화, 개인 물병",
  cautions: ["향수, 진한 향기 제품 사용 자제", "당일 취소 시 사전 연락 필수", "보호소 내 사진 촬영 제한 구역 준수"],
  mapLabel: "지도 사진",
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
    /* 보호시설 상세의 둥근 모서리 카드에 이 공고를 올립니다. */
    showOnShelter: true,
    title: "견사 청소 봉사",
    shelterName: "아이조아 보호소",
    schedule: "11/8(일) 10:00 - 13:00",
    cardSchedule: "11월 8일 (일) 10:00-13:00",
    status: "신청 가능",
    level: "초보자 참여 가능",
    recruit: "모집 6명",
    remain: "잔여 4명",
    donationNote: "생필품, 사료 등 실물 후원이 가능한 공고에요.",
    tabs: postTabs,
  },
  {
    id: 2,
    shelterId: SHELTER_DETAIL.id,
    showOnShelter: true,
    title: "강아지 사료 후원",
    shelterName: "아이조아 보호소",
    schedule: "상시 모집",
    cardSchedule: "상시 모집",
    status: "신청 가능",
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
  const post = VOLUNTEER_POSTS.find((item) => item.id === Number(postId)) ?? VOLUNTEER_POSTS[0];
  return {
    ...VOLUNTEER_DETAIL,
    ...post,
    shelterName: SHELTER_DETAIL.name,
    address: SHELTER_DETAIL.address,
    photos: SHELTER_DETAIL.photos,
  };
}

/* 보호시설 상세의 '현재 모집 중' 카드에 올릴 공고만 골라 줍니다. */
export function findShelterRecruitingPosts(shelterId) {
  return VOLUNTEER_POSTS.filter((post) => post.shelterId === shelterId && post.showOnShelter);
}
