import styled from "styled-components";

/* 지도에서 위치 확인 화면 */
export default function RegionMap() {
  return (
    <Screen>
      <h1>지도에서 위치 확인</h1>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #ffffff;
`;