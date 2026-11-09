/* 중복 확인 API가 생기기 전까지 쓸 데이터. 여기 있는 값은 "이미 사용 중" 처리 */

const TAKEN_NICKNAMES = ["쫑긋", "멍멍이", "냥냥이"];
const TAKEN_USER_IDS = ["admin", "jjonggeut", "test1234"];

export function isNicknameTaken(nickname) {
  return TAKEN_NICKNAMES.includes(nickname.trim());
}

export function isUserIdTaken(userId) {
  return TAKEN_USER_IDS.includes(userId.trim().toLowerCase());
}