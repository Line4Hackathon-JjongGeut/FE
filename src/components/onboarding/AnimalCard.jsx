import styled from "styled-components";
import checkOnIcon from "../../assets/icons/onboarding/icon-check-on.svg";

/* 관심 동물 선택 카드. 선택되면 테두리,배경 원,글자 색이 바뀌고 오른쪽에 체크 표시 */
export default function AnimalCard({ image, imageWidth, label, selected, onClick }) {
  return (
    <Card type="button" role="radio" aria-checked={selected} $selected={selected} onClick={onClick}>
      <ImageCircle $selected={selected}>
        <img src={image} alt="" width={imageWidth} />
      </ImageCircle>
      <Label $selected={selected}>{label}</Label>
      {selected ? <img src={checkOnIcon} alt="" /> : <EmptyCheck />}
    </Card>
  );
}

const Card = styled.button`
  display: flex;
  gap: 16px;
  align-items: center;
  width: 100%;
  height: 92px;
  padding: 0 23px 0 15px;
  border: 2px solid ${({ $selected }) => ($selected ? "#e88b7a" : "#f0e9d2")};
  border-radius: 10px;
  background-color: #ffffff;
  text-align: left;
  cursor: pointer;
`;

const ImageCircle = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 67px;
  height: 67px;
  border-radius: 50%;
  background-color: ${({ $selected }) => ($selected ? "#f6cdc5" : "#f0e9d2")};
`;

const Label = styled.span`
  flex: 1;
  color: ${({ $selected }) => ($selected ? "#421910" : "#8a8268")};
  font-size: 18px;
  font-weight: 600;
`;

/* 선택 안 된 상태의 빈 동그라미 */
const EmptyCheck = styled.span`
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border: 2px solid #f0e9d2;
  border-radius: 50%;
`;