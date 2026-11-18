import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import SectionHeader from "./SectionHeader.jsx";
import RecommendCard from "./RecommendCard.jsx";
import RecommendEmpty from "./RecommendEmpty.jsx";
import RecommendStatus from "./RecommendStatus.jsx";
import PageDots from "../auth/PageDots.jsx";
import { chunk } from "../../utils/chunk.js";
import { useMyPreferences } from "../../hooks/useMyPreferences.js";
import { useRecommendations, useRecordImpressions } from "../../hooks/useRecommendations.js";
import sparkleIcon from "../../assets/icons/home/icon-sparkle.svg";

const CARDS_PER_PAGE = 2;
const HOME_RECOMMEND_COUNT = 6;

/* 홈 "나를 위한 봉사 추천" 섹션. */
export default function RecommendSection() {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const [page, setPage] = useState(0);
  const { status, summary } = useMyPreferences();
  const hasPreferences = summary !== null;
  // 온보딩을 끝낸 사람만 추천을 요청
  const recommendations = useRecommendations(HOME_RECOMMEND_COUNT, status === "ready" && hasPreferences);
  const pages = chunk(recommendations.cards, CARDS_PER_PAGE);
  // 지금 보고 있는 페이지의 카드 2장을 노출로 기록
  useRecordImpressions(recommendations.batchId, pages[page] ?? []);

  function handleScroll() {
    const track = trackRef.current;
    setPage(Math.round(track.scrollLeft / track.clientWidth));
  }

  function goToPage(index) {
    const track = trackRef.current;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }

  return (
    <Section>
      <SectionHeader
        icon={<img src={sparkleIcon} alt="" />}
        title="나를 위한 봉사 추천"
        linkLabel="전체보기"
        onLinkClick={() => navigate("/recommendations")}
      />
      {/* 참여 조건 불러오기 전 → 아무것도 안 보임 / 온보딩 전 → 설정 안내 / 추천 불러오는 중·실패 → 안내 / 0개 → 결과 없음 */}
      {status !== "ready" ? null : !hasPreferences ? (
        <RecommendEmpty />
      ) : recommendations.status !== "ready" ? (
        <RecommendStatus status={recommendations.status} onRetry={recommendations.retry} />
      ) : pages.length === 0 ? (
        <RecommendStatus status="empty" />
      ) : (
        <>
          <Track ref={trackRef} onScroll={handleScroll}>
            {pages.map((cards, index) => (
              <Page key={index}>
                {cards.map((post) => (
                  <RecommendCard key={post.id} post={post} />
                ))}
              </Page>
            ))}
          </Track>

          <DotsArea>
            <PageDots
              total={pages.length}
              current={page}
              onSelect={goToPage}
              size={7}
              gap={8}
            />
          </DotsArea>
        </>
      )}
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 0 26px;
`;

/* 옆으로 스크롤되는 줄 */
const Track = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Page = styled.div`
  display: flex;
  flex: 0 0 100%;
  flex-direction: column;
  gap: 12px;
  scroll-snap-align: start;
`;

const DotsArea = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 9px;
`;
