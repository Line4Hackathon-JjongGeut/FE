import styled from "styled-components";

/* 활동 가능 시간대 카드. 아이콘 + 이름 + 시간으로 구성되고 여러 개를 고를 수 있음. */
export default function TimeSlotCard({ icon, title, time, selected, onClick }) {
  return (
    <Card type="button" aria-pressed={selected} $selected={selected} onClick={onClick}>
      <Head>
        <img src={icon} alt="" />
        {title}
      </Head>
      <Time>{time}</Time>
    </Card>
  );
}

const Card = styled.button`
  display: flex;
  flex-direction: column;
  gap: 5px;
  height: 62px;
  padding: 11px 16px;
  border: 1.7px solid ${({ $selected }) => ($selected ? "#e88b7a" : "#d9d9d9")};
  border-radius: 10px;
  background-color: ${({ $selected }) => ($selected ? "#fbe3dc" : "#ffffff")};
  text-align: left;
  cursor: pointer;
`;

const Head = styled.span`
  display: flex;
  gap: 7px;
  align-items: center;
  color: #2f3833;
  font-size: 15px;
  font-weight: 600;
`;

const Time = styled.span`
  color: #696969;
  font-size: 12px;
  font-weight: 500;
`;