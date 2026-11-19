import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import searchIcon from "../../assets/icons/search/search.svg";
import recommendIcon from "../../assets/icons/search/recommend.svg";
import chevronIcon from "../../assets/icons/search/chevron.svg";
import clearIcon from "../../assets/icons/search/clear.svg";
import photoPawIcon from "../../assets/icons/search/photo-paw.svg";
import clockIcon from "../../assets/icons/search/clock.svg";
import { getPostings } from "../../api/postings.js";
import { getSavedSearches } from "../../api/search.js";
import { setSavedFavorite } from "../../api/activities.js";
import pawIcon from "../../assets/icons/map/paw-alt.svg";
import pawFilledIcon from "../../assets/icons/map/paw-filled.svg";
import { FILTERS, FILTER_COLORS } from "../../dummyData/map/mapDummy.js";

/* Enter로 검색한 단어만 기억합니다. 화면을 나갔다 들어와도 유지됩니다. */
let searchedTerms = [];

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/* 화면 필터를 모집공고 검색의 postingType으로 바꿉니다. */
const TYPE_QUERY = {
  봉사: "VOLUNTEER",
  후원: "SPONSOR",
  임시보호: "FOSTER",
};

const TYPE_LABEL = {
  VOLUNTEER: "봉사",
  SPONSOR: "후원",
  DONATION: "후원",
  FOSTER: "임시보호",
  봉사: "봉사",
  후원: "후원",
  임시보호: "임시보호",
};

const DAY_LABEL = { MON: "월", TUE: "화", WED: "수", THU: "목", FRI: "금", SAT: "토", SUN: "일" };
const TIME_LABEL = { MORNING: "오전", AFTERNOON: "오후", EVENING: "저녁", ALL_DAY: "종일" };
const CATEGORY_LABEL = {
  WALK: "산책",
  CLEANING: "청소",
  GROOMING: "미용",
  PHOTO: "사진",
  FEEDING_CARE: "돌봄",
  ETC: "기타",
};

