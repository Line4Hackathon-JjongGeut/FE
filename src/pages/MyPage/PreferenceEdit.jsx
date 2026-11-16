import styled from "styled-components";

/* 추천 조건 수정 화면 */
export default function PreferenceEdit() {
  return (
    <Screen>
      <h1>추천 조건 수정</h1>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #ffffff;
`;