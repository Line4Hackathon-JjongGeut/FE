import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import SectionHeader from "./SectionHeader.jsx";
import RecommendCard from "./RecommendCard.jsx";
import RecommendEmpty from "./RecommendEmpty.jsx";
import RecommendStatus from "./RecommendStatus.jsx";
import CardCarousel from "./CardCarousel.jsx";
import { chunk } from "../../utils/chunk.js";
import { useMyPreferences } from "../../hooks/useMyPreferences.js";
import { useRecommendations, useRecordImpressions } from "../../hooks/useRecommendations.js";
import sparkleIcon from "../../assets/icons/home/icon-sparkle.svg";

const CARDS_PER_PAGE = 2;
const HOME_RECOMMEND_COUNT = 6;

export default function RecommendSection() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const { status, summary } = useMyPreferences();
  const hasPreferences = summary !== null;
  const recommendations = useRecommendations(HOME_RECOMMEND_COUNT, status === "ready" && hasPreferences);
  const pages = chunk(recommendations.cards, CARDS_PER_PAGE);

  useRecordImpressions(recommendations.batchId, pages[page] ?? []);

  return (
    <Section>
      <SectionHeader
        icon={<img src={sparkleIcon} alt="" />}
        title="나를 위한 봉사 추천"
        linkLabel="전체보기"
        onLinkClick={() => navigate("/recommendations")}
      />
      {status !== "ready" ? null : !hasPreferences ? (
        <RecommendEmpty />
      ) : recommendations.status !== "ready" ? (
        <RecommendStatus status={recommendations.status} onRetry={recommendations.retry} />
      ) : pages.length === 0 ? (
        <RecommendStatus status="empty" />
      ) : (
        <CardCarousel
          pages={pages}
          onPageChange={setPage}
          renderCard={(post) => <RecommendCard key={post.id} post={post} />}
        />
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