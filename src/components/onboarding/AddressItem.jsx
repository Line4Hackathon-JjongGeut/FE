import styled from "styled-components";

/* 주소 검색 결과 한 줄 */
export default function AddressItem({ address, selected, onClick }) {
  const title = address.name ?? address.road;
  const subText = address.name ? address.road : address.jibun;

  return (
    <Item type="button" onClick={onClick}>
      <Radio $selected={selected} />
      <Text>
        <TitleRow>
          <Road>{title}</Road>
          {selected && <Badge>현재 설정된 주소</Badge>}
        </TitleRow>
        {subText && <Jibun>{subText}</Jibun>}
      </Text>
    </Item>
  );
}

const Item = styled.button`
  display: flex;
  gap: 13px;
  align-items: center;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
`;

const Radio = styled.span`
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border: 1px solid #e88b7a;
  border-radius: 50%;
  background-color: ${({ $selected }) => ($selected ? "#f3c5bc" : "#ffffff")};
`;

const Text = styled.span`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const TitleRow = styled.span`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Road = styled.span`
  color: #000000;
  font-size: 18px;
  font-weight: 600;
`;

const Badge = styled.span`
  padding: 4px 8px;
  border-radius: 14.5px;
  background-color: #edf7ff;
  color: #086ade;
  font-size: 9.5px;
  font-weight: 600;
  white-space: nowrap;
`;

const Jibun = styled.span`
  color: #000000;
  font-size: 14px;
  font-weight: 500;
`;