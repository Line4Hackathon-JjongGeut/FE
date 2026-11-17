import { APIService } from "./api.js";

/*  내 계정 조회. */
export function getMyAccount() {
  return APIService.public.get("/users/me");
}