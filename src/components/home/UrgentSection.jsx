import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import SectionHeader from "./SectionHeader.jsx";
import UrgentCard from "./UrgentCard.jsx";
import { URGENT_POSTS } from "../../dummyData/home/homeDummy.js";

const HOME_URGENT_COUNT = 2;

/* 홈 "도움이 급한 활동" 섹션 */
export default function UrgentSection() {
  const navigate = useNavigate();
  const posts = URGENT_POSTS.filter((post) => post.type === "staff").slice(0, HOME_URGENT_COUNT);

  return (
    <Section>
      <SectionHeader
        icon={<RedDot />}
        title="도움이 급한 활동"
        linkLabel="더보기"
        onLinkClick={() => navigate("/urgent")}
      />
      <Cards>
        {posts.map((post) => (
          <UrgentCard key={post.id} post={post} onClick={() => navigate("/urgent")} />
        ))}
      </Cards>
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

const Cards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;