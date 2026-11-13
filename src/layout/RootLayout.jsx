import { useState } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import BottomNav from "../components/common/BottomNav.jsx";

export default function RootLayout() {
  const [hideNav, setHideNav] = useState(false);

  return (
    <Shell>
      <Main>
        <Outlet context={{ setHideNav }} />
      </Main>
      {/* 지도 바텀시트가 올라온 동안만 하단 메뉴를 숨깁니다. */}
      {!hideNav && <BottomNav />}
    </Shell>
  );
}

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
`;

const Main = styled.main`
  flex: 1;
`;
