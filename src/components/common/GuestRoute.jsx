import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn } from "../../utils/tokenStorage.js";

/* 로그인 전 볼 수 있는 화면 묶음. 이미 로그인했으면 홈으로 */
export default function GuestRoute() {
  if (isLoggedIn()) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}