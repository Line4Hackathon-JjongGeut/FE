import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import photoPawIcon from "../../assets/icons/search/photo-paw.svg";
import clockIcon from "../../assets/icons/search/clock.svg";
import { recordRecommendationClick } from "../../api/recommendations.js";

/* 홈 "나를 위한 봉사 추천" 카드. 누르면 봉사 공고 상세로 이동 */
export default function RecommendCard({ post }) {
  const navigate = useNavigate();

  function handleClick() {
    // 추천 API에서 온 카드면 클릭을 기록. 기록이 실패해도 상세 화면은 그대로 열림
    if (post.batchId) recordRecommendationClick(post.batchId, post.id).catch(() => {});
    navigate(`/shelters/volunteer/${post.postId}`);
  }

  return (
    <Card type="button" onClick={handleClick}>
      <Photo>
        {/* 사진이 오면 사진을, 없으면 회색 칸 */}
        {post.thumbnailUrl ? (
          <PhotoImage src={post.thumbnailUrl} alt="" />
        ) : (
          <>
            <img src={photoPawIcon} alt="" />
            시설 사진
          </>
        )}
      </Photo>
      <Info>
        <Tag>{post.matchLabel}</Tag>
        <Title>{post.title}</Title>
        <Shelter>
          {post.shelter} · {post.region}
        </Shelter>
        {post.schedule && (
          <Schedule>
            <ClockIcon src={clockIcon} alt="" />
            {post.schedule}
          </Schedule>
        )}
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

const PhotoImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: inherit;
  object-fit: cover;
`;

const Info = styled.span`
  display: flex;
  flex: 1;
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
  max-width: 100%;
  margin-top: 9px;
  overflow: hidden;
  color: #382f2f;
  font-size: 17px;
  font-weight: 700;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Shelter = styled.span`
  max-width: 100%;
  margin-top: 5px;
  overflow: hidden;
  color: #605b5b;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  text-overflow: ellipsis;
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