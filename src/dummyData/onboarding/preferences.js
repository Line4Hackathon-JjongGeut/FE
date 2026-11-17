/* 온보딩에서 고른 값. 화면을 이동해도 이번 방문 동안 유지 (API 연동 전 임시 저장) */

let preferences = {
  animal: null, 
  region: null, 
  days: [],
  timeSlots: [], 
  frequency: null, 
  activityTypes: [], 
  experienceLevel: null, 
  experience: null, 
};

export function getPreferences() {
  return preferences;
}

/* 바뀐 값만 넘기면 기존 값과 합쳐서 저장 */
export function updatePreferences(data) {
  preferences = { ...preferences, ...data };
  return preferences;
}