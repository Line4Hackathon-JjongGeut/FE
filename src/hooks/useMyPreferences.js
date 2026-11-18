import { useEffect, useSyncExternalStore } from "react";
import { getMyProfile } from "../api/profile.js";
import { getPreferences, updatePreferences, resetPreferences } from "../dummyData/onboarding/preferences.js";
import { fromProfileResponse } from "../utils/profileMapper.js";
import { formatPreferenceSummary } from "../utils/preferenceSummary.js";
import { getRefreshToken } from "../utils/tokenStorage.js";

/* 홈의 요약 박스, 추천 섹션이 같이 쓰는 불러오기 상태 */
let state = { status: "loading", session: null };
const listeners = new Set();

function setState(next) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

function load(session) {
  // 같은 로그인으로 이미 불러오는 중이면 요청을 또 보내지 않음
  if (state.session === session && state.status === "loading") return;
  const isOtherAccount = state.session !== null && state.session !== session;
  setState({ status: "loading", session });

  getMyProfile()
    .then((result) => {
      if (state.session !== session) return;
      // 로그아웃 후 다른 계정으로 들어왔으면 예전 계정 값부터 비움
      if (isOtherAccount) resetPreferences();
      // 온보딩을 끝낸 사람만 서버 값으로 채움
      if (result.data?.onboardingCompleted) updatePreferences(fromProfileResponse(result.data));
      setState({ status: "ready" });
    })
    .catch(() => {
      if (state.session === session) setState({ status: "error" });
    });
}

/* 홈, 추천 화면에서 쓰는 내 추천 조건 */
export function useMyPreferences() {
  const session = getRefreshToken() ?? "";
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  const isCurrent = snapshot.session === session;

  useEffect(() => {
    if (!isCurrent) load(session);
  }, [isCurrent, session]);

  const status = isCurrent ? snapshot.status : "loading"; 
  const preferences = getPreferences();

  return {
    preferences,
    status,
    summary: status === "ready" ? formatPreferenceSummary(preferences) : null,
    retry: () => load(session),
  };
}