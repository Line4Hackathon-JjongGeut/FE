
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import photoPawIcon from "../../assets/icons/activities/photo-paw.svg";
import clockIcon from "../../assets/icons/activities/clock.svg";
import pawIcon from "../../assets/icons/activities/paw.svg";
import pawFilledIcon from "../../assets/icons/activities/paw-filled.svg";

import { getMyApplications } from "../../api/volunteer.js";
import { getActivityCalendar } from "../../api/search.js";
import { getBookmarkedPostings, getParticipationHistory, setSavedFavorite } from "../../api/activities.js";
import { getPostingDetail } from "../../api/postings.js";
import { formatFosterPeriodLabel, listFosterPeriods } from "../../utils/fosterPeriods.js";

const TABS = [
  { id: "calendar", label: "캘린더" },
  { id: "history", label: "활동 내역" },
  { id: "saved", label: "저장" },
];

const HISTORY_FILTERS = ["전체", "승인 대기", "참여 예정", "참여 완료"];
const SAVED_FILTERS = ["전체", "봉사", "후원", "임시보호"];
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const FILTER_COLORS = {
  전체: "#382f2f",
  봉사: "#3e7556",
  후원: "#c47b3b",
  임시보호: "#f2a60c",
};
const POSTING_CATEGORY = {
  VOLUNTEER: "봉사",
  SPONSOR: "후원",
  DONATION: "후원",
  FOSTER: "임시보호",
};

const BADGE = {
  "승인 대기": { background: "#fcebc4", color: "#6e5110" },
  "참여 예정": { background: "#e3f0e6", color: "#2f5e43" },
  "참여 중": { background: "#dceaf8", color: "#24527a" },
  "접수 완료": { background: "#e3f0e6", color: "#2f5e43" },
  "참여 완료": { background: "#e9e9e9", color: "#50545a" },
  "신청 반려": { background: "#f9eae7", color: "#c8807a" },
  "모집 중": { background: "#e3f0e6", color: "#2f5e43" },
  "모집 마감": { background: "#e9e9e9", color: "#50545a" },
};

/* 화면의 상태 이름과 목록 조회에 보내는 status 값입니다. */
const STATUS_QUERY = {
  "승인 대기": "PENDING",
  "참여 예정": "CONFIRMED",
  "참여 완료": "COMPLETED",
};

/* 응답의 status를 화면 배지 문구로 바꿉니다. */
const STATUS_LABEL = {
  PENDING: "승인 대기",
  APPROVED: "참여 예정",
  CONFIRMED: "참여 예정",
  COMPLETED: "참여 완료",
  REJECTED: "신청 반려",
  CANCELED: "신청 취소",
  CANCELLED: "신청 취소",
  NO_SHOW: "불참",
};

