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

/*
  서버 주소입니다.
  VITE_API_BASE_URL에는 /api/v1 까지 넣고, 도메인 파일은 그 뒤 경로만 넘깁니다.
  끝에 슬래시가 있으면 빼서, /shelters 처럼 슬래시로 시작하는 경로와 겹치지 않게 합니다.
*/
const baseURL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

/*
  모든 요청이 거치는 공통 함수입니다.
  method는 GET, POST, PUT, PATCH, DELETE 중 하나이고, path는 환경변수 뒤 경로입니다.
  body가 있으면 JSON으로 보냅니다. 관심 시설 저장처럼 본문이 없는 요청은 body를 비웁니다.
  응답이 성공이면 스웨거의 isSuccess, code, message, data 객체를 그대로 돌려줍니다.
  실패하면 status에 HTTP 코드를 담아 던집니다. 409(이미 저장), 404(없는 저장)를 화면에서 구분할 때 씁니다.
*/
async function request(method, path, body) {
  const response = await fetch(`${baseURL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

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
    /* 저장된 데이터를 지울 때 씁니다. */
    delete: (path) => request("DELETE", path),
  },
};
