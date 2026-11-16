/* "추천 조건 수정" 화면에서 고치는 중인 값 (임시 사본)
   지역 검색·경험 작성 화면에 다녀와도 고친 값이 남아 있도록 화면 밖에 보관
   저장하기를 눌러야 진짜 저장소에 반영되고, 나가면 버림 */
import { getPreferences, updatePreferences } from "../onboarding/preferences.js";
import { getUser, updateUser } from "./userDummy.js";

let original = null;
let draft = null;

export function startDraft() {
  original = { ...getPreferences(), phone: getUser().phone };
  draft = original;
  return draft;
}

export function getDraft() {
  return draft ?? startDraft();
}

export function updateDraft(data) {
  draft = { ...getDraft(), ...data };
  return draft;
}

export function isDraftChanged() {
  return JSON.stringify(getDraft()) !== JSON.stringify(original);
}

export function saveDraft() {
  const { phone, ...preferences } = getDraft();
  updatePreferences(preferences);
  updateUser({ phone });
  discardDraft();
}

export function discardDraft() {
  original = null;
  draft = null;
}