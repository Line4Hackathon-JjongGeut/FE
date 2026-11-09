import styled from "styled-components";

/* 회원가입 완료 화면 */
export default function SignupComplete() {
  return (
    <Screen>
      <h1>회원가입 완료</h1>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #FFFCF5;
`;