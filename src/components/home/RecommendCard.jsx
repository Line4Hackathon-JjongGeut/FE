import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import photoPawIcon from "../../assets/icons/search/photo-paw.svg";
import clockIcon from "../../assets/icons/search/clock.svg";

/* 홈 "나를 위한 봉사 추천" 카드. 누르면 봉사 공고 상세로 이동 */
export default function RecommendCard({ post }) {
  const navigate = useNavigate();

  return (
    <Card type="button" onClick={() => navigate(`/shelters/volunteer/${post.postId}`)}>
      <Photo>
        <img src={photoPawIcon} alt="" />
        시설 사진
      </Photo>
      <Info>
        <Tag>{post.matchLabel}</Tag>
        <Title>{post.title}</Title>
        <Shelter>
          {post.shelter} · {post.region}
        </Shelter>
        <Schedule>
          <ClockIcon src={clockIcon} alt="" />
          {post.schedule}
        </Schedule>
      </Info>
    </Card>
  );
}

const Card = styled.button`
  display: flex;
  gap: 13px;
  align-items: flex-start;
  width: 100%;
  height: 129px;
  padding: 9px 10px;
  border: 1px solid #efe8dc;
  border-radius: 18px;
  background-color: #ffffff;
  text-align: left;
  cursor: pointer;
`;

const Photo = styled.span`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 4px;
  align-items: center;
  justify-content: center;
  width: 111px;
  height: 111px;
  border-radius: 10.9px;
  background-color: #d9d9d9;
  color: #2f3833;
  font-size: 11px;
`;

const Info = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
  padding-top: 5px;
`;

const Tag = styled.span`
  padding: 4px 10px;
  border-radius: 8px;
  background-color: #d4ebda;
  color: #258314;
  font-size: 12px;
  font-weight: 600;
`;

const Title = styled.span`
  margin-top: 9px;
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

const Schedule = styled.span`
  display: flex;
  gap: 5px;
  align-items: center;
  margin-top: 10px;
  color: #211d1d;
  font-size: 13px;
  font-weight: 500;
`;

const ClockIcon = styled.img`
  width: 12px;
  height: 12px;
`;