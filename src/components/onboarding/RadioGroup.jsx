import styled from "styled-components";

/* 세로로 나열된 동그라미 라디오 버튼. 처음이에요 / 1~3회 / 4회 이상 */
export default function RadioGroup({ options, value, onChange, label }) {
  return (
    <List role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const selected = value === option.id;
        return (
          <Option key={option.id} type="button" role="radio" aria-checked={selected} onClick={() => onChange(option.id)}>
            <Circle $selected={selected}>{selected && <Dot />}</Circle>
            {option.label}
          </Option>
        );
      })}
    </List>
  );
}

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
  align-items: flex-start;
`;

const Option = styled.button`
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #000000;
  font-size: 15px;
  cursor: pointer;
`;

const Circle = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: ${({ $selected }) => ($selected ? "0" : "2px solid #d9d9d9")};
  border-radius: 50%;
  background-color: ${({ $selected }) => ($selected ? "#d4897a" : "transparent")};
`;

const Dot = styled.span`
  width: 6.5px;
  height: 6.5px;
  border-radius: 50%;
  background-color: #ffffff;
`;