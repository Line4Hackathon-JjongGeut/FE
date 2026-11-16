import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import photoPawIcon from "../../assets/icons/activities/photo-paw.svg";
import clockIcon from "../../assets/icons/activities/clock.svg";
import pawIcon from "../../assets/icons/activities/paw.svg";
import pawFilledIcon from "../../assets/icons/activities/paw-filled.svg";
import { getApplications, toggleFavorite } from "../../dummyData/volunteer/applications.js";
import { FILTER_COLORS } from "../../dummyData/map/mapDummy.js";

const TABS = [
  { id: "calendar", label: "캘린더" },
  { id: "history", label: "활동 내역" },
  { id: "saved", label: "저장" },
];

const HISTORY_FILTERS = ["전체", "승인 대기", "참여 예정", "참여 완료", "즐겨찾기"];
const SAVED_FILTERS = ["전체", "봉사", "후원", "임시보호", "즐겨찾기"];
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const BADGE = {
  "승인 대기": { background: "#fcebc4", color: "#6e5110" },
  "참여 예정": { background: "#e3f0e6", color: "#2f5e43" },
  "참여 완료": { background: "#e9e9e9", color: "#50545a" },
  "신청 반려": { background: "#f9eae7", color: "#c8807a" },
};

/* 하단 메뉴의 활동을 누르면 캘린더, 활동 내역, 저장을 오갑니다. */
export default function Activities() {
  const navigate = useNavigate();
  const location = useLocation();
  const openedTab = location.state?.tab;
  const [tab, setTab] = useState(
    openedTab === "history" || openedTab === "saved" || openedTab === "calendar" ? openedTab : "calendar",
  );
  // 마이페이지 "완료한 활동"에서 넘어오면 그 필터를 켠 채로 시작
  const [historyFilter, setHistoryFilter] = useState(
    HISTORY_FILTERS.includes(location.state?.filter) ? location.state.filter : "전체",
  );  
  const [savedFilter, setSavedFilter] = useState("전체");
  const [cursor, setCursor] = useState(() => new Date(2026, 10, 1));
  const [selectedKey, setSelectedKey] = useState("2026-11-14");
  const [monthOpen, setMonthOpen] = useState(false);
  const [items, setItems] = useState(() => getApplications());

  function openDetail(id) {
    navigate(`/activities/${id}`, { state: { from: tab === "saved" ? "saved" : "history" } });
  }

  function refresh(id) {
    toggleFavorite(id);
    setItems(getApplications());
  }

  const history = items.filter((item) => item.inHistory !== false);
  const saved = items.filter((item) => item.favorite);
  const calendarItems = items.filter((item) => item.onCalendar && item.activityDate);

  const visibleHistory = history.filter((item) => {
    if (historyFilter === "전체") return true;
    if (historyFilter === "즐겨찾기") return item.favorite;
    return item.status === historyFilter;
  });

  const visibleSaved = saved.filter((item) => {
    if (savedFilter === "전체" || savedFilter === "즐겨찾기") return true;
    return item.category === savedFilter;
  });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const selected = parseKey(selectedKey);
  const selectedItems = calendarItems.filter((item) => item.activityDate === selectedKey);
  const upcoming = calendarItems
    .filter((item) => item.activityDate > selectedKey)
    .sort((a, b) => a.activityDate.localeCompare(b.activityDate));

  function shiftMonth(amount) {
    const next = new Date(year, month + amount, 1);
    setCursor(next);
    const day = Math.min(selected.getDate(), daysInMonth(next.getFullYear(), next.getMonth()));
    setSelectedKey(keyOf(new Date(next.getFullYear(), next.getMonth(), day)));
  }

  return (
    <Screen>
      <TabBar>
        {TABS.map((item) => (
          <Tab key={item.id} type="button" $active={tab === item.id} onClick={() => setTab(item.id)}>
            {item.label}
          </Tab>
        ))}
      </TabBar>

      {tab === "calendar" && (
        <>
          <MonthBar>
            <ArrowButton type="button" aria-label="이전 달" onClick={() => shiftMonth(-1)}>
              <Arrow $dir="left" />
            </ArrowButton>
            <MonthTitle>
              {year}년 {month + 1}월
            </MonthTitle>
            <ArrowButton type="button" aria-label="다음 달" onClick={() => shiftMonth(1)}>
              <Arrow $dir="right" />
            </ArrowButton>
          </MonthBar>

          <WeekNames>
            {WEEKDAYS.map((name) => (
              <WeekName key={name}>{name}</WeekName>
            ))}
          </WeekNames>

          {(monthOpen ? monthWeeks(year, month) : [weekOf(selected)]).map((week) => (
            <WeekRow key={keyOf(week[0])}>
              {week.map((date) => {
                const key = keyOf(date);
                const inMonth = date.getMonth() === month;
                const marked = calendarItems.some((item) => item.activityDate === key);
                return (
                  <DayButton key={key} type="button" onClick={() => setSelectedKey(key)}>
                    <DayNumber $selected={key === selectedKey} $muted={!inMonth}>
                      {date.getDate()}
                    </DayNumber>
                    {/* 일정이 있는 날 아래의 작은 초록 점 두 개입니다. */}
                    <Dots>{marked && inMonth ? <><Dot /><Dot /></> : null}</Dots>
                  </DayButton>
                );
              })}
            </WeekRow>
          ))}

          <ExpandButton type="button" onClick={() => setMonthOpen((open) => !open)}>
            월 전체 보기
            <ExpandChevron $open={monthOpen} />
          </ExpandButton>

          <DayHeading>{dateLabel(selected)}</DayHeading>
          {selectedItems.map((item) => (
            <CalendarCard key={item.id} item={item} onOpen={() => openDetail(item.id)} onFavorite={() => refresh(item.id)} />
          ))}

          {upcoming.length > 0 && (
            <>
              <Divider />
              <SectionTitle>다가오는 활동</SectionTitle>
              {groupByDate(upcoming).map((group) => (
                <div key={group.key}>
                  <DayHeading>{dateLabel(parseKey(group.key))}</DayHeading>
                  {group.items.map((item) => (
                    <CalendarCard key={item.id} item={item} onOpen={() => openDetail(item.id)} onFavorite={() => refresh(item.id)} />
                  ))}
                </div>
              ))}
            </>
          )}
        </>
      )}

      {tab !== "calendar" && (
        <>
          <Filters>
            {(tab === "history" ? HISTORY_FILTERS : SAVED_FILTERS).map((name) => {
              const active = (tab === "history" ? historyFilter : savedFilter) === name;
              return (
                <Filter
                  key={name}
                  type="button"
                  $active={active}
                  $color={tab === "saved" ? FILTER_COLORS[name] : undefined}
                  onClick={() => (tab === "history" ? setHistoryFilter(name) : setSavedFilter(name))}
                >
                  {name}
                </Filter>
              );
            })}
          </Filters>
          <List>
            {(tab === "history" ? visibleHistory : visibleSaved).map((item) => (
              <HistoryCard key={item.id} type="button" onClick={() => openDetail(item.id)}>
                <Badge $background={BADGE[item.status].background} $color={BADGE[item.status].color}>
                  {item.status}
                </Badge>
                <CardTitle>{item.title}</CardTitle>
                <Shelter>{item.shelter}</Shelter>
                <Time>
                  <Clock src={clockIcon} alt="" />
                  {item.schedule}
                </Time>
                <Favorite
                  type="button"
                  aria-label={item.favorite ? "저장 해제" : "저장"}
                  onClick={(event) => {
                    event.stopPropagation();
                    refresh(item.id);
                  }}
                >
                  <Paw src={tab === "saved" || item.favorite ? pawFilledIcon : pawIcon} alt="" />
                </Favorite>
              </HistoryCard>
            ))}
            {(tab === "history" ? visibleHistory : visibleSaved).length === 0 && <Empty>표시할 활동이 없어요.</Empty>}
          </List>
        </>
      )}
    </Screen>
  );
}

