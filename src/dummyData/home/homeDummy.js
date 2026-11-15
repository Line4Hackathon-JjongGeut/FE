/* 홈 화면에 쓰는 임시 데이터. 나중에 추천 API 응답으로. */

export const RECOMMENDED_POSTS = [
  {
    id: 1,
    postId: 1,
    matchLabel: "일정, 관심 활동 일치",
    title: "유기견 산책 봉사",
    shelter: "행복한동물보호소",
    region: "마포구",
    schedule: "11/08(일) 10:00 ~ 13:00",
  },
  {
    id: 2,
    postId: 2,
    matchLabel: "일정, 관심 활동 일치",
    title: "보호소 산책 봉사",
    shelter: "아이조아 보호소",
    region: "용산구",
    schedule: "11/08(일) 14:00 ~ 17:00",
  },
  {
    id: 3,
    postId: 1,
    matchLabel: "관심 활동 일치",
    title: "유기견 주말 돌봄 봉사",
    shelter: "아이조아 보호소",
    region: "용산구",
    schedule: "11/14(토) 10:00 ~ 13:00",
  },
  {
    id: 4,
    postId: 2,
    matchLabel: "일정 일치",
    title: "견사 청소 봉사",
    shelter: "행복한동물보호소",
    region: "마포구",
    schedule: "11/15(일) 13:00 ~ 16:00",
  },
  {
    id: 5,
    postId: 1,
    matchLabel: "가까운 거리",
    title: "고양이 급식 봉사",
    shelter: "망원 고양이 쉼터",
    region: "마포구",
    schedule: "11/15(일) 15:00 ~ 17:00",
  },
  {
    id: 6,
    postId: 2,
    matchLabel: "일정, 관심 활동 일치",
    title: "유기견 목욕 봉사",
    shelter: "행복한동물보호소",
    region: "마포구",
    schedule: "11/22(일) 10:00 ~ 12:00",
  },
];


/* 도움이 급한 활동 목록. 홈과 긴급 모집 화면에서 같이 사용 */
export const URGENT_POSTS = [
  {
    id: 1,
    type: "staff",
    shelterId: "yongsan",
    shelter: "행복한동물보호소",
    region: "마포구",
    title: "견사 청소 봉사",
    current: 0,
    total: 6,
    needs: "보호소 청소/ 견사 정리",
  },
  {
    id: 2,
    type: "staff",
    shelterId: "yongsan",
    shelter: "아이조아 보호소",
    region: "용산구",
    title: "유기견 산책 봉사",
    current: 1,
    total: 6,
    needs: "소형견 산책",
  },
  {
    id: 3,
    type: "goods",
    shelterId: "yongsan",
    shelter: "행복한동물보호소",
    region: "마포구",
    title: "사료 후원",
    percent: 20,
    needs: "사료/ 배변 패드",
  },
];

export const URGENT_LABELS = {
  staff: "인력 부족",
  goods: "물품 부족",
};