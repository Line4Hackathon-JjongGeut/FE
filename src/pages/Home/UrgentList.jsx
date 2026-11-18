import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/auth/BackHeader.jsx";
import PageDots from "../../components/auth/PageDots.jsx";
import UrgentDetailCard from "../../components/home/UrgentDetailCard.jsx";
import { useMyPreferences } from "../../hooks/useMyPreferences.js";
import { useUrgentPosts } from "../../hooks/useUrgentPosts.js";
import { chunk } from "../../utils/chunk.js";
import { readPageIndex } from "../../utils/pageParam.js";

const CARDS_PER_PAGE = 4;

const FILTERS = [
  { id: "all", label: "전체" },
  { id: "staff", label: "인력 부족" },
  { id: "goods", label: "물품 부족" },
];

/* 긴급 모집 화면 */
export default function UrgentList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = searchParams.get("filter");
  const filter = FILTERS.some((item) => item.id === filterParam) ? filterParam : "all";
  const { status: preferenceStatus, preferences } = useMyPreferences();
  const urgent = useUrgentPosts({
    latitude: preferences.region?.latitude,
    longitude: preferences.region?.longitude,
    enabled: preferenceStatus !== "loading",
  });
  const posts = filter === "all" ? urgent.posts : urgent.posts.filter((post) => post.type === filter);
  const pages = chunk(posts, CARDS_PER_PAGE);
  const page = readPageIndex(searchParams, pages.length);

  function updateParams(nextFilter, nextPage) {
    const params = {};
    if (nextFilter !== "all") params.filter = nextFilter;
    if (nextPage > 0) params.page = String(nextPage + 1);
    setSearchParams(params, { replace: true });
  }

  function changeFilter(id) {
    updateParams(id, 0);
  }

  function changePage(index) {
    updateParams(filter, index);
    window.scrollTo({ top: 0 });
  }

  return (
    <Screen>
      <BackHeader title="긴급 모집" onBack={() => navigate(-1)} />

      <Body>
        <Filters role="radiogroup" aria-label="긴급 모집 종류">
          {FILTERS.map((item) => (
            <FilterChip
              key={item.id}
              type="button"
              role="radio"
              aria-checked={filter === item.id}
              $active={filter === item.id}
              onClick={() => changeFilter(item.id)}
            >
              {item.label}
            </FilterChip>
          ))}
        </Filters>

        <Cards>
          {(pages[page] ?? []).map((post) => (
            <UrgentDetailCard
              key={post.id}
              post={post}
              onDetailClick={() => navigate(post.detailPath)}
            />
          ))}
          {urgent.status === "loading" && <Empty>긴급 모집을 불러오는 중...</Empty>}
          {urgent.status === "error" && (
            <Empty role="alert">
              긴급 모집을 불러오지 못했어요.{" "}
              <RetryButton type="button" onClick={urgent.retry}>
                다시 시도
              </RetryButton>
            </Empty>
          )}
          {urgent.status === "ready" && posts.length === 0 && <Empty>지금은 급하게 도움이 필요한 곳이 없어요.</Empty>}
        </Cards>
      </Body>

      {pages.length > 1 && (
        <DotsArea>
          <PageDots total={pages.length} current={page} onSelect={changePage} size={7} gap={8} />
        </DotsArea>
      )}
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #ffffff;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 19px;
  padding: 10px 25px 0;
`;

const Filters = styled.div`
  display: flex;
  gap: 6px;
`;

const FilterChip = styled.button`
  height: 28px;
  padding: 0 13px;
  border: 1px solid ${({ $active }) => ($active ? "#382f2f" : "#e2ded8")};
  border-radius: 18px;
  background-color: ${({ $active }) => ($active ? "#382f2f" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#382f2f")};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

const Cards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const DotsArea = styled.div`
  display: flex;
  justify-content: center;
  padding: 15px 0 40px;
`;

const Empty = styled.p`
  color: #8a8a8a;
  font-size: 14px;
`;