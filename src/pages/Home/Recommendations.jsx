import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/auth/BackHeader.jsx";
import PageDots from "../../components/auth/PageDots.jsx";
import PreferenceSummary from "../../components/home/PreferenceSummary.jsx";
import RecommendListCard from "../../components/home/RecommendListCard.jsx";
import RecommendEmpty from "../../components/home/RecommendEmpty.jsx";
import RecommendStatus from "../../components/home/RecommendStatus.jsx";
import { chunk } from "../../utils/chunk.js";
import { useMyPreferences } from "../../hooks/useMyPreferences.js";
import { useRecommendations, useRecordImpressions } from "../../hooks/useRecommendations.js";
import { readPageIndex } from "../../utils/pageParam.js";

const CARDS_PER_PAGE = 4;
// 서버 노출 기록이 한 번에 20개까지라 목록도 20개까지만 받음
const RECOMMEND_LIMIT = 20;

/* 나를 위한 봉사 추천 전체 목록 */
export default function Recommendations() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { status, summary } = useMyPreferences();
  const hasPreferences = summary !== null;
  // 온보딩을 끝낸 사람만 추천을 요청
  const recommendations = useRecommendations(RECOMMEND_LIMIT, status === "ready" && hasPreferences);
  const pages = chunk(recommendations.cards, CARDS_PER_PAGE);
  const page = readPageIndex(searchParams, pages.length);
  // 지금 보고 있는 페이지의 카드 4장을 노출로 기록
  useRecordImpressions(recommendations.batchId, pages[page] ?? []);

  function changePage(index) {
    setSearchParams(index > 0 ? { page: String(index + 1) } : {}, { replace: true });
    window.scrollTo({ top: 0 });
  }

  // 카드를 보여 줄 수 있는 상태: 온보딩을 끝냈고, 추천을 불러왔고, 1개 이상
  const showCards = status === "ready" && hasPreferences && recommendations.status === "ready" && pages.length > 0;

  return (
    <Screen>
      <BackHeader title="나를 위한 봉사 추천" onBack={() => navigate(-1)} />

      <Body>
        <PreferenceSummary />
        {/* 참여 조건 불러오기 전 → 아무것도 안 보임 / 온보딩 전 → 설정 안내 / 추천 불러오는 중·실패 → 안내 / 0개 → 결과 없음 */}
        {status !== "ready" ? null : !hasPreferences ? (
          <RecommendEmpty />
        ) : recommendations.status !== "ready" ? (
          <RecommendStatus status={recommendations.status} onRetry={recommendations.retry} />
        ) : pages.length === 0 ? (
          <RecommendStatus status="empty" />
        ) : (
          <Cards>
            {pages[page].map((post) => (
              <RecommendListCard key={post.id} post={post} />
            ))}
          </Cards>
        )}
      </Body>

      {/* 페이지가 2개 이상일 때만 점 표시 */}
      {showCards && pages.length > 1 && (
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
  gap: 25px;
  padding: 6px 25px 0;
`;

const Cards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 17px;
`;

const DotsArea = styled.div`
  display: flex;
  justify-content: center;
  padding: 15px 0 40px;
`;