import styled from "styled-components";

/* 홈 섹션 제목 줄 */
export default function SectionHeader({ icon, title, linkLabel, onLinkClick }) {
  return (
    <Header>
      <Title>
        {icon}
        {title}
      </Title>
      {linkLabel && (
        <Link type="button" onClick={onLinkClick}>
          {linkLabel} ›
        </Link>
      )}
    </Header>
  );
}

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  display: flex;
  gap: 7px;
  align-items: center;
  color: #2f3833;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.4px;
`;

const Link = styled.button`
  padding: 8px 0;
  border: 0;
  background: transparent;
  color: #6b716d;
  font-size: 13px;
  cursor: pointer;
`;