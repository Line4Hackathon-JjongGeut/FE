/* 목록에 있으면 빼고, 없으면 넣음. (여러 개 고르는 버튼에서 사용) */
export function toggleItem(list, item) {
  return list.includes(item) ? list.filter((value) => value !== item) : [...list, item];
}