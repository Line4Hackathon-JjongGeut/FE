import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/auth/BackHeader.jsx";
import PageDots from "../../components/auth/PageDots.jsx";
import PreferenceSummary from "../../components/home/PreferenceSummary.jsx";
import RecommendListCard from "../../components/home/RecommendListCard.jsx";
import RecommendEmpty from "../../components/home/RecommendEmpty.jsx";
import { RECOMMENDED_POSTS } from "../../dummyData/home/homeDummy.js";
import { getPreferences } from "../../dummyData/onboarding/preferences.js";
import { chunk } from "../../utils/chunk.js";
import { formatPreferenceSummary } from "../../utils/preferenceSummary.js";

const CARDS_PER_PAGE = 4;

/* 나를 위한 봉사 추천 전체 목록 */
export default function Recommendations() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const pages = chunk(RECOMMENDED_POSTS, CARDS_PER_PAGE);
  const hasPreferences = formatPreferenceSummary(getPreferences()) !== null;

  function changePage(index) {
    setPage(index);
    window.scrollTo({ top: 0 });
  }

  return (
    <Screen>
      <BackHeader title="나를 위한 봉사 추천" onBack={() => navigate(-1)} />

      <Body>
        <PreferenceSummary />
        {hasPreferences ? (
          <Cards>
            {pages[page].map((post) => (
              <RecommendListCard key={post.id} post={post} />
            ))}
          </Cards>
        ) : (
          <RecommendEmpty />
        )}
      </Body>

      {hasPreferences && (
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