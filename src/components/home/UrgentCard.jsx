import styled from "styled-components";
import { URGENT_LABELS } from "../../dummyData/home/homeDummy.js";

/* 홈 "도움이 급한 활동" 카드 */
export default function UrgentCard({ post, onClick }) {
  return (
    <Card type="button" onClick={onClick}>
      <Info>
        <Title>{post.title}</Title>
        <Shelter>
          {post.shelter} · {post.region}
        </Shelter>
        <Volunteers>
          이번 주 봉사자 <Count>{post.current}</Count> / {post.total}명
        </Volunteers>
      </Info>
      <Badge>{URGENT_LABELS[post.type]}</Badge>
    </Card>
  );
}

const Card = styled.button`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  width: 100%;
  padding: 16px;
  border: 1px solid #efe8dc;
  border-radius: 18px;
  background-color: #ffffff;
  text-align: left;
  cursor: pointer;
`;

const Info = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.span`
  color: #2f3833;
  font-size: 15px;
  font-weight: 700;
  line-height: 20px;
`;

const Shelter = styled.span`
  color: #595959;
  font-size: 13px;
  font-weight: 500;
`;

const Volunteers = styled.span`
  color: #716b6b;
  font-size: 12px;
`;

const Count = styled.strong`
  color: #c4513b;
  font-weight: 700;
`;

const Badge = styled.span`
  flex-shrink: 0;
  margin-top: 7px;
  padding: 6px 10px;
  border-radius: 8px;
  background-color: #fbe3dc;
  color: #2f3833;
  font-size: 12px;
  font-weight: 600;
`;