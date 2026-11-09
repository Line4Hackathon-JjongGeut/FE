import styled from "styled-components";

/* 사용자 유형 선택 화면 */
export default function SignupType() {
  return (
    <Screen>
      <h1>사용자 유형 선택</h1>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #FFF;
`;