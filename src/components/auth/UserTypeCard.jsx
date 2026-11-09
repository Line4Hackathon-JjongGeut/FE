import styled from "styled-components";

/* 사용자 유형 선택 카드. 선택되면 배경, 아이콘, 라디오 색이 바뀜 */
export default function UserTypeCard({ icon, title, description, selected, onClick }) {
  return (
    <Card type="button" role="radio" aria-checked={selected} $selected={selected} onClick={onClick}>
      <IconCircle $selected={selected}>
        <Icon $src={icon} $selected={selected} />
      </IconCircle>
      <Text>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </Text>
      <Radio $selected={selected}>{selected && <RadioDot />}</Radio>
    </Card>
  );
}

const Card = styled.button`
  display: flex;
  gap: 16px;
  align-items: center;
  width: 100%;
  padding: 20px;
  border: 1px solid ${({ $selected }) => ($selected ? "#d4897a" : "#e2ded8")};
  border-radius: 14px;
  background-color: ${({ $selected }) => ($selected ? "#f7e6e1" : "#ffffff")};
  text-align: left;
  cursor: pointer;
`;

const IconCircle = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1px solid #efe6e1;
  border-radius: 50%;
  background-color: ${({ $selected }) => ($selected ? "#d4897a" : "#ffffff")};
`;

/* 선택 여부에 따라 아이콘 색을 바꾸려고 SVG를 mask로 씌우고 배경색으로 칠함 */
const Icon = styled.span`
  width: 24px;
  height: 24px;
  background-color: ${({ $selected }) => ($selected ? "#ffffff" : "#d4897a")};
  -webkit-mask: url("${({ $src }) => $src}") center / contain no-repeat;
  mask: url("${({ $src }) => $src}") center / contain no-repeat;
`;

const Text = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.span`
  color: #1f1f1f;
  font-size: 17px;
  font-weight: 600;
`;

const Description = styled.span`
  color: #6b6b6b;
  font-size: 14px;
  line-height: 20.3px;
  white-space: pre-line;
`;

const Radio = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: ${({ $selected }) => ($selected ? "0" : "1px solid #cfc9c1")};
  border-radius: 50%;
  background-color: ${({ $selected }) => ($selected ? "#d4897a" : "transparent")};
`;

const RadioDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ffffff;
`;