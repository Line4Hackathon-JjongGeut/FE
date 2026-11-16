/* 주소의 ?page=2 를 0부터 시작하는 페이지 번호로 바꿈. 앖거나, 숫자가 아니거나, 범위를 벗어나면 첫 페이지 */
export function readPageIndex(searchParams, pageCount) {
  const index = Number(searchParams.get("page")) - 1;
  return Number.isInteger(index) && index >= 0 && index < pageCount ? index : 0;
}