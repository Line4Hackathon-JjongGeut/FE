import styled from "styled-components";

/* 여러 선택지 중 하나만 고르는 탭 버튼. 월 1회 / 월 2-3회 / 매주 */
export default function SegmentedControl({ options, value, onChange, label }) {
  return (
    <Group role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <Option
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            $selected={selected}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </Option>
        );
      })}
    </Group>
  );
}

const Group = styled.div`
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  gap: 12px;
  height: 51px;
  padding: 4px 7px;
  border: 2px solid #d9d9d9;
  border-radius: 10px;
`;

const Option = styled.button`
  border: 1px solid ${({ $selected }) => ($selected ? "#e88b7a" : "transparent")};
  border-radius: 8.8px;
  background-color: ${({ $selected }) => ($selected ? "#fbe3dc" : "transparent")};
  color: ${({ $selected }) => ($selected ? "#282b29" : "#505050")};
  font-size: 15px;
  font-weight: ${({ $selected }) => ($selected ? 600 : 500)};
  cursor: pointer;
`;