/* 저장 조건을 목록에 보일 한 줄로 바꿉니다. */
function savedSearchSummary(item) {
  const region = [item.region?.sido, item.region?.sigungu].filter(Boolean).join(" ");
  const days = (item.availableDays ?? []).map((day) => DAY_LABEL[day] ?? day).join("·");
  const times = (item.availableTimeSlots ?? []).map((slot) => TIME_LABEL[slot] ?? slot).join("·");
  const categories = (item.activityCategories ?? []).map((category) => CATEGORY_LABEL[category] ?? category).join("·");
  const distance = item.maxDistanceKm ? `${item.maxDistanceKm}km` : "";
  return [region, distance, [days, times].filter(Boolean).join(" "), categories].filter(Boolean).join(" · ");
}

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("전체");
  const [recent, setRecent] = useState(searchedTerms);
  const [savedSearches, setSavedSearches] = useState(null);
  const [activeSaved, setActiveSaved] = useState(null);
  const [savedResults, setSavedResults] = useState(null);
  const [apiResults, setApiResults] = useState(null);

  /* 저장한 활동 검색 조건을 가져옵니다. 없으면 이 칸은 보여 주지 않습니다. */
  useEffect(() => {
    let ignore = false;
    getSavedSearches()
      .then((result) => {
        if (ignore) return;
        setSavedSearches(result?.isSuccess ? result.data?.savedSearches ?? [] : []);
      })
      .catch(() => {
        if (!ignore) setSavedSearches([]);
      });
    return () => {
      ignore = true;
    };
  }, []);

  /* 저장 조건을 고르면 그 지역·거리·활동으로 모집공고를 가져옵니다. */
  useEffect(() => {
    if (!activeSaved) return undefined;
    let ignore = false;
    setSavedResults(null);
    const region = activeSaved.region ?? {};
    getPostings({
      sido: region.sido,
      sigungu: region.sigungu,
      latitude: region.latitude,
      longitude: region.longitude,
      maxDistanceKm: activeSaved.maxDistanceKm || undefined,
      activityCategories: activeSaved.activityCategories,
      postingType: TYPE_QUERY[filter],
      page: 0,
      size: 20,
    })
      .then((result) => {
        if (ignore) return;
        const items = result?.isSuccess ? result.data?.items ?? [] : [];
        setSavedResults(items.map(toSearchResult));
      })
      .catch(() => {
        if (!ignore) setSavedResults([]);
      });
    return () => {
      ignore = true;
    };
  }, [activeSaved, filter]);

  /* 검색어가 있으면 모집공고 검색 결과만 보여 줍니다. */
  useEffect(() => {
    const keyword = query.trim();
    if (!keyword) return undefined;
    let ignore = false;
    setApiResults(null);
    getPostings({
      keyword,
      postingType: TYPE_QUERY[filter],
      page: 0,
      size: 20,
    })
      .then((result) => {
        if (ignore) return;
        const items = result?.isSuccess ? result.data?.items ?? [] : [];
        setApiResults(items.map(toSearchResult));
      })
      .catch(() => {
        if (!ignore) setApiResults([]);
      });
    return () => {
      ignore = true;
    };
  }, [query, filter]);

  function remember(text) {
    const value = text.trim();
    if (!value) return;
    setRecent((current) => {
      const next = [value, ...current.filter((item) => item !== value)];
      searchedTerms = next;
      return next;
    });
  }

  const keyword = query.trim();
  const showingSaved = Boolean(activeSaved) && !keyword;
  const waiting = (Boolean(keyword) && apiResults === null) || (showingSaved && savedResults === null);
  const results = (showingSaved ? savedResults ?? [] : apiResults ?? []).filter(
    (item) => filter !== "즐겨찾기" || item.bookmarked,
  );

  /* 발바닥은 이 공고만 저장하거나 해제합니다. */
  async function toggleResultBookmark(item) {
    const saved = Boolean(item.bookmarked);
    try {
      await setSavedFavorite({
        postingIds: [item.id].filter((id) => id != null),
        saved,
      });
      const mark = (list) => list?.map((row) => (
        row.id === item.id ? { ...row, bookmarked: !saved } : row
      )) ?? list;
      setApiResults(mark);
      setSavedResults(mark);
    } catch {
      /* 저장에 실패하면 표시는 그대로 둡니다. */
    }
  }

  function openResult(item) {
    const type = String(item.postingType ?? item.category ?? "");
    if (type === "후원" || type.toUpperCase().includes("SPONSOR") || type.toUpperCase().includes("DONATION")) {
      navigate(`/donations/${item.id}`);
      return;
    }
    if (type === "임시보호" || type.toUpperCase().includes("FOSTER")) {
      navigate(`/fosters/${item.id}`);
      return;
    }
    navigate(`/shelters/volunteer/${item.id}`);
  }

  function searchFor(text) {
    setActiveSaved(null);
    setSavedResults(null);
    setQuery(text);
    setFilter("전체");
  }

  function openSaved(item) {
    const hasFilters = Boolean(item.region?.sido) || Boolean(item.activityCategories?.length) || Boolean(item.maxDistanceKm);
    if (!hasFilters && item.name) {
      searchFor(item.name);
      return;
    }
    setQuery("");
    setApiResults(null);
    setFilter("전체");
    setActiveSaved(item);
  }

  return (
    <Screen>
      <Header>
        <BackButton type="button" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
          ←
        </BackButton>
        <Title>{showingSaved ? activeSaved.name || "검색 결과" : keyword ? "검색 결과" : "통합 검색"}</Title>
      </Header>

      <Body>
        {/* 검색어가 없을 때는 검은 테두리, 입력되면 회색 테두리와 지우기 버튼이 보입니다. */}
        <SearchBox $filled={Boolean(keyword)}>
          <SearchIcon src={searchIcon} alt="" />
          <SearchInput
            value={query}
            placeholder="지역, 보호시설, 봉사 활동 검색"
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveSaved(null);
              setSavedResults(null);
              setApiResults(null);
              setFilter("전체");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") remember(query);
            }}
          />
          {keyword && (
            <ClearButton type="button" aria-label="검색어 지우기" onClick={() => {
              setQuery("");
              setActiveSaved(null);
              setSavedResults(null);
              setApiResults(null);
            }}>
              <ClearIcon src={clearIcon} alt="" />
            </ClearButton>
          )}
        </SearchBox>

        {!keyword && !activeSaved ? (
          <>
            {recent.length > 0 && (
              <>
                <SectionHead>
                  <SectionTitle>최근 검색어</SectionTitle>
                  <ClearAll
                    type="button"
                    onClick={() => {
                      searchedTerms = [];
                      setRecent([]);
                    }}
                  >
                    전체 삭제
                  </ClearAll>
                </SectionHead>
                <Chips>
                  {recent.map((text) => (
                    <RecentChip key={text} type="button" onClick={() => searchFor(text)}>
                      {text}
                    </RecentChip>
                  ))}
                </Chips>
                <Divider />
              </>
            )}

            {savedSearches?.length > 0 && (
              <>
                <SectionTitle>저장한 검색 조건</SectionTitle>
                <RecommendList>
                  {savedSearches.map((item) => (
                    <RecommendItem key={item.savedSearchId} type="button" onClick={() => openSaved(item)}>
                      <RecommendIcon src={recommendIcon} alt="" />
                      <RecommendText>
                        <SavedName>{item.name || "저장한 조건"}</SavedName>
                        <SavedSummary>{savedSearchSummary(item)}</SavedSummary>
                      </RecommendText>
                      <Chevron src={chevronIcon} alt="" />
                    </RecommendItem>
                  ))}
                </RecommendList>
              </>
            )}
          </>
        ) : (
          <>
            {/* 검색어를 입력하면 지도와 같은 필터가 나타납니다. */}
            <Filters>
              {FILTERS.map((name) => (
                <FilterChip
                  key={name}
                  type="button"
                  $active={filter === name}
                  $color={FILTER_COLORS[name]}
                  onClick={() => {
                    setApiResults(null);
                    setFilter(name);
                  }}
                >
                  {name}
                </FilterChip>
              ))}
            </Filters>

            <ResultCount>검색 결과 {waiting ? "" : `${results.length}건`}</ResultCount>

            {waiting ? null : results.length > 0 ? (
              <ResultList>
                {results.map((item) => (
                  <ResultCard key={item.id} onClick={() => openResult(item)}>
                    <Photo>
                      {item.photo ? (
                        <PhotoImage src={item.photo} alt="" />
                      ) : (
                        <>
                          <PhotoPaw src={photoPawIcon} alt="" />
                          <PhotoLabel>시설 사진</PhotoLabel>
                        </>
                      )}
                    </Photo>
                    <ResultBody>
                      <Badge>{item.badge}</Badge>
                      <ResultTitle>{item.title}</ResultTitle>
                      <Meta>
                        {item.shelter} · {item.region}
                      </Meta>
                      {item.time && (
                        <Time>
                          <Clock src={clockIcon} alt="" />
                          {item.time}
                        </Time>
                      )}
                    </ResultBody>
                    <SaveButton
                      type="button"
                      aria-pressed={item.bookmarked}
                      aria-label={item.bookmarked ? "즐겨찾기 해제" : "즐겨찾기"}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleResultBookmark(item);
                      }}
                    >
                      <img src={item.bookmarked ? pawFilledIcon : pawIcon} alt="" />
                    </SaveButton>
                  </ResultCard>
                ))}
              </ResultList>
            ) : (
              <Empty>
                <EmptyTitle>검색 결과가 없어요.</EmptyTitle>
                <EmptyText>
                  다른 검색어를 입력하거나
                  <br />
                  필터 조건을 변경해 보세요.
                </EmptyText>
              </Empty>
            )}
          </>
        )}
      </Body>
    </Screen>
  );
}

