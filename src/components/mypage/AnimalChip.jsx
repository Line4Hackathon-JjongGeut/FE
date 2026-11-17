import styled from "styled-components";

/* 추천 조건 수정의 작은 관심 동물 카드 */
export default function AnimalChip({ icon, iconWidth, label, selected, onClick }) {
  return (
    <Chip type="button" role="radio" aria-checked={selected} $selected={selected} onClick={onClick}>
      <Icon $src={icon} $width={iconWidth} $selected={selected} aria-hidden />
      {label}
    </Chip>
  );
}

const Chip = styled.button`
  display: flex;
  flex-direction: column;
  gap: 7px;
  align-items: center;
  height: 78px;
  padding: 16px 0 0;
  border: 1.5px solid ${({ $selected }) => ($selected ? "#e88b7a" : "#d9d9d9")};
  border-radius: 10px;
  background-color: ${({ $selected }) => ($selected ? "#fdf0ee" : "#ffffff")};
  color: ${({ $selected }) => ($selected ? "#2f3833" : "#696969")};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`;

/* 아이콘 모양만 따오고 색은 선택 여부에 따라 칠함 */
const Icon = styled.span`
  width: ${({ $width }) => $width}px;
  height: 27px;
  background-color: ${({ $selected }) => ($selected ? "#e88b7a" : "#696969")};
  -webkit-mask: url("${({ $src }) => $src}") center / contain no-repeat;
  mask: url("${({ $src }) => $src}") center / contain no-repeat;
`;