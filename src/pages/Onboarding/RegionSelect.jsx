import styled from "styled-components";

/* 희망 지역 설정 화면 */
export default function RegionSelect() {
  return (
    <Screen>
      <h1>희망 지역 설정</h1>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #ffffff;
`;