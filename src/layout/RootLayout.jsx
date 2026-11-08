import { Outlet } from "react-router-dom";
import styled from "styled-components";
import BottomNav from "../components/common/BottomNav.jsx";

export default function RootLayout() {
  return (
    <Shell>
      <Main>
        <Outlet />
      </Main>
      <BottomNav />
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
