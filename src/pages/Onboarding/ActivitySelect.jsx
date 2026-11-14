import styled from "styled-components";

/* 관심 활동 선택 화면 */
export default function ActivitySelect() {
  return (
    <Screen>
      <h1>관심 활동 선택</h1>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #ffffff;
`;