import styled from "styled-components";

/* 온보딩 화면 안의 소제목 + 내용 묶음. "활동 가능 요일" 아래에 요일 버튼 */
export default function Section({ label, children }) {
  return (
    <Wrapper>
      <Label>{label}</Label>
      {children}
    </Wrapper>
  );
}

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.h2`
  color: #4f7a5f;
  font-size: 17px;
  font-weight: 600;
`;