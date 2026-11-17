import styled from "styled-components";

/* ● ○ ○ 페이지 표시 */
export default function PageDots({ total, current, onSelect, size = 10, gap = 12 }) {
  return (
    <Dots $gap={gap}>
      {Array.from({ length: total }, (_, index) => (
        <Dot
          key={index}
          type="button"
          aria-label={`${index + 1}번째 페이지 보기`}
          $active={index === current}
          $size={size}
          onClick={() => onSelect(index)}
        />
      ))}
    </Dots>
  );
}

const Dots = styled.div`
  display: flex;
  gap: ${({ $gap }) => $gap}px;
`;

const Dot = styled.button`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background-color: ${({ $active }) => ($active ? "#e88b7a" : "#BBBBBB")};
  cursor: pointer;
`;