/* 하단 메뉴의 활동을 누르면 캘린더, 활동 내역, 저장을 오갑니다. */
export default function Activities() {
  const navigate = useNavigate();
  const location = useLocation();
  const openedTab = location.state?.tab;

  const [tab, setTab] = useState(
    openedTab === "history" || openedTab === "saved" || openedTab === "calendar"
      ? openedTab
      : "calendar",
  );

  // ⭐ 내 코드 추가: 마이페이지에서 넘어오면 전달받은 필터로 시작
  const [historyFilter, setHistoryFilter] = useState(
    HISTORY_FILTERS.includes(location.state?.filter)
      ? location.state.filter
      : "전체",
  );

  const [savedFilter, setSavedFilter] = useState("전체");
  const [cursor, setCursor] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedKey, setSelectedKey] = useState(() => keyOf(new Date()));
  const [monthOpen, setMonthOpen] = useState(false);
  const [calendarItems, setCalendarItems] = useState(null);
  const [historyItems, setHistoryItems] = useState(null);
  const [savedItems, setSavedItems] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useState(null);
  const [bookmarkTick, setBookmarkTick] = useState(0);
  const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;

  /* 참여 완료는 과거 참여 이력을, 그 외 활동 내역은 신청 목록을 보여 줍니다. */
  useEffect(() => {
    if (tab !== "history") return undefined;
    let ignore = false;
    setHistoryItems(null);

    const completed = historyFilter === "참여 완료";
    const status =
      historyFilter === "전체" || completed
        ? undefined
        : STATUS_QUERY[historyFilter];
    const request = completed
      ? getParticipationHistory({ status: "COMPLETED", page: 0, size: 50 })
      : getMyApplications({ status, page: 0, size: 50 });

    request
      .then((result) => {
        if (ignore) return;
        const items = result?.isSuccess ? result.data?.items ?? [] : [];
        const cards = items.map(completed ? toParticipationCard : toApplicationCard);
        setHistoryItems([...fosterHistoryCards(historyFilter), ...cards]);
      })
      .catch(() => {
        if (!ignore) setHistoryItems(fosterHistoryCards(historyFilter));
      });

    return () => {
      ignore = true;
    };
  }, [tab, historyFilter]);

  /* 캘린더 API는 확정·완료만 줍니다. 승인 대기처럼 아직 확정 전인 신청은 신청 목록에서 같은 달만 더합니다. */
  useEffect(() => {
    if (tab !== "calendar") return undefined;
    let ignore = false;
    setCalendarItems(null);

    Promise.all([
      getActivityCalendar(monthKey).catch(() => null),
      getMyApplications({ page: 0, size: 50 }).catch(() => null),
    ]).then(async ([calendarResult, applicationResult]) => {
      if (ignore) return;

      const byId = new Map();
      const applications = applicationResult?.isSuccess ? applicationResult.data?.items ?? [] : [];
      applications.forEach((item) => {
        const card = toApplicationCard(item);
        if (!card.activityDate.startsWith(monthKey) || !showsOnCalendar(card.status)) return;
        byId.set(String(card.id), card);
      });

      const scheduled = calendarResult?.isSuccess ? calendarResult.data?.items ?? [] : [];
      scheduled.forEach((item) => {
        const card = toCalendarCard(item);
        if (!card.activityDate.startsWith(monthKey)) return;
        if (!byId.has(String(card.id))) byId.set(String(card.id), card);
      });

      /* 임시보호 신청에서 고른 기간은 그 달이 기간 안에 있으면 같은 달 캘린더에 올립니다. */
      listFosterPeriods().forEach((item) => {
        if (!overlapsMonth(item.start, item.end, monthKey)) return;
        const card = toFosterCalendarCard(item);
        if (!byId.has(String(card.id))) byId.set(String(card.id), card);
      });

      const cards = [...byId.values()];
      const postingIds = [...new Set(cards.map((card) => card.postingId).filter((id) => id != null))];
      const photos = await Promise.all(
        postingIds.map(async (postingId) => {
          try {
            const detail = await getPostingDetail(postingId);
            const urls = detail?.isSuccess && Array.isArray(detail.data?.imageUrls) ? detail.data.imageUrls : [];
            return [String(postingId), urls.find(Boolean) || ""];
          } catch {
            return [String(postingId), ""];
          }
        }),
      );
      if (ignore) return;

      const photoByPosting = new Map(photos);
      setCalendarItems(
        cards.map((card) => ({
          ...card,
          photo: photoByPosting.get(String(card.postingId)) || "",
        })),
      );
    });

    return () => {
      ignore = true;
    };
  }, [tab, monthKey]);

  /* 저장 탭은 저장한 공고만 보여 줍니다. */
  useEffect(() => {
    let ignore = false;

    getBookmarkedPostings({ page: 0, size: 50 })
      .then((postingResult) => {
        if (ignore) return;
        const postings = postingResult?.isSuccess ? postingResult.data?.items ?? [] : [];
        const postingCards = postings.map(toSavedCard);
        setSavedItems(postingCards);
        setBookmarkedIds(new Set(postingCards.map((item) => String(item.postingId))));
      })
      .catch(() => {
        if (!ignore) {
          setSavedItems([]);
          setBookmarkedIds(new Set());
        }
      });

    return () => {
      ignore = true;
    };
  }, [bookmarkTick]);

  function openDetail(id) {
    navigate(`/activities/${id}`, {
      state: { from: tab === "saved" ? "saved" : "history" },
    });
  }

  function openPosting(item) {
    const id = item.postingId ?? item.id;
    if (item.category === "후원") {
      navigate(`/donations/${id}`);
      return;
    }
    if (item.category === "임시보호") {
      navigate(`/fosters/${id}`);
      return;
    }
    navigate(`/shelters/volunteer/${id}`);
  }

  async function toggleBookmark(item) {
    const postingId = item?.postingId;
    const saved = bookmarkedIds?.has(String(postingId));

    try {
      await setSavedFavorite({
        postingIds: postingId != null ? [postingId] : [],
        saved: Boolean(saved),
      });
      setBookmarkTick((tick) => tick + 1);
    } catch {
      /* 저장에 실패하면 목록은 그대로 둡니다. */
    }
  }

  const visibleHistory = historyItems ?? [];

  const visibleSaved = (savedItems ?? []).filter((item) => {
    if (savedFilter === "전체") return true;
    return item.category === savedFilter;
  });

  const scheduleItems = calendarItems ?? [];

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const selected = parseKey(selectedKey);

  const selectedItems = scheduleItems.filter((item) => coversDate(item, selectedKey));

  const upcoming = scheduleItems
    .filter((item) => item.activityDate > selectedKey)
    .sort((a, b) => a.activityDate.localeCompare(b.activityDate));

  function shiftMonth(amount) {
    const next = new Date(year, month + amount, 1);
    setCursor(next);

    const day = Math.min(
      selected.getDate(),
      daysInMonth(next.getFullYear(), next.getMonth()),
    );

    setSelectedKey(
      keyOf(new Date(next.getFullYear(), next.getMonth(), day)),
    );
  }

  return (
    <Screen>
      <TabBar>
        {TABS.map((item) => (
          <Tab
            key={item.id}
            type="button"
            $active={tab === item.id}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </Tab>
        ))}
      </TabBar>

      {tab === "calendar" && (
        <>
          <MonthBar>
            <ArrowButton
              type="button"
              aria-label="이전 달"
              onClick={() => shiftMonth(-1)}
            >
              <Arrow $dir="left" />
            </ArrowButton>

            <MonthTitle>
              {year}년 {month + 1}월
            </MonthTitle>

            <ArrowButton
              type="button"
              aria-label="다음 달"
              onClick={() => shiftMonth(1)}
            >
              <Arrow $dir="right" />
            </ArrowButton>
          </MonthBar>

          <WeekNames>
            {WEEKDAYS.map((name) => (
              <WeekName key={name}>{name}</WeekName>
            ))}
          </WeekNames>

          {(monthOpen
            ? monthWeeks(year, month)
            : [weekOf(selected)]
          ).map((week) => (
            <WeekRow key={keyOf(week[0])}>
              {week.map((date) => {
                const key = keyOf(date);
                const inMonth = date.getMonth() === month;
                const marked = scheduleItems.some((item) => coversDate(item, key));

                return (
                  <DayButton
                    key={key}
                    type="button"
                    onClick={() => setSelectedKey(key)}
                  >
                    <DayNumber
                      $selected={key === selectedKey}
                      $muted={!inMonth}
                    >
                      {date.getDate()}
                    </DayNumber>

                    {/* 일정이 있는 날 아래의 작은 초록 점 두 개입니다. */}
                    <Dots>
                      {marked && inMonth ? (
                        <>
                          <Dot />
                          <Dot />
                        </>
                      ) : null}
                    </Dots>
                  </DayButton>
                );
              })}
            </WeekRow>
          ))}

          <ExpandButton
            type="button"
            onClick={() => setMonthOpen((open) => !open)}
          >
            월 전체 보기
            <ExpandChevron $open={monthOpen} />
          </ExpandButton>

          <DayHeading>{dateLabel(selected)}</DayHeading>

          {selectedItems.map((item) => (
            <CalendarCard
              key={item.id}
              item={{
                ...item,
                favorite: bookmarkedIds?.has(String(item.postingId)),
              }}
              onOpen={() => (item.kind === "foster" ? openPosting(item) : openDetail(item.id))}
              onFavorite={() => toggleBookmark(item)}
            />
          ))}

          {upcoming.length > 0 && (
            <>
              <Divider />
              <SectionTitle>다가오는 활동</SectionTitle>

              {groupByDate(upcoming).map((group) => (
                <div key={group.key}>
                  <DayHeading>
                    {dateLabel(parseKey(group.key))}
                  </DayHeading>

                  {group.items.map((item) => (
                    <CalendarCard
                      key={item.id}
                      item={{
                ...item,
                favorite: bookmarkedIds?.has(String(item.postingId)),
              }}
                      onOpen={() => (item.kind === "foster" ? openPosting(item) : openDetail(item.id))}
                      onFavorite={() => toggleBookmark(item)}
                    />
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
            {(tab === "history"
              ? HISTORY_FILTERS
              : SAVED_FILTERS
            ).map((name) => {
              const active =
                (tab === "history" ? historyFilter : savedFilter) === name;

              return (
                <Filter
                  key={name}
                  type="button"
                  $active={active}
                  $color={
                    tab === "saved"
                      ? FILTER_COLORS[name]
                      : undefined
                  }
                  onClick={() =>
                    tab === "history"
                      ? setHistoryFilter(name)
                      : setSavedFilter(name)
                  }
                >
                  {name}
                </Filter>
              );
            })}
          </Filters>

          <List>
            {(tab === "history" ? visibleHistory : visibleSaved).map((item) => {
              const favorite = tab === "saved"
                || bookmarkedIds?.has(String(item.postingId));
              return (
              <HistoryCard
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.kind === "shelter") {
                    navigate(`/shelters/${item.shelterId}`);
                    return;
                  }
                  if (item.kind === "foster") {
                    openPosting(item);
                    return;
                  }
                  if (tab === "history") openDetail(item.id);
                  else openPosting(item);
                }}
              >
                <Badge
                  $background={badgeStyle(item.status).background}
                  $color={badgeStyle(item.status).color}
                >
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
                  aria-label={favorite ? "저장 해제" : "저장"}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleBookmark(item);
                  }}
                >
                  <Paw src={favorite ? pawFilledIcon : pawIcon} alt="" />
                </Favorite>
              </HistoryCard>
              );
            })}

            {(tab === "history"
              ? historyItems !== null
              : savedItems !== null) &&
              (tab === "history" ? visibleHistory : visibleSaved).length === 0 && (
              <Empty>표시할 활동이 없어요.</Empty>
            )}
          </List>
        </>
      )}
    </Screen>
  );
}

function CalendarCard({ item, onOpen, onFavorite }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = Boolean(item.photo) && !photoFailed;

  return (
    <CalendarRow>
      <PhotoBox>
        {showPhoto ? (
          <PhotoImage src={item.photo} alt="" onError={() => setPhotoFailed(true)} />
        ) : (
          <>
            <PhotoPaw src={photoPawIcon} alt="" />
            <PhotoLabel>임시보호 사진</PhotoLabel>
          </>
        )}
      </PhotoBox>

      <CalendarBody type="button" onClick={onOpen}>
        <Badge
          $background={badgeStyle(item.status).background}
          $color={badgeStyle(item.status).color}
        >
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
        <Paw
          src={item.favorite ? pawFilledIcon : pawIcon}
          alt=""
        />
      </Favorite>
    </CalendarRow>
  );
}

/* 참여 이력 한 건을 활동 카드에 맞게 바꿉니다. 제목과 시설명이 신청 목록과 다른 칸에 있습니다. */
function toParticipationCard(item) {
  return {
    id: item.applicationId,
    status: STATUS_LABEL[item.status] ?? item.status,
    title: item.postingTitle ?? "",
    shelter: item.shelterName ?? "",
    shelterId: item.shelterId,
    schedule: formatActivityTime(item.activityStartAt),
    postingId: item.postingId,
    activityDate: dateKey(item.activityStartAt),
    category: "봉사",
  };
}

/* 목록 응답 한 건을 활동 카드에 맞게 바꿉니다. */
function toApplicationCard(item) {
  return {
    id: item.applicationId,
    status: STATUS_LABEL[item.status] ?? item.status,
    title: item.title,
    shelter: item.shelter?.name ?? "",
    shelterId: item.shelter?.shelterId,
    schedule: formatActivityTime(
      item.activityStartAt,
      item.activityEndAt,
    ),
    postingId: item.postingId,
    scheduleId: item.scheduleId,
    cancellable: item.cancellable,
    activityDate: dateKey(item.activityStartAt),
    category: "봉사",
  };
}

/* 임시보호 기간이 오늘보다 뒤면 참여 예정, 지났으면 참여 완료, 오늘을 포함하면 참여 중입니다. */
function fosterPeriodStatus(start, end) {
  const today = keyOf(new Date());
  if (end < today) return "참여 완료";
  if (start > today) return "참여 예정";
  return "참여 중";
}

function toFosterHistoryCard(item) {
  return {
    id: `foster-${item.id}`,
    postingId: item.postingId,
    status: fosterPeriodStatus(item.start, item.end),
    title: item.title ?? "",
    shelter: item.shelterName ?? "",
    shelterId: item.shelterId,
    schedule: formatFosterPeriodLabel(item.start, item.end),
    category: "임시보호",
    kind: "foster",
  };
}

function fosterHistoryCards(filter) {
  const cards = listFosterPeriods().map(toFosterHistoryCard);
  if (filter === "전체") return cards;
  return cards.filter((card) => card.status === filter);
}

/* 임시보호 신청 기간을 날짜 카드에 맞게 바꿉니다. 시작일부터 종료일까지 점을 찍습니다. */
function toFosterCalendarCard(item) {
  return {
    id: `foster-${item.id}`,
    postingId: item.postingId,
    status: "접수 완료",
    title: item.title ?? "",
    shelter: item.shelterName ?? "",
    shelterId: item.shelterId,
    schedule: formatFosterRange(item.start, item.end),
    activityDate: item.start,
    spanEnd: item.end,
    category: "임시보호",
    kind: "foster",
  };
}

/* 캘린더 응답 한 건을 날짜 카드에 맞게 바꿉니다. */
function toCalendarCard(item) {
  return {
    id: item.applicationId,
    postingId: item.postingId,
    status: STATUS_LABEL[item.status] ?? item.status,
    title: item.postingTitle ?? item.title ?? "",
    shelter: item.shelterName ?? item.shelter?.name ?? "",
    shelterId: item.shelterId,
    schedule: formatActivityTime(item.activityStartAt, item.activityEndAt),
    activityDate: dateKey(item.activityStartAt),
  };
}

/* 관심 공고 한 건을 저장 카드에 맞게 바꿉니다. */
function toSavedCard(item) {
  return {
    id: item.postingId,
    postingId: item.postingId,
    shelterId: item.shelterId,
    category: POSTING_CATEGORY[item.postingType] ?? item.postingType ?? "",
    status: savedStatus(item.status),
    title: item.title ?? "",
    shelter: item.shelterName ?? "",
    schedule: formatActivityTime(item.activityStartAt, item.activityEndAt),
  };
}

function showsOnCalendar(status) {
  return status !== "신청 취소" && status !== "신청 반려" && status !== "불참";
}

/* 하루 일정은 그 날짜만, 임시보호 기간은 시작일부터 종료일까지 해당합니다. */
function coversDate(item, key) {
  if (item.spanEnd) return item.activityDate <= key && key <= item.spanEnd;
  return item.activityDate === key;
}

function overlapsMonth(start, end, monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const last = new Date(year, month, 0).getDate();
  const monthStart = `${monthKey}-01`;
  const monthEnd = `${monthKey}-${String(last).padStart(2, "0")}`;
  return start <= monthEnd && end >= monthStart;
}

function formatFosterRange(startKey, endKey) {
  const start = parseKey(startKey);
  const end = parseKey(endKey);
  const withYear = start.getFullYear() !== end.getFullYear();
  const dayText = (date) => {
    const year = withYear ? `${date.getFullYear()}/` : "";
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${date.getMonth() + 1}/${day}(${WEEKDAYS[date.getDay()]})`;
  };
  if (startKey === endKey) return dayText(start);
  return `${dayText(start)} ~ ${dayText(end)}`;
}

function savedStatus(status) {
  if (STATUS_LABEL[status]) return STATUS_LABEL[status];
  if (status === "OPEN") return "모집 중";
  if (status === "CLOSED") return "모집 마감";
  return status ?? "";
}

function dateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return keyOf(date);
}

function formatActivityTime(start, end) {
  const startDate = new Date(start);

  if (Number.isNaN(startDate.getTime())) return "";

  const hours = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes(),
    ).padStart(2, "0")}`;

  const head = `${startDate.getMonth() + 1}/${startDate.getDate()}(${
    WEEKDAYS[startDate.getDay()]
  }) ${hours(startDate)}`;

  const endDate = new Date(end);

  if (Number.isNaN(endDate.getTime())) return head;

  return `${head} ~ ${hours(endDate)}`;
}

function badgeStyle(status) {
  return BADGE[status] ?? {
    background: "#e9e9e9",
    color: "#50545a",
  };
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
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${
    WEEKDAYS[date.getDay()]
  }요일`;
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function weekOf(date) {
  const start = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - date.getDay(),
  );

  return Array.from(
    { length: 7 },
    (_, index) =>
      new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate() + index,
      ),
  );
}

function monthWeeks(year, month) {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());

  return Array.from({ length: 6 }, (_, week) =>
    Array.from(
      { length: 7 },
      (_, day) =>
        new Date(
          start.getFullYear(),
          start.getMonth(),
          start.getDate() + week * 7 + day,
        ),
    ),
  );
}

function groupByDate(list) {
  const groups = [];

  list.forEach((item) => {
    const last = groups[groups.length - 1];

    if (last && last.key === item.activityDate) {
      last.items.push(item);
    } else {
      groups.push({
        key: item.activityDate,
        items: [item],
      });
    }
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
    background-color: ${(props) =>
      props.$active ? "#e88b7a" : "transparent"};
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
  transform: rotate(${(props) =>
    props.$dir === "left" ? "45deg" : "-135deg"});
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
  background-color: ${(props) =>
    props.$selected ? "#b07557" : "transparent"};
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
  transform: rotate(${(props) =>
    props.$open ? "-135deg" : "45deg"});
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

/* 연두색 둥근 사각형 사진 자리입니다. 사진이 오면 그 칸을 채웁니다. */
const PhotoBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 118px;
  height: 93px;
  overflow: hidden;
  border-radius: 8px;
  background-color: #bdd9c4;
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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