function toSearchResult(item) {
  const shelter = item.shelter ?? {};
  const type = TYPE_LABEL[item.postingType] ?? item.postingType ?? "";
  const beginnerFriendly = item.beginnerFriendly ?? shelter.beginnerFriendly;
  const start = item.activityStartAt ?? shelter.activityStartAt;
  return {
    id: item.postingId,
    shelterId: item.shelterId ?? shelter.shelterId,
    postingType: item.postingType,
    category: type,
    badge: beginnerFriendly ? "초보 가능" : type,
    title: item.title ?? "",
    shelter: shelter.name ?? "",
    region: shelter.region?.sigungu ?? shelter.region?.sido ?? "",
    time: formatStart(start),
    bookmarked: Boolean(item.bookmarked ?? shelter.bookmarked),
    photo: item.thumbnailUrl || shelter.thumbnailUrl || "",
  };
}

function formatStart(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getMonth() + 1}/${date.getDate()}(${WEEKDAYS[date.getDay()]}) ${hours}:${minutes}`;
}

const Screen = styled.div`
  min-height: 100dvh;
  background-color: #ffffff;
  color: #424242;
`;

const Header = styled.header`
  position: relative;
  display: flex;
  align-items: center;
  height: 80px;
  padding: 40px 20px 0;
  border-bottom: 1px solid #ececec;
`;

const BackButton = styled.button`
  border: 0;
  background: transparent;
  color: #424242;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
`;

const Title = styled.h1`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  margin: 0;
  font-size: 20px;
  font-weight: 600;
`;

const Body = styled.div`
  padding: 24px 20px 40px;
