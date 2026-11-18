/* 전국 시·도 / 시·군·구 목록 (2026년 기준)
   활동 지역은 서버에 시·도(sido) + 시·군·구(sigungu)로 저장되기 때문에, 검색도 이 단위로 함
   - name: 서버에 보내는 시·도 이름 (카카오 주소 결과와 같은 짧은 이름)
   - fullName: 화면에 보여 주는 이름
   - aliases: 예전 이름 등 검색에만 쓰는 이름 */
const SIDO_LIST = [
  {
    name: "서울",
    fullName: "서울특별시",
    sigungu: [
      "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구",
      "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구",
      "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구",
    ],
  },
  {
    name: "부산",
    fullName: "부산광역시",
    sigungu: [
      "강서구", "금정구", "기장군", "남구", "동구", "동래구", "부산진구", "북구", "사상구",
      "사하구", "서구", "수영구", "연제구", "영도구", "중구", "해운대구",
    ],
  },
  {
    name: "대구",
    fullName: "대구광역시",
    sigungu: ["군위군", "남구", "달서구", "달성군", "동구", "북구", "서구", "수성구", "중구"],
  },
  {
    name: "인천",
    fullName: "인천광역시",
    sigungu: [
      "강화군", "검단구", "계양구", "남동구", "미추홀구", "부평구", "서구", "연수구", "영종구",
      "옹진군", "제물포구",
    ],
  },
  { name: "광주", fullName: "광주광역시", sigungu: ["광산구", "남구", "동구", "북구", "서구"] },
  { name: "대전", fullName: "대전광역시", sigungu: ["대덕구", "동구", "서구", "유성구", "중구"] },
  { name: "울산", fullName: "울산광역시", sigungu: ["남구", "동구", "북구", "울주군", "중구"] },
  { name: "세종특별자치시", fullName: "세종특별자치시", sigungu: ["세종시"] },
  {
    name: "경기",
    fullName: "경기도",
    sigungu: [
      "가평군", "고양시", "과천시", "광명시", "광주시", "구리시", "군포시", "김포시", "남양주시",
      "동두천시", "부천시", "성남시", "수원시", "시흥시", "안산시", "안성시", "안양시", "양주시",
      "양평군", "여주시", "연천군", "오산시", "용인시", "의왕시", "의정부시", "이천시", "파주시",
      "평택시", "포천시", "하남시", "화성시",
    ],
  },
  {
    name: "강원특별자치도",
    fullName: "강원특별자치도",
    aliases: ["강원도", "강원"],
    sigungu: [
      "강릉시", "고성군", "동해시", "삼척시", "속초시", "양구군", "양양군", "영월군", "원주시",
      "인제군", "정선군", "철원군", "춘천시", "태백시", "평창군", "홍천군", "화천군", "횡성군",
    ],
  },
  {
    name: "충북",
    fullName: "충청북도",
    sigungu: [
      "괴산군", "단양군", "보은군", "영동군", "옥천군", "음성군", "제천시", "증평군", "진천군",
      "청주시", "충주시",
    ],
  },
  {
    name: "충남",
    fullName: "충청남도",
    sigungu: [
      "계룡시", "공주시", "금산군", "논산시", "당진시", "보령시", "부여군", "서산시", "서천군",
      "아산시", "예산군", "천안시", "청양군", "태안군", "홍성군",
    ],
  },
  {
    name: "전북특별자치도",
    fullName: "전북특별자치도",
    aliases: ["전라북도", "전북"],
    sigungu: [
      "고창군", "군산시", "김제시", "남원시", "무주군", "부안군", "순창군", "완주군", "익산시",
      "임실군", "장수군", "전주시", "정읍시", "진안군",
    ],
  },
  {
    name: "전남",
    fullName: "전라남도",
    sigungu: [
      "강진군", "고흥군", "곡성군", "광양시", "구례군", "나주시", "담양군", "목포시", "무안군",
      "보성군", "순천시", "신안군", "여수시", "영광군", "영암군", "완도군", "장성군", "장흥군",
      "진도군", "함평군", "해남군", "화순군",
    ],
  },
  {
    name: "경북",
    fullName: "경상북도",
    sigungu: [
      "경산시", "경주시", "고령군", "구미시", "김천시", "문경시", "봉화군", "상주시", "성주군",
      "안동시", "영덕군", "영양군", "영주시", "영천시", "예천군", "울릉군", "울진군", "의성군",
      "청도군", "청송군", "칠곡군", "포항시",
    ],
  },
  {
    name: "경남",
    fullName: "경상남도",
    sigungu: [
      "거제시", "거창군", "고성군", "김해시", "남해군", "밀양시", "사천시", "산청군", "양산시",
      "의령군", "진주시", "창녕군", "창원시", "통영시", "하동군", "함안군", "함양군", "합천군",
    ],
  },
  {
    name: "제주특별자치도",
    fullName: "제주특별자치도",
    aliases: ["제주도", "제주"],
    sigungu: ["서귀포시", "제주시"],
  },
];

/* 시·군·구 하나 = 화면에서 고를 수 있는 지역 하나
   road/jibun은 주소 목록·지도 화면이 쓰는 글자 칸 */
function makeRegion(sido, sigungu) {
  return {
    id: `${sido.name}-${sigungu}`,
    area: `${sido.fullName} ${sigungu}`,
    road: `${sido.fullName} ${sigungu}`,
    jibun: "",
    sido: sido.name,
    sigungu,
    latitude: null,
    longitude: null,
  };
}

const ALL_REGIONS = SIDO_LIST.flatMap((sido) =>
  sido.sigungu.map((sigungu) => ({
    region: makeRegion(sido, sigungu),
    // 띄어쓰기 없이 비교할 이름들. 예) "경기도파주시", "경기파주시", "파주시"
    searchNames: [sido.fullName, sido.name, ...(sido.aliases ?? [])].map((name) => `${name}${sigungu}`),
  })),
);

/* 검색어가 들어간 시·군·구를 전부 돌려줌. 예) "경기" → 경기도 31곳, "파주" → 경기도 파주시 */
export function searchRegions(keyword) {
  const query = keyword.replace(/\s/g, "");
  if (query === "") return [];
  return ALL_REGIONS.filter((item) => item.searchNames.some((name) => name.includes(query))).map(
    (item) => item.region,
  );
}

/* 시·도 + 시·군·구 이름으로 목록의 지역을 찾음 (서버에서 받은 값, 카카오 결과를 맞출 때 사용)
   "수원시 장안구"처럼 구까지 오면 앞의 "수원시"로 맞춤 */
export function findRegion(sidoName, sigunguName) {
  if (!sidoName || !sigunguName) return null;
  const sido = SIDO_LIST.find(
    (item) => item.name === sidoName || item.fullName === sidoName || item.aliases?.includes(sidoName),
  );
  if (!sido) return null;
  if (sido.sigungu.length === 1) return makeRegion(sido, sido.sigungu[0]);
  const sigungu = sido.sigungu.find((name) => name === sigunguName || sigunguName.startsWith(`${name} `));
  return sigungu ? makeRegion(sido, sigungu) : null;
}