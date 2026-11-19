import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import SectionHeader from "./SectionHeader.jsx";
import UrgentCard from "./UrgentCard.jsx";
import CardCarousel from "./CardCarousel.jsx";
import { chunk } from "../../utils/chunk.js";
import { useMyPreferences } from "../../hooks/useMyPreferences.js";
import { useUrgentPosts } from "../../hooks/useUrgentPosts.js";

const CARDS_PER_PAGE = 2;
const HOME_URGENT_COUNT = 6; // 2개씩 최대 3페이지

/* 홈 "도움이 급한 활동" 섹션 */
export default function UrgentSection() {
  const navigate = useNavigate();
  const { status: preferenceStatus, preferences } = useMyPreferences();
  const urgent = useUrgentPosts({
    latitude: preferences.region?.latitude,
    longitude: preferences.region?.longitude,
    enabled: preferenceStatus !== "loading",
  });
  // 홈에는 인력 부족만 최대 6개, 2개씩 페이지로 나눔
  const posts = urgent.posts.filter((post) => post.type === "staff").slice(0, HOME_URGENT_COUNT);
  const pages = chunk(posts, CARDS_PER_PAGE);

  return (
    <Section>
      <SectionHeader
        icon={<RedDot />}
        title="도움이 급한 활동"
        linkLabel="전체보기"
        onLinkClick={() => navigate("/urgent")}
      />
      {pages.length > 0 && (
        <CardCarousel
          pages={pages}
          gap={15}
          // 카드를 누르면 그 공고 상세로 바로 (봉사는 봉사 상세, 후원은 후원 상세)
          renderCard={(post) => <UrgentCard key={post.id} post={post} onClick={() => navigate(post.detailPath)} />}
        />
      )}
      {urgent.status === "error" && (
        <Message role="alert">
          긴급 모집을 불러오지 못했어요.{" "}
          <RetryButton type="button" onClick={urgent.retry}>
            다시 시도
          </RetryButton>
        </Message>
      )}
      {urgent.status === "ready" && posts.length === 0 && <Message>지금은 급하게 도움이 필요한 곳이 없어요.</Message>}
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 26px;
`;

const RedDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #c4513b;
`;

const Message = styled.p`
  padding: 20px 0;
  color: #8a8a8a;
  font-size: 14px;
  text-align: center;
`;

const RetryButton = styled.button`
  border: 0;
  background: none;
  color: #2f3833;
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
`;