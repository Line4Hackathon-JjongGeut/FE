import styled from "styled-components";
import { URGENT_LABELS } from "../../dummyData/home/homeDummy.js";
import calendarIcon from "../../assets/icons/map/calendar.svg";
import goodsIcon from "../../assets/icons/home/icon-goods.svg";
import chevronIcon from "../../assets/icons/search/chevron.svg";

/* 인력 부족은 빨강, 물품 부족은 초록 */
const THEMES = {
  staff: { background: "#fcf6f5", point: "#c33e24", light: "#fdddd8", icon: calendarIcon, needsLabel: "활동" },
  goods: { background: "#f7f8f5", point: "#4c875e", light: "#e4eee1", icon: goodsIcon, needsLabel: "필요 물품" },
};

/* 긴급 모집 카드 */
export default function UrgentDetailCard({ post, onDetailClick }) {
  const theme = THEMES[post.type];
  const isStaff = post.type === "staff";
  const progress = isStaff ? (post.current / post.total) * 100 : post.percent;

  return (
    <Card $theme={theme}>
      <Head>
        <Shelter>{post.shelter}</Shelter>
        <Badge $theme={theme}>{URGENT_LABELS[post.type]}</Badge>
      </Head>

      <Message>
        {isStaff ? (
          <>
            이번 주 봉사자가{" "}
            <Point $theme={theme}>
              {post.current}/{post.total}명
            </Point>
            이라 도움이 급해요!
          </>
        ) : (
          <>
            필요 수량의 <Point $theme={theme}>{post.percent}%</Point>만 모였어요.
          </>
        )}
      </Message>

      <Track $theme={theme}>
        <Fill $theme={theme} style={{ width: `${progress}%` }} />
      </Track>

      <Footer>
        <Needs>
          <img src={theme.icon} alt="" />
          {theme.needsLabel}
          <Bar>|</Bar>
          {post.needs}
        </Needs>
        <DetailButton type="button" onClick={onDetailClick}>
          자세히 보기
          <Chevron src={chevronIcon} alt="" />
        </DetailButton>
      </Footer>
    </Card>
  );
}

const Card = styled.article`
  padding: 18px 18px 14px 20px;
  border: 1px solid #e5dad6;
  border-radius: 10px;
  background-color: ${({ $theme }) => $theme.background};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Shelter = styled.h2`
  color: #382f2f;
  font-size: 22px;
  font-weight: 700;
`;

const Badge = styled.span`
  padding: 4px 10px;
  border-radius: 8px;
  background-color: ${({ $theme }) => $theme.light};
  color: ${({ $theme }) => $theme.point};
  font-size: 12px;
  font-weight: 700;
`;

const Message = styled.p`
  margin-top: 4px;
  color: #211d1d;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
`;

const Point = styled.strong`
  color: ${({ $theme }) => $theme.point};
  font-size: 16px;
  font-weight: 600;
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
  margin-top: 16px;
  padding-top: 13px;
  border-top: 1px solid #e5dad6;
`;

const Needs = styled.span`
  display: flex;
  gap: 8px;
  align-items: center;
  color: #211d1d;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.36px;
`;

const Bar = styled.span`
  margin: 0 2px;
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