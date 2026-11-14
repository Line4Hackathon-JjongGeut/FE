import styled from "styled-components";

const DAYS = ["월", "화", "수", "목", "금", "토", "일"];

/* 요일 동그라미 버튼 7개. */
export default function DaySelector({ selectedDays, onToggle }) {
  return (
    <Days>
      {DAYS.map((day) => {
        const selected = selectedDays.includes(day);
        return (
          <Day key={day} type="button" aria-pressed={selected} $selected={selected} onClick={() => onToggle(day)}>
            {day}
          </Day>
        );
      })}
    </Days>
  );
}

const Days = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Day = styled.button`
  width: 43.5px;
  height: 43.5px;
  padding: 0;
  border: 2px solid ${({ $selected }) => ($selected ? "#e88b7a" : "#d9d9d9")};
  border-radius: 50%;
  background-color: ${({ $selected }) => ($selected ? "#fbe3dc" : "#ffffff")};
  color: #000000;
  font-size: 16px;
  font-weight: ${({ $selected }) => ($selected ? 600 : 400)};
  cursor: pointer;
`;