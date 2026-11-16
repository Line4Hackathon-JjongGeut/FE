/* 온보딩과 마이페이지 "추천 조건 수정"이 같이 쓰는 선택지 목록 */
import morningIcon from "../../assets/icons/onboarding/time-morning.svg";
import afternoonIcon from "../../assets/icons/onboarding/time-afternoon.svg";
import eveningIcon from "../../assets/icons/onboarding/time-evening.svg";
import weekendIcon from "../../assets/icons/onboarding/time-weekend.svg";

export const TIME_SLOTS = [
  { id: "morning", icon: morningIcon, title: "오전", time: "09:00 - 12:00" },
  { id: "afternoon", icon: afternoonIcon, title: "오후", time: "12:00 - 18:00" },
  { id: "evening", icon: eveningIcon, title: "저녁", time: "18:00 - 21:00" },
  { id: "allday", icon: weekendIcon, title: "종일", time: "09:00 - 21:00" },
];

export const FREQUENCIES = [
  { id: "monthly", label: "월 1회" },
  { id: "biweekly", label: "월 2-3회" },
  { id: "weekly", label: "매주" },
];

export const EXPERIENCE_LEVELS = [
  { id: "none", label: "처음이에요" },
  { id: "few", label: "1~3회" },
  { id: "many", label: "4회 이상" },
];