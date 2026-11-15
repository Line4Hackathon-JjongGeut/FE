import styled from "styled-components";
import HomeHeader from "../../components/home/HomeHeader.jsx";
import RecommendSection from "../../components/home/RecommendSection.jsx";

/* 홈 화면. 인사 카드 -> 봉사 추천 -> 급한 활동 -> 다른 도움 방법 순서 */
export default function Home() {
  return (
    <Page>
      <HomeHeader />
      <Sections>
        <RecommendSection />
        {/* TODO: 도움이 급한 활동, 다른 방법으로 도와주기 */}
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