import styled from "styled-components";

/* 나를 위한 봉사 추천 화면 */
export default function Recommendations() {
  return (
    <Screen>
      <h1>나를 위한 봉사 추천</h1>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #ffffff;
`;