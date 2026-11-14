import styled from "styled-components";

/* 봉사 경험 기입 화면 */
export default function ExperienceForm() {
  return (
    <Screen>
      <h1>봉사 경험 기입</h1>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #ffffff;
`;