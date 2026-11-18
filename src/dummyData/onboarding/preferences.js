let preferences = {
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

export function getPreferences() {
  return preferences;
}

export function updatePreferences(data) {
  preferences = { ...preferences, ...data };
  return preferences;
}