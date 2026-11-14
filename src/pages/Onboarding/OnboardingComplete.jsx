import styled from "styled-components";

/* 초기 설정 완료 화면 */
export default function OnboardingComplete() {
  return (
    <Screen>
      <h1>초기 설정 완료</h1>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #ffffff;
`;