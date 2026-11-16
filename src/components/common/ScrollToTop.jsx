import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/* 새 화면으로 이동하면 스크롤을 맨 위로 올림 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [pathname, navigationType]);

  return null;
}