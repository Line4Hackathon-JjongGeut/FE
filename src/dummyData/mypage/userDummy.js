/* 로그인한 사용자 정보 */

let user = {
  name: "혜림",
  type: "일반 사용자",
  phone: "",
};

export function getUser() {
  return user;
}

/* 바뀐 값만 넘기면 기존 값과 합쳐서 저장 */
export function updateUser(data) {
  user = { ...user, ...data };
  return user;
}