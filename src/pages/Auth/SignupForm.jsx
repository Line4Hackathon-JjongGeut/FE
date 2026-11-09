import styled from "styled-components";

/* 일반 사용자 회원가입 화면 */
export default function SignupForm() {
  return (
    <Screen>
      <h1>사용자 회원가입</h1>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #FFF;
`;