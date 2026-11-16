import { useNavigate } from "react-router-dom";

/* 앱 안에서 이동해 온 기록이 있으면 한 칸 뒤, 주소로 바로 들어와서 기록이 없으면 fallback 경로로 */
export function useGoBack() {
  const navigate = useNavigate();

  return function goBack(fallback = "/") {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  };
}