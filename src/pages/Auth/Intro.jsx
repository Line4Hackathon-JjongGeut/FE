import styled from "styled-components";

/* 서비스 소개 화면 */
export default function Intro() {
  return (
    <Screen>
      <h1>서비스 소개</h1>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #FFFCF5;
`;