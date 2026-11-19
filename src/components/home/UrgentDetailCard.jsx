import styled from "styled-components";
import { URGENT_LABELS } from "../../utils/urgentMapper.js";
import clockIcon from "../../assets/icons/search/clock.svg";
import pinIcon from "../../assets/icons/map/pin.svg";
import chevronIcon from "../../assets/icons/search/chevron.svg";

/* 인력 부족은 빨강, 물품 부족은 초록 */
const THEMES = {
  staff: { background: "#fcf6f5", border: "#efe8dc", point: "#c33e24", light: "#fdddd8", badge: "#fbe3dc", badgeText: "#c4513b" },
  goods: { background: "#f7f8f5", border: "#e6efdc", point: "#4c875e", light: "#e4eee1", badge: "#e4eee1", badgeText: "#4c875e" },
};

/* 긴급 모집 카드 */
export default function UrgentDetailCard({ post, onDetailClick }) {
  const theme = THEMES[post.type];
  const isStaff = post.type === "staff";
  const progress = isStaff ? (post.total > 0 ? (post.current / post.total) * 100 : 0) : post.percent;

  return (
    <Card $theme={theme}>
      <Head>
        <Title>{post.title}</Title>
        <Badge $theme={theme}>{URGENT_LABELS[post.type]}</Badge>
      </Head>
      <Shelter>{post.shelter}</Shelter>

      <Meta>
        {post.schedule && (
          <MetaItem>
            <img src={clockIcon} alt="" />
            {post.schedule}
          </MetaItem>
        )}
        {post.distance && (
          <MetaItem>
            <img src={pinIcon} alt="" />
            {post.distance}
          </MetaItem>
        )}
      </Meta>

      <Track $theme={theme}>
        <Fill $theme={theme} style={{ width: `${progress}%` }} />
      </Track>

      <Footer>
        <Status>
          {isStaff ? (
            <>
              이번 주 봉사자 <Point $theme={theme}>{post.current}</Point> <Total>/ {post.total}명</Total>
            </>
          ) : (
            <>
              필요 수량 <Point $theme={theme} $bold>{post.percent}%</Point>
            </>
          )}
        </Status>
        <DetailButton type="button" onClick={onDetailClick}>
          자세히 보기
          <Chevron src={chevronIcon} alt="" />
        </DetailButton>
      </Footer>
    </Card>
  );
}

const Card = styled.article`
  padding: 18px 16px 15px 18px;
  border: 1px solid ${({ $theme }) => $theme.border};
  border-radius: 10px;
  background-color: ${({ $theme }) => $theme.background};
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  color: #382f2f;
  font-size: 18px;
  font-weight: 700;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 18px;
  background-color: ${({ $theme }) => $theme.badge};
  color: ${({ $theme }) => $theme.badgeText};
  font-size: 11px;
  font-weight: 700;
`;

const Shelter = styled.p`
  margin-top: 4px;
  color: #605b5b;
  font-size: 13px;
  font-weight: 500;
`;

const Meta = styled.div`
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

  img {
    height: 12px;
  }
`;

const Track = styled.div`
  height: 9px;
  margin-top: 9px;
  overflow: hidden;
  border-radius: 10.5px;
  background-color: ${({ $theme }) => $theme.light};
`;

const Fill = styled.div`
  height: 100%;
  border-radius: 10.5px;
  background-color: ${({ $theme }) => $theme.point};
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #e5dad6;
`;

const Status = styled.p`
  color: #605b5b;
  font-size: 14px;
  font-weight: 500;
`;

const Point = styled.strong`
  color: ${({ $theme }) => $theme.point};
  font-weight: ${({ $bold }) => ($bold ? 700 : 500)};
`;

const Total = styled.span`
  font-weight: 600;
`;

const DetailButton = styled.button`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 0;
  border: 0;
  background: transparent;
  color: #626262;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
`;

const Chevron = styled.img`
  width: 8px;
  height: 5px;
  transform: rotate(-90deg);
`;