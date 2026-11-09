import styled from "styled-components";

/* 소개 화면 아래 ● ○ ○ 표시 */
export default function PageDots({ total, current, onSelect }) {
  return (
    <Dots>
      {Array.from({ length: total }, (_, index) => (
        <Dot
          key={index}
          type="button"
          aria-label={`${index + 1}번째 소개 보기`}
          $active={index === current}
          onClick={() => onSelect(index)}
        />
      ))}
    </Dots>
  );
}

const Dots = styled.div`
  display: flex;
  gap: 12px;
`;

const Dot = styled.button`
  width: 10px;
  height: 10px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background-color: ${({ $active }) => ($active ? "#e88b7a" : "#BBBBBB")};
  cursor: pointer;
`;