import styled from "styled-components";
import HomeHeader from "../../components/home/HomeHeader.jsx";
import RecommendSection from "../../components/home/RecommendSection.jsx";
import UrgentSection from "../../components/home/UrgentSection.jsx";
import HelpSection from "../../components/home/HelpSection.jsx";

/* 홈 화면. 인사 카드 -> 봉사 추천 -> 급한 활동 -> 다른 도움 방법 순서 */
export default function Home() {
  return (
    <Page>
      <HomeHeader />
      <Sections>
        <RecommendSection />
        <UrgentSection />
        <HelpSection />
      </Sections>
    </Page>
  );
}

const Page = styled.div`
  min-height: 100%;
  padding-bottom: 40px;
  overflow-x: hidden;
  background-color: #ffffff;
`;

const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-top: 28px;
`;