function CalendarCard({ item, onOpen, onFavorite }) {
  return (
    <CalendarRow>
      <PhotoBox>
        <PhotoPaw src={photoPawIcon} alt="" />
        <PhotoLabel>임시보호 사진</PhotoLabel>
      </PhotoBox>
      <CalendarBody type="button" onClick={onOpen}>
        <Badge $background={BADGE[item.status].background} $color={BADGE[item.status].color}>
          {item.status}
        </Badge>
        <CardTitle>{item.title}</CardTitle>
        <Shelter>{item.shelter}</Shelter>
        <Time>
          <Clock src={clockIcon} alt="" />
          {item.schedule}
        </Time>
      </CalendarBody>
      <Favorite
        type="button"
        aria-label={item.favorite ? "저장 해제" : "저장"}
        onClick={onFavorite}
      >
        <Paw src={item.favorite ? pawFilledIcon : pawIcon} alt="" />
      </Favorite>
    </CalendarRow>
  );
}

function keyOf(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function dateLabel(date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`;
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function weekOf(date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
}

function monthWeeks(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  return Array.from({ length: 6 }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + week * 7 + day)),
  );
}

function groupByDate(list) {
  const groups = [];
  list.forEach((item) => {
    const last = groups[groups.length - 1];
    if (last && last.key === item.activityDate) last.items.push(item);
    else groups.push({ key: item.activityDate, items: [item] });
  });
  return groups;
}

const Screen = styled.div`
  min-height: 100%;
  padding-top: 20px;
  padding-bottom: 24px;
  background-color: #ffffff;
`;

const TabBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 48px;
  border-bottom: 1px solid #ececec;
`;

const Tab = styled.button`
  position: relative;
  width: 84px;
  height: 46px;
  border: 0;
  background: transparent;
  color: ${(props) => (props.$active ? "#e88b7a" : "#d9d9d9")};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;

  /* 선택된 탭 아래의 짧은 분홍 가로선입니다. */
  &::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 2px;
    background-color: ${(props) => (props.$active ? "#e88b7a" : "transparent")};
  }
`;

const MonthBar = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
  margin-top: 14px;
  padding: 0 12px;
`;

const MonthTitle = styled.p`
  margin: 0;
  color: #222222;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
`;

const ArrowButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 32px;
  border: 0;
  background: transparent;
  cursor: pointer;
`;

/* 왼쪽 또는 오른쪽을 가리키는 꺾쇠입니다. */
const Arrow = styled.span`
  width: 8px;
  height: 8px;
  border-bottom: 2px solid #222222;
  border-left: 2px solid #222222;
  transform: rotate(${(props) => (props.$dir === "left" ? "45deg" : "-135deg")});
`;

const WeekNames = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-top: 12px;
  padding: 0 8px;
`;

const WeekName = styled.span`
  color: #8d8d8d;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
`;

const WeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0 8px;
`;

const DayButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  height: 48px;
  border: 0;
  background: transparent;
  cursor: pointer;
`;

/* 고른 날은 갈색 동그라미, 이번 달이 아닌 날은 옅은 숫자입니다. */
const DayNumber = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${(props) => (props.$selected ? "#b07557" : "transparent")};
  color: ${(props) => {
    if (props.$selected) return "#ffffff";
    if (props.$muted) return "#c8c8c8";
    return "#222222";
  }};
  font-size: 15px;
  font-weight: 600;
`;

const Dots = styled.span`
  display: flex;
  gap: 3px;
  height: 5px;
`;

const Dot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #76914f;
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  margin-top: 4px;
  border: 0;
  background: transparent;
  color: #b07557;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const ExpandChevron = styled.span`
  width: 6px;
  height: 6px;
  margin-bottom: ${(props) => (props.$open ? "0" : "3px")};
  border-right: 1.5px solid #b07557;
  border-bottom: 1.5px solid #b07557;
  transform: rotate(${(props) => (props.$open ? "-135deg" : "45deg")});
`;

const DayHeading = styled.p`
  margin: 18px 20px 10px;
  color: #382f2f;
  font-size: 16px;
  font-weight: 700;
`;

const CalendarRow = styled.div`
  display: grid;
  grid-template-columns: 118px 1fr auto;
  gap: 12px;
  align-items: start;
  padding: 0 20px 8px;
`;

/* 연두색 둥근 사각형 사진 자리입니다. */
const PhotoBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 118px;
  height: 93px;
  border-radius: 8px;
  background-color: #bdd9c4;
`;

const PhotoPaw = styled.img`
  width: 27px;
  height: 26px;
`;

const PhotoLabel = styled.span`
  color: #1f1e1c;
  font-size: 12px;
  font-weight: 600;
`;

const CalendarBody = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
`;

const Divider = styled.div`
  height: 1px;
  margin: 16px 21px 4px;
  background-color: #d9d9d9;
`;

const SectionTitle = styled.h2`
  margin: 16px 20px 0;
  color: #382f2f;
  font-size: 16px;
  font-weight: 700;
`;

const Filters = styled.div`
  display: flex;
  gap: 6px;
  padding: 16px 19px 4px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

/* 가로로 긴 알약 모양 필터입니다. 저장 탭에서 고른 필터는 지도와 같은 색으로 채워집니다. */
const Filter = styled.button`
  flex-shrink: 0;
  height: 28px;
  padding: 0 13px;
  border: 1px solid
    ${(props) => {
      if (props.$active && props.$color) return props.$color;
      if (props.$active) return "#382f2f";
      return "#e2ded8";
    }};
  border-radius: 18px;
  background-color: ${(props) => {
    if (props.$active && props.$color) return props.$color;
    if (props.$active) return "#382f2f";
    return "#ffffff";
  }};
  color: ${(props) => (props.$active ? "#ffffff" : "#382f2f")};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 12px 19px 8px;
`;

/* 얇은 베이지 테두리와 옅은 그림자가 있는 둥근 사각형 카드입니다. */
const HistoryCard = styled.button`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  min-height: 127px;
  padding: 14px 44px 14px 16px;
  border: 1px solid #efe8dc;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(47, 56, 51, 0.04);
  text-align: left;
  cursor: pointer;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 17px;
  background-color: ${(props) => props.$background};
  color: ${(props) => props.$color};
  font-size: 12px;
  font-weight: 700;
`;

const CardTitle = styled.span`
  margin-top: 8px;
  color: #382f2f;
  font-size: 17px;
  font-weight: 700;
`;

const Shelter = styled.span`
  margin-top: 4px;
  color: #605b5b;
  font-size: 13px;
  font-weight: 500;
`;

const Time = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
  color: #211d1d;
  font-size: 13px;
  font-weight: 500;
`;

const Clock = styled.img`
  width: 13px;
  height: 13px;
`;

const Favorite = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  margin-top: 2px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;

  ${HistoryCard} & {
    position: absolute;
    top: 12px;
    right: 12px;
    margin-top: 0;
  }
`;

const Paw = styled.img`
  width: 20px;
  height: 20px;
`;

const Empty = styled.p`
  margin: 28px 0;
  color: #908b8a;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
`;
