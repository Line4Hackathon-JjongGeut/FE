import { Navigate, Outlet } from "react-router-dom";
import { isLoggedIn } from "../../utils/tokenStorage.js";

/* 로그인해야 볼 수 있는 화면 묶음
   토큰이 없으면 소개 화면으로, 있으면 안쪽 화면 */
export default function ProtectedRoute() {
  if (!isLoggedIn()) {
    return <Navigate to="/intro" replace />;
  }
  return <Outlet />;
}