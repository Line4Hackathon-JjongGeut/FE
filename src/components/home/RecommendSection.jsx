import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import SectionHeader from "./SectionHeader.jsx";
import RecommendCard from "./RecommendCard.jsx";
import RecommendEmpty from "./RecommendEmpty.jsx";
import PageDots from "../auth/PageDots.jsx";
import { RECOMMENDED_POSTS } from "../../dummyData/home/homeDummy.js";
import { chunk } from "../../utils/chunk.js";
import { useMyPreferences } from "../../hooks/useMyPreferences.js";
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
  const pages = chunk(
    RECOMMENDED_POSTS.slice(0, HOME_RECOMMEND_COUNT),
    CARDS_PER_PAGE,
  );
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
      {/* 참여 조건을 불러오기 전에는 카드도 빈 화면 안내도 보여 주지 않음 */}
      {status !== "ready" ? null : hasPreferences ? (
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
      ) : (
        <RecommendEmpty />
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
