import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import searchIcon from "../../assets/icons/search/search.svg";
import recommendIcon from "../../assets/icons/search/recommend.svg";
import chevronIcon from "../../assets/icons/search/chevron.svg";
import clearIcon from "../../assets/icons/search/clear.svg";
import photoPawIcon from "../../assets/icons/search/photo-paw.svg";
import clockIcon from "../../assets/icons/search/clock.svg";
import { FILTERS, FILTER_COLORS } from "../../dummyData/map/mapDummy.js";
import { RECOMMENDED_SEARCHES, SEARCH_RESULTS } from "../../dummyData/search/searchDummy.js";

/* Enter로 검색한 단어만 기억합니다. 화면을 나갔다 들어와도 유지됩니다. */
let searchedTerms = [];

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("전체");
  const [recent, setRecent] = useState(searchedTerms);

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
  const results = SEARCH_RESULTS.filter((item) => {
    const text = [item.title, item.shelter, item.region, item.area, item.category, ...item.keywords]
      .join(" ")
      .toLowerCase();
    const matchesQuery = text.includes(keyword.toLowerCase());
    const matchesFilter = filter === "전체" || item.category === filter;
    return matchesQuery && matchesFilter;
  });

  function searchFor(text) {
    setQuery(text);
    setFilter("전체");
  }

  return (
    <Screen>
      <Header>
        <BackButton type="button" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
          ←
        </BackButton>
        <Title>{keyword ? "검색 결과" : "통합 검색"}</Title>
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
              setFilter("전체");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") remember(query);
            }}
          />
          {keyword && (
            <ClearButton type="button" aria-label="검색어 지우기" onClick={() => setQuery("")}>
              <ClearIcon src={clearIcon} alt="" />
            </ClearButton>
          )}
        </SearchBox>

        {!keyword ? (
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

            <SectionTitle>추천 검색어</SectionTitle>
            <RecommendList>
              {RECOMMENDED_SEARCHES.map((text) => (
                <RecommendItem key={text} type="button" onClick={() => searchFor(text)}>
                  <RecommendIcon src={recommendIcon} alt="" />
                  <RecommendText>{text}</RecommendText>
                  <Chevron src={chevronIcon} alt="" />
                </RecommendItem>
              ))}
            </RecommendList>
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
                  onClick={() => setFilter(name)}
                >
                  {name}
                </FilterChip>
              ))}
            </Filters>

            <ResultCount>검색 결과 {results.length}건</ResultCount>

            {results.length > 0 ? (
              <ResultList>
                {results.map((item) => (
                  <ResultCard key={item.id}>
                    <Photo>
                      <PhotoPaw src={photoPawIcon} alt="" />
                      <PhotoLabel>시설 사진</PhotoLabel>
                    </Photo>
                    <ResultBody>
                      <Badge>{item.badge}</Badge>
                      <ResultTitle>{item.title}</ResultTitle>
                      <Meta>
                        {item.shelter} · {item.region}
                      </Meta>
                      <Time>
                        <Clock src={clockIcon} alt="" />
                        {item.time}
                      </Time>
                    </ResultBody>
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
  flex: 1;
  color: #5a5a5a;
  font-size: 15px;
  font-weight: 500;
  text-align: left;
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

const ResultCard = styled.article`
  display: flex;
  gap: 14px;
  min-height: 129px;
  padding: 9px;
  border: 1px solid #efe8dc;
  border-radius: 18px;
  background-color: #ffffff;
`;

const Photo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 116px;
  border-radius: 11px;
  background-color: #d9d9d9;
`;

const PhotoPaw = styled.img`
  flex-shrink: 0;
`;

const PhotoLabel = styled.span`
  margin-top: 4px;
  color: #2f3833;
  font-size: 11px;
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
