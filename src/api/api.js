/*
    *사용법
    1. js파일은 도메인 기준으로 생성, 도메인은 스웨거에 나눠져있는 기준을 말함 User,Recipe...
    2. js파일 안에 해당 도메인의 API를 생성, 함수 이름은 어떤 기능이고 어떤 요청인지 알 수 있도록 해야함
    3. 하단의 코드는 템플릿이라고 보면 됨, API 사용 규칙을 정해놓은 것임
    4. APIService.public.{해당 요청 메소드}("{해당 요청 경로}");
    ! 경로는 환경변수 이후 경로부터 써야함 예: 환경변수=~~api/v1 이면 그 뒤의 경로만 넣으면 됨
    ? userApi.js에 예시를 만들었으니 참고하고 질문이 있다면 언제든 환영~
    TODO: 환경변수 상의하여 결정하고 노션에 적어놓기, 보통 v1까지 환경변수로 설정 함
 */

import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "../utils/tokenStorage.js";

/*
  서버 주소입니다.
  VITE_API_BASE_URL에는 /api/v1 까지 넣고, 도메인 파일은 그 뒤 경로만 넘깁니다.
  끝에 슬래시가 있으면 빼서, /shelters 처럼 슬래시로 시작하는 경로와 겹치지 않게 합니다.
*/
const baseURL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

/* 실제로 서버에 요청을 한 번 보내는 함수입니다. 보낼 때마다 그 순간의 토큰을 붙입니다. */
function sendRequest(method, path, body) {
  const accessToken = getAccessToken();
  return fetch(`${baseURL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      // 로그인했으면 모든 요청에 토큰을 붙임. 로그인·회원가입처럼 로그인 전 요청은 토큰 없이 감
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/*
  refreshToken으로 새 accessToken을 받아 저장합니다.
  만료된 accessToken이 붙으면 안 되니까 sendRequest를 쓰지 않고 따로 보냅니다.
*/
async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("다시 로그인이 필요합니다.");

  const response = await fetch(`${baseURL}/auth/tokens/refresh`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.data?.accessToken) throw new Error("다시 로그인이 필요합니다.");

  saveTokens({ accessToken: data.data.accessToken });
}

/*
  여러 요청이 동시에 401을 받아도 재발급은 한 번만 하도록, 진행 중인 재발급을 같이 기다립니다.
*/
let refreshPromise = null;
function refreshOnce() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/*
  모든 요청이 거치는 공통 함수입니다.
  method는 GET, POST, PUT, PATCH, DELETE 중 하나이고, path는 환경변수 뒤 경로입니다.
  body가 있으면 JSON으로 보냅니다. 관심 시설 저장처럼 본문이 없는 요청은 body를 비웁니다.
  응답이 성공이면 스웨거의 isSuccess, code, message, data 객체를 그대로 돌려줍니다.
  실패하면 status에 HTTP 코드를 담아 던집니다. 409(이미 저장), 404(없는 저장)를 화면에서 구분할 때 씁니다.
  토큰이 만료돼 401이 오면, 토큰을 재발급받아 같은 요청을 한 번 더 보냅니다.
*/
async function request(method, path, body) {
  let response = await sendRequest(method, path, body);

  // 로그인·재발급 같은 /auth 요청은 401이어도 재발급을 시도하지 않음 (비밀번호 틀림 등)
  if (response.status === 401 && getRefreshToken() && !path.startsWith("/auth/")) {
    try {
      await refreshOnce();
      response = await sendRequest(method, path, body);
    } catch {
      // 재발급까지 실패하면 로그인이 완전히 끝난 것 → 토큰을 지우고 로그인 화면으로
      clearTokens();
      window.location.replace("/login");
    }
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message ?? "요청에 실패했습니다.");
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

/* 도메인 파일에서는 APIService.public.메소드("경로")로만 호출합니다. */
export const APIService = {
  public: {
    /* 목록이나 상세처럼 서버에서 값을 가져올 때 씁니다. */
    get: (path) => request("GET", path),
    /* 저장이나 생성처럼 새 데이터를 서버에 넣을 때 씁니다. */
    post: (path, body) => request("POST", path, body),
    /* 기존 데이터 전체를 바꿀 때 씁니다. */
    put: (path, body) => request("PUT", path, body),
    /* 기존 데이터 일부만 바꿀 때 씁니다. */
    patch: (path, body) => request("PATCH", path, body),
    /* 저장된 데이터를 지울 때 씁니다. 취소 사유처럼 본문이 있으면 함께 보냅니다. */
    delete: (path, body) => request("DELETE", path, body),
  },
};
