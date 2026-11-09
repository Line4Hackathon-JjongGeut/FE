import styled from "styled-components";

/* 로그인 화면 */
export default function Login() {
  return (
    <Screen>
      <h1>로그인</h1>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #FFF;
`;