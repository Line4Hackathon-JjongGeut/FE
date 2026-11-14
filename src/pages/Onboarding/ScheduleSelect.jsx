import styled from "styled-components";

/* 활동 일정 설정 화면 */
export default function ScheduleSelect() {
  return (
    <Screen>
      <h1>활동 일정 설정</h1>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #ffffff;
`;