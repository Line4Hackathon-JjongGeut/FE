import heroPhoto from "../../../assets/images/fosters/hero.png";

/* 임시보호 공고 상세에 쓰는 임시 데이터입니다. 나중에 API 응답으로 바꾸면 됩니다. */

/* 같은 사진을 잘라 여덟 장처럼 보여 줍니다. position은 직사각형 안에서 어느 부분을 크게 보일지 정합니다. */
const POSITIONS = [
  "center",
  "left center",
  "right center",
  "center top",
  "20% center",
  "80% center",
  "center bottom",
  "40% 30%",
];

const photos = POSITIONS.map((position, index) => ({
  id: index + 1,
  src: heroPhoto,
  position,
}));

export const FOSTER_POSTS = [
  {
    id: 5,
    shelterId: "yongsan",
    category: "임시보호",
    postedAt: "2026-11-09 14:08",
    title: "임시보호 가정 모집 (고양이 모모)",
    shelterName: "아이조아 요양보호소 서울용산점",
    animal: [
      { label: "이름", value: "모모" },
      { label: "상세 정보", value: "암컷, 약 4개월" },
    ],
    care: [
      { label: "보호 기간", value: "최소 2주~최대 3개월" },
      { label: "보호 장소", value: "가정 내 임시보호 (실내 생활 필수)" },
      {
        label: "신청 조건",
        value: "반려동물 돌봄 경험이 있거나 책임 있는 보호가 가능하신 분들만 지원 부탁드립니다!",
      },
    ],
    detail:
      "모모는 사람을 잘 따르고 호기심이 많은 고양이예요. 입양 전까지 안전하고 따뜻한 가정에서 지낼 임시보호 가정을 찾고 있습니다! 모모에게 소중한 시간을 선물해 주세요!!",
    photos,
  },
  {
    id: 6,
    shelterId: "yongsan",
    category: "임시보호",
    postedAt: "2026-11-09 14:08",
    title: "조용한 강아지의 임시보호자를 찾습니다",
    shelterName: "아이조아 요양보호소 서울용산점",
    animal: [
      { label: "이름", value: "콩이" },
      { label: "상세 정보", value: "암컷, 1살" },
    ],
    care: [
      { label: "보호 기간", value: "최소 2주~최대 3개월" },
      { label: "보호 장소", value: "가정 내 임시보호 (실내 생활 필수)" },
      {
        label: "신청 조건",
        value: "반려동물 돌봄 경험이 있거나 책임 있는 보호가 가능하신 분들만 지원 부탁드립니다!",
      },
    ],
    detail:
      "사람을 경계하지 않고 조용히 곁에 있는 강아지예요. 입양 전까지 안전하고 따뜻한 가정에서 지낼 임시보호 가정을 찾고 있습니다.",
    photos,
  },
];

/* 주소의 공고 번호로 상세를 찾고, 없으면 첫 임시보호 공고를 보여 줍니다. */
export function findFosterPost(postId) {
  return FOSTER_POSTS.find((post) => post.id === Number(postId)) ?? FOSTER_POSTS[0];
}
