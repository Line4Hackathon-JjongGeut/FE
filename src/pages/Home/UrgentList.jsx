import styled from "styled-components";

/* 긴급 모집 화면 */
export default function UrgentList() {
  return (
    <Screen>
      <h1>긴급 모집</h1>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #ffffff;
`;