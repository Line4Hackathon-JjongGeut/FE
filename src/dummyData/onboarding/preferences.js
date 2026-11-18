const INITIAL = {
  animal: null,
  region: null,
  days: [],
  timeSlots: [],
  frequency: null,
  activityTypes: [],
  experienceLevel: null,
  experience: null,
  savedExperience: null, 
};

let preferences = INITIAL;

export function getPreferences() {
  return preferences;
}

export function updatePreferences(data) {
  preferences = { ...preferences, ...data };
  return preferences;
}

/* 다른 계정으로 로그인했을 때 예전 계정 값을 비움 */
export function resetPreferences() {
  preferences = INITIAL;
  return preferences;
}