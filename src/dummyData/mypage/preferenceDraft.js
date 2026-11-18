const EMPTY = {
  animal: null,
  region: null,
  days: [],
  timeSlots: [],
  frequency: null,
  activityTypes: [],
  experienceLevel: null,
  experience: null,
};

let original = null;
let draft = null;

export function startDraft() {
  original = null;
  draft = null;
}

export function hasDraft() {
  return draft !== null;
}

export function loadDraft(preferences) {
  original = preferences;
  draft = preferences;
  return draft;
}

export function getDraft() {
  return draft ?? EMPTY;
}

export function getOriginal() {
  return original ?? EMPTY;
}

export function updateDraft(data) {
  draft = { ...getDraft(), ...data };
  return draft;
}

export function isDraftChanged() {
  return JSON.stringify(getDraft()) !== JSON.stringify(getOriginal());
}

export function discardDraft() {
  original = null;
  draft = null;
}