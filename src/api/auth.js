import { APIService } from "./api.js";

/*
  회원가입. 
*/
export function signup({ loginId, name, nickname, password }) {
  return APIService.public.post("/auth/signup", { loginId, name, nickname, password });
}

/*
  로그인.
  아이디/비밀번호를 보내고, 성공시 data에 accessToken과 refreshToken
*/
export function login({ loginId, password }) {
  return APIService.public.post("/auth/login", { loginId, password });
}

/*
  로그아웃.
  서버에 남아 있는 로그인 세션 만료시킴
*/
export function logout() {
  return APIService.public.post("/auth/logout");
}