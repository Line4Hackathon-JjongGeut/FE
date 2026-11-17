import styled from "styled-components";

/* "다른 방법으로 도와주기" 타일 */
export default function HelpTile({ icon, iconSize, title, description, colors, onClick }) {
  return (
    <Tile type="button" $colors={colors} onClick={onClick}>
      <Title $colors={colors}>
        <Icon src={icon} alt="" $size={iconSize} />
        {title}
      </Title>
      <Description $colors={colors}>{description}</Description>
      <Arrow aria-hidden $colors={colors}>
        →
      </Arrow>
    </Tile>
  );
}

const Tile = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 84px;
  padding: 10px 14px;
  border: 0;
  border-radius: 14px;
  background-color: ${({ $colors }) => $colors.background};
  text-align: left;
  cursor: pointer;
`;

const Title = styled.span`
  display: flex;
  gap: 4px;
  align-items: center;
  color: ${({ $colors }) => $colors.title};
  font-size: 14px;
  font-weight: 600;
`;

const Icon = styled.img`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
`;

const Description = styled.span`
  color: ${({ $colors }) => $colors.description};
  font-size: 11px;
  font-weight: 500;
  white-space: pre-line;
`;

const Arrow = styled.span`
  position: absolute;
  right: 10px;
  bottom: 6px;
  color: ${({ $colors }) => $colors.arrow};
  font-size: 13px;
  font-weight: 500;
  transform: rotate(-42deg);
`;