`;

const SearchBox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 47px;
  padding: 0 12px 0 14px;
  border: 1px solid ${({ $filled }) => ($filled ? "#c6c6c6" : "#000000")};
  border-radius: 10px;
  background-color: #ffffff;
`;

const SearchIcon = styled.img`
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: #424242;
  font-size: 15px;
  font-weight: 500;

  &::placeholder {
    color: #848484;
  }
`;

const ClearButton = styled.button`
  display: flex;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
`;

const ClearIcon = styled.img`
  flex-shrink: 0;
`;

const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 22px;
`;

const SectionTitle = styled.h2`
  margin: 22px 0 0;
  color: #4f7a5f;
  font-size: 15px;
  font-weight: 600;

  ${SectionHead} & {
    margin: 0;
  }
`;

const ClearAll = styled.button`
  border: 0;
  background: transparent;
  color: #aaaaaa;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 30px;
  margin-top: 12px;
`;

const RecentChip = styled.button`
  height: 30px;
  padding: 0 14px;
  border: 0;
  border-radius: 24px;
  background-color: #f7f2ea;
  color: #646464;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const Divider = styled.div`
  height: 1px;
  margin: 18px 0 0;
  background-color: #ececec;
`;

const RecommendList = styled.div`
  margin-top: 16px;
`;

const RecommendItem = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 0;
  border: 0;
  border-bottom: 1px solid #ececec;
  background: transparent;
  cursor: pointer;
`;

const RecommendIcon = styled.img`
  flex-shrink: 0;
`;

const RecommendText = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  text-align: left;
`;

const SavedName = styled.span`
  color: #5a5a5a;
  font-size: 15px;
  font-weight: 500;
`;

const SavedSummary = styled.span`
  color: #8a8a8a;
  font-size: 12px;
  font-weight: 500;
`;

const Chevron = styled.img`
  flex-shrink: 0;
  transform: rotate(-90deg);
`;

const Filters = styled.div`
  display: flex;
  gap: 9px;
  margin-top: 16px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const FilterChip = styled.button`
  flex-shrink: 0;
  height: 34px;
  padding: 0 14px;
  border: 1px solid ${({ $active, $color }) => ($active && $color ? $color : "#c6c6c6")};
  border-radius: 18px;
  background-color: ${({ $active, $color }) => ($active && $color ? $color : "#ffffff")};
  color: ${({ $active, $color }) => ($active && $color ? "#ffffff" : "#515151")};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`;

const ResultCount = styled.p`
  margin: 18px 0 0;
  color: #292929;
  font-size: 15px;
  font-weight: 600;
`;

const ResultList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 13px;
  margin-top: 14px;
`;

/* 카드 전체를 누르면 공고 상세로 이동합니다. */
const ResultCard = styled.article`
  display: flex;
  gap: 14px;
  width: 100%;
  min-height: 129px;
  padding: 9px;
  border: 1px solid #efe8dc;
  border-radius: 18px;
  background-color: #ffffff;
  text-align: left;
  cursor: pointer;
`;

const Photo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 116px;
  overflow: hidden;
  border-radius: 11px;
  background-color: #d9d9d9;
`;

const PhotoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const PhotoPaw = styled.img`
  flex-shrink: 0;
`;

const PhotoLabel = styled.span`
  margin-top: 4px;
  color: #2f3833;
  font-size: 11px;
`;

const SaveButton = styled.button`
  flex-shrink: 0;
  align-self: flex-start;
  width: 28px;
  height: 28px;
  margin-top: 6px;
  border: 0;
  background: transparent;
  cursor: pointer;
`;

const ResultBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  padding-top: 5px;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 8px;
  background-color: #d4ebda;
  color: #258314;
  font-size: 12px;
  font-weight: 600;
`;

const ResultTitle = styled.h3`
  margin: 8px 0 0;
  color: #382f2f;
  font-size: 17px;
  font-weight: 700;
`;

const Meta = styled.p`
  margin: 4px 0 0;
  color: #605b5b;
  font-size: 13px;
  font-weight: 500;
`;

const Time = styled.p`
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 8px 0 0;
  color: #211d1d;
  font-size: 13px;
  font-weight: 500;
`;

const Clock = styled.img`
  flex-shrink: 0;
`;

const Empty = styled.div`
  margin-top: 120px;
  text-align: center;
`;

const EmptyTitle = styled.p`
  margin: 0;
  color: #000000;
  font-size: 24px;
  font-weight: 600;
`;

const EmptyText = styled.p`
  margin: 16px 0 0;
  color: #6e6e6e;
  font-size: 17px;
  font-weight: 400;
  line-height: 21px;
`;
