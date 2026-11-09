import styled from "styled-components";

/* 가운데 제목 상단 헤더 */
export default function BackHeader({ title, onBack }) {
  return (
    <Header>
      {onBack && (
        <BackButton type="button" aria-label="뒤로 가기" onClick={onBack}>
          ←
        </BackButton>
      )}
      <Title>{title}</Title>
    </Header>
  );
}

const Header = styled.header`
  position: relative;
  display: flex;
  align-items: center;
  height: 72px;
  padding: 20px 24px 0;
`;

const BackButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  color: #424242;
  font-size: 24px;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
`;

const Title = styled.h1`
  position: absolute;
  left: 50%;
  margin: 0;
  transform: translateX(-50%);
  color: #424242;
  font-size: 20px;
  font-weight: 600;
`;