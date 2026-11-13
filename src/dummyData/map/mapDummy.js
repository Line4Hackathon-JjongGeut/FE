/* 지도 필터와 바텀시트에 쓸 임시 목록입니다. 나중에 API 응답으로 바꾸면 됩니다. */
export const FILTERS = ["전체", "봉사", "후원", "임시보호", "즐겨찾기"];

/* 필터를 눌렀을 때 칩에 채워지는 색입니다. */
export const FILTER_COLORS = {
  봉사: "#3e7556",
  후원: "#c47b3b",
  임시보호: "#f2a60c",
  즐겨찾기: "#c4513b",
};

const shelter = "아이조아 요양보호소 서울용산점";

export const PLACES = [
  {
    id: 1,
    category: "봉사",
    shelter,
    shelterId: "yongsan",
    title: "유기견 주말 돌봄 봉사",
    address: "서울 마포구 00로 00",
    time: "2026.11.04 (수) 10:00 ~ 13:00",
    photos: [{ image: true }, { label: "시설 사진" }, { label: "시설 사진" }],
  },
  {
    id: 2,
    category: "봉사",
    shelter,
    shelterId: "yongsan",
    title: "보호소 산책 봉사",
    address: "서울 마포구 00로 12",
    time: "2026.11.08 (일) 14:00 ~ 16:00",
    photos: [{ image: true }, { label: "시설 사진" }, { label: "시설 사진" }],
  },
  {
    id: 3,
    category: "후원",
    shelter,
    shelterId: "yongsan",
    title: "착한 고양이입니다. 임시보호자 분을 찾습니다!",
    info: "3개월 · 수컷 · 중성화 예정",
    photos: [{ image: true }, { label: "동물 사진" }, { label: "시설 사진" }],
  },
  {
    id: 4,
    category: "후원",
    shelter,
    shelterId: "yongsan",
    title: "사료 후원이 필요한 보호소입니다",
    info: "5개월 · 암컷 · 중성화 완료",
    photos: [{ image: true }, { label: "동물 사진" }, { label: "시설 사진" }],
  },
  {
    id: 5,
    category: "임시보호",
    shelter,
    shelterId: "yongsan",
    title: "착한 고양이입니다. 임시보호자 분을 찾습니다!",
    info: "3개월 · 수컷 · 중성화 예정",
    photos: [{ image: true }, { label: "동물 사진" }, { label: "시설 사진" }],
  },
  {
    id: 6,
    category: "임시보호",
    shelter,
    shelterId: "yongsan",
    title: "조용한 강아지의 임시보호자를 찾습니다",
    info: "1살 · 암컷 · 중성화 완료",
    photos: [{ image: true }, { label: "동물 사진" }, { label: "시설 사진" }],
  },
];
