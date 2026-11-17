import heroPhoto from "../../../assets/images/donations/hero.png";

/* 후원 공고 상세에 쓰는 임시 데이터입니다. 나중에 API 응답으로 바꾸면 됩니다. */

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

export const DONATION_POSTS = [
  {
    id: 3,
    shelterId: "yongsan",
    category: "후원",
    postedAt: "2026-11-09 14:08",
    title: "겨울나기 난방용품 후원 모집",
    shelterName: "아이조아 요양보호소 서울용산점",
    /* 후원 정보 칸의 왼쪽 회색 라벨과 오른쪽 본문입니다. */
    info: [
      { label: "모집 기간", value: "2026.11.04 (수) ~ 2026.11.20 (금)" },
      { label: "후원 목적", value: "보호소 동물들의 겨울철 보온을 위한 난방용품 지원" },
      { label: "필요 물품", value: "전기담요, 소형 히터, 방한매트 등" },
    ],
    detail:
      "기온이 낮아지면서 보호소 아이들이 추위를 많이 타고 있어요. 안전하고 따뜻한 겨울을 보낼 수 있도록 난방용품 후원을 진행합니다! 작은 도움도 아이들에게 큰 힘이 됩니다. 🐾",
    note: "생필품, 사료 등 실물 후원이 가능한 공고에요.",
    mapLabel: "지도 사진",
    address: "서울 용산구 녹사평대로32길 28",
    photos,
  },
  {
    id: 4,
    shelterId: "yongsan",
    category: "후원",
    postedAt: "2026-11-09 14:08",
    title: "사료 후원이 필요한 보호소입니다",
    shelterName: "아이조아 요양보호소 서울용산점",
    info: [
      { label: "모집 기간", value: "2026.11.04 (수) ~ 2026.11.20 (금)" },
      { label: "후원 목적", value: "보호 중인 아이들의 식사 지원" },
      { label: "필요 물품", value: "강아지 사료, 고양이 사료, 간식" },
    ],
    detail:
      "기온이 낮아지면서 보호소 아이들이 추위를 많이 타고 있어요. 안전하고 따뜻한 겨울을 보낼 수 있도록 난방용품 후원을 진행합니다! 작은 도움도 아이들에게 큰 힘이 됩니다. 🐾",
    note: "생필품, 사료 등 실물 후원이 가능한 공고에요.",
    mapLabel: "지도 사진",
    address: "서울 용산구 녹사평대로32길 28",
    photos,
  },
];

/* 주소의 공고 번호로 상세를 찾고, 없으면 첫 후원 공고를 보여 줍니다. */
export function findDonationPost(postId) {
  return DONATION_POSTS.find((post) => post.id === Number(postId)) ?? DONATION_POSTS[0];
}
