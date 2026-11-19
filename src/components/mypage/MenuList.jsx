import styled from "styled-components";
import chevronIcon from "../../assets/icons/search/chevron.svg";

/* 마이페이지 메뉴 묶음 */
export default function MenuList({ items }) {
  return (
    <Box>
      {items.map((item) => (
        <Row key={item.label} type="button" onClick={item.onClick}>
          <Icon src={item.icon} alt="" />
          <Label $danger={item.danger}>{item.label}</Label>
          {item.value && <Value>{item.value}</Value>}
          <Chevron src={chevronIcon} alt="" />
        </Row>
      ))}
    </Box>
  );
}

const Box = styled.div`
  padding: 3px 14px;
  border: 1px solid #dad8d8;
  border-radius: 10px;
`;

const Row = styled.button`
  display: flex;
  gap: 6px;
  align-items: center;
  width: 100%;
  padding: 13px 5px;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;

  & + & {
    border-top: 1px solid #dad8d8;
  }
`;

const Icon = styled.img`
  width: 14px;
  height: 16px;
  object-fit: contain;
`;

const Label = styled.span`
  flex: 1;
  color: ${({ $danger }) => ($danger ? "#c4513b" : "#312d2d")};
  font-size: 15px;
  font-weight: 600;
`;

const Value = styled.span`
  color: #8a8a8a;
  font-size: 14px;
  font-weight: 500;
`;

const Chevron = styled.img`
  width: 13px;
  height: 7px;
  margin-right: -6px;
  transform: rotate(-90deg);
`;