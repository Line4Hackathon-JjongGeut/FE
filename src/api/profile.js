
import { APIService } from "./api.js";

/*
  내 추천 프로필 조회
  */
export function getMyProfile() {
  return APIService.public.get("/users/me/profile");
}

/*
  내 추천 프로필 저장·수정
*/
export function updateMyProfile(profile) {
  return APIService.public.patch("/users/me/profile", profile);
}

/* 
  내 봉사 경험 목록 조회 
*/
  export function getMyVolunteerExperiences() {
  return APIService.public.get("/users/me/volunteer-experiences");
}

/* 
  봉사 경험 저장 
*/
export function createVolunteerExperience(experience) {
  return APIService.public.post("/users/me/volunteer-experiences", experience);
}