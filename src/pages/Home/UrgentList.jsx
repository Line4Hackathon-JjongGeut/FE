import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/auth/BackHeader.jsx";
import UrgentDetailCard from "../../components/home/UrgentDetailCard.jsx";
import { URGENT_POSTS } from "../../dummyData/home/homeDummy.js";

const FILTERS = [
  { id: "all", label: "전체" },
  { id: "staff", label: "인력 부족" },
  { id: "goods", label: "물품 부족" },
];

/* 긴급 모집 화면 */
export default function UrgentList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const posts = filter === "all" ? URGENT_POSTS : URGENT_POSTS.filter((post) => post.type === filter);

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
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </FilterChip>
          ))}
        </Filters>

        <Cards>
          {posts.map((post) => (
            <UrgentDetailCard
              key={post.id}
              post={post}
              onDetailClick={() => navigate(`/shelters/${post.shelterId}`)}
            />
          ))}
          {posts.length === 0 && <Empty>지금은 급하게 도움이 필요한 곳이 없어요.</Empty>}
        </Cards>
      </Body>
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
  flex-direction: column;
  gap: 20px;
  padding: 36px 25px 40px;
`;

const Filters = styled.div`
  display: flex;
  gap: 11px;
`;

const FilterChip = styled.button`
  height: 32px;
  padding: 0 13px 0 12px;
  border: 1px solid ${({ $active }) => ($active ? "#c33e24" : "#e2ded8")};
  border-radius: 10px;
  background-color: ${({ $active }) => ($active ? "#c33e24" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#382f2f")};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`;

const Cards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Empty = styled.p`
  color: #8a8a8a;
  font-size: 14px;
`;