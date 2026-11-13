import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import backIcon from "../../assets/icons/shelters/back.svg";
import clockIcon from "../../assets/icons/volunteer/clock.svg";
import { getApplications } from "../../dummyData/volunteer/applications.js";

const FILTERS = ["전체", "승인 대기", "참여 예정", "참여 완료"];

const BADGE = {
  "승인 대기": { background: "#fcebc4", color: "#6e5110" },
  "참여 예정": { background: "#e3f0e6", color: "#2f5e43" },
  "참여 완료": { background: "#e9e9e9", color: "#50545a" },
};

/* 접수가 끝난 봉사와 기존 참여 내역을 상태별로 보여 줍니다. */
export default function Activities() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("전체");
  const applications = getApplications();
  const visible =
    filter === "전체" ? applications : applications.filter((item) => item.status === filter);

  function labelOf(name) {
    if (name === "전체" || name === "참여 완료") return name;
    const count = applications.filter((item) => item.status === name).length;
    return `${name}(${count})`;
  }

  return (
    <Screen>
      <Header>
        <BackButton type="button" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
          <BackIcon src={backIcon} alt="" />
        </BackButton>
        <Title>내 활동</Title>
      </Header>

      <Filters>
        {FILTERS.map((name) => (
          <Filter key={name} type="button" $active={filter === name} onClick={() => setFilter(name)}>
            {labelOf(name)}
          </Filter>
        ))}
      </Filters>

      <List>
        {visible.map((item) => (
          <Card key={item.id} type="button" onClick={() => navigate(`/activities/${item.id}`)}>
            <Badge $background={BADGE[item.status].background} $color={BADGE[item.status].color}>
              {item.status}
            </Badge>
            <CardTitle>{item.title}</CardTitle>
            <Shelter>{item.shelter}</Shelter>
            <Time>
              <img src={clockIcon} alt="" />
              {item.schedule}
            </Time>
          </Card>
        ))}
      </List>
    </Screen>
  );
}

const Screen = styled.div`
  min-height: 100%;
  background-color: #ffffff;
`;

const Header = styled.header`
  position: relative;
  display: flex;
  align-items: center;
  height: 72px;
  padding: 20px 20px 0;
  background-color: #ffffff;
`;

const BackButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
`;

const BackIcon = styled.img`
  display: block;
  transform: rotate(90deg);
`;

const Title = styled.h1`
  position: absolute;
  left: 50%;
  margin: 0;
  transform: translateX(-50%);
  color: #382f2f;
  font-size: 19px;
  font-weight: 600;
`;

const Filters = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 20px 16px;
  overflow-x: auto;
  background-color: #ffffff;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Filter = styled.button`
  flex-shrink: 0;
  height: 32px;
  padding: 0 12px;
  border: 1px solid ${({ $active }) => ($active ? "#382f2f" : "#e2ded8")};
  border-radius: 10px;
  background-color: ${({ $active }) => ($active ? "#382f2f" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#382f2f")};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: calc(100dvh - 220px);
  padding: 20px 20px 28px;
  background-color: #faf5ed;
`;

const Card = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 16px 18px;
  border: 1px solid #efe8dc;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(47, 56, 51, 0.04);
  text-align: left;
  cursor: pointer;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 8px;
  background-color: ${({ $background }) => $background};
  color: ${({ $color }) => $color};
  font-size: 12px;
  font-weight: 700;
`;

const CardTitle = styled.span`
  margin-top: 10px;
  color: #382f2f;
  font-size: 17px;
  font-weight: 700;
`;

const Shelter = styled.span`
  margin-top: 6px;
  color: #605b5b;
  font-size: 13px;
  font-weight: 500;
`;

const Time = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: #211d1d;
  font-size: 13px;
  font-weight: 500;
`;
