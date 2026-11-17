import styled from "styled-components";

const ACTIVITY_TYPES = ["산책 봉사", "견사 청소", "목욕, 미용", "사진 촬영", "급식, 돌봄", "기타"];

/* 활동 유형 칩. 여러 개를 고르기 가능.
   관심 활동 화면, 봉사 경험 기입 화면에서 사용 */
export default function ActivityTypeChips({ selectedTypes, onToggle }) {
  return (
    <Grid>
      {ACTIVITY_TYPES.map((type) => {
        const selected = selectedTypes.includes(type);
        return (
          <Chip key={type} type="button" aria-pressed={selected} $selected={selected} onClick={() => onToggle(type)}>
            {type}
          </Chip>
        );
      })}
    </Grid>
  );
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const Chip = styled.button`
  height: 44px;
  padding: 0;
  border: 2px solid ${({ $selected }) => ($selected ? "#e88b7a" : "#d9d9d9")};
  border-radius: 10px;
  background-color: ${({ $selected }) => ($selected ? "#fbe3dc" : "#ffffff")};
  color: #000000;
  font-size: 15px;
  font-weight: ${({ $selected }) => ($selected ? 500 : 400)};
  cursor: pointer;
`;