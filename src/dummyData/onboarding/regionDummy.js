/* 주소 검색 가짜 주소 */

/* "현재 위치로 찾기" 주소 */
export const CURRENT_LOCATION = {
  id: "seongbuk-jeongneung-77",
  road: "서울 성북구 정릉로 77",
  jibun: "서울 성북구 정릉동 861-1",
};

const ADDRESSES = [
  CURRENT_LOCATION,
  { id: "seongbuk-solsaem-5", road: "서울 성북구 솔샘로5길 15", jibun: "서울 성북구 정릉동 1009" },
  { id: "seongbuk-arirang-19", road: "서울 성북구 아리랑로 19", jibun: "서울 성북구 동선동1가 12" },
  { id: "seongbuk-bomun-168", road: "서울 성북구 보문로 168", jibun: "서울 성북구 삼선동2가 300" },
  { id: "mapo-worldcup-212", road: "서울 마포구 월드컵로 212", jibun: "서울 마포구 성산동 515" },
  { id: "mapo-mangwon-51", road: "서울 마포구 망원로 51", jibun: "서울 마포구 망원동 413" },
  { id: "mapo-yanghwa-160", road: "서울 마포구 양화로 160", jibun: "서울 마포구 서교동 353" },
  { id: "yongsan-hangang-405", road: "서울 용산구 한강대로 405", jibun: "서울 용산구 동자동 43" },
];

/* 도로명·지번 주소에 검색어가 들어 있는 주소를 돌려줍니다. 예) "정릉", "마포구", "망원동" */
export function searchAddresses(keyword) {
  const query = keyword.trim();
  if (query === "") return [];
  return ADDRESSES.filter((address) => address.road.includes(query) || address.jibun.includes(query));
}