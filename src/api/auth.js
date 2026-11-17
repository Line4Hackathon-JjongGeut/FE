import { APIService } from "./api.js";

/*
  로그인.
  아이디/비밀번호를 보내고, 성공시 data에 accessToken과 refreshToken
*/
export function login({ loginId, password }) {
  return APIService.public.post("/auth/login", { loginId, password });
}