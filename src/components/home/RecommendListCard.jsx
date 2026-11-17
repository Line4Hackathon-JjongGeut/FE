import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import clockIcon from "../../assets/icons/search/clock.svg";
import pinIcon from "../../assets/icons/map/pin.svg";

/* "나를 위한 봉사 추천" 페이지 카드 */
export default function RecommendListCard({ post }) {
  const navigate = useNavigate();

  return (
    <Card type="button" onClick={() => navigate(`/shelters/volunteer/${post.postId}`)}>
      <Title>{post.title}</Title>
      <Shelter>{post.shelter}</Shelter>
      <Meta>
        <MetaItem>
          <MetaIcon src={clockIcon} alt="" />
          {post.schedule}
        </MetaItem>
        <MetaItem>
          <MetaIcon src={pinIcon} alt="" />
          {post.distance}
        </MetaItem>
      </Meta>
      <Tags>
        {post.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </Tags>
    </Card>
  );
}

const Card = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  min-height: 138px;
  padding: 20px 18px 14px;
  border: 1px solid #efe8dc;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(47, 56, 51, 0.04);
  text-align: left;
  cursor: pointer;
`;

const Title = styled.span`
  color: #382f2f;
  font-size: 17px;
  font-weight: 700;
`;

const Shelter = styled.span`
  margin-top: 5px;
  color: #605b5b;
  font-size: 13px;
  font-weight: 500;
`;

const Meta = styled.span`
  display: flex;
  gap: 15px;
  margin-top: 10px;
`;

const MetaItem = styled.span`
  display: flex;
  gap: 5px;
  align-items: center;
  color: #211d1d;
  font-size: 13px;
  font-weight: 500;
`;

const MetaIcon = styled.img`
  height: 12px;
`;

const Tags = styled.span`
  display: flex;
  gap: 5px;
  margin-top: 15px;
`;

const Tag = styled.span`
  padding: 4px 10px;
  border-radius: 18px;
  background-color: #d4ebda;
  color: #258314;
  font-size: 11px;
  font-weight: 700;
`;