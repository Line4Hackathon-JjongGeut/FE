import { APIService } from "./api.js";

/* 내 계정 조회. 프로필 사진은 data.profileImageUrl입니다. */
export function getMyAccount() {
  return APIService.public.get("/users/me");
}


/*  회원 탈퇴 */
export function deleteMyAccount() {
  return APIService.public.delete("/users/me");
}