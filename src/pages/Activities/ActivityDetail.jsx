import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import backIcon from "../../assets/icons/shelters/back.svg";
import infoRingIcon from "../../assets/icons/shelters/info-ring.svg";
import infoStemIcon from "../../assets/icons/shelters/info-stem.svg";
import { findApplication, getStatusCopy, removeApplication } from "../../dummyData/volunteer/applications.js";

const BADGE = {
  "승인 대기": { background: "#fcebc4", color: "#6e5110" },
  "참여 예정": { background: "#e3f0e6", color: "#2f5e43" },
  "참여 완료": { background: "#e9e9e9", color: "#50545a" },
};

/* 참여내역 카드를 누르면 신청 내용과 취소 버튼이 보입니다. */
export default function ActivityDetail() {
  const navigate = useNavigate();
  const { activityId } = useParams();
  const item = findApplication(activityId);

  if (!item) {
    return (
      <Screen>
        <Header>
          <BackButton type="button" aria-label="뒤로 가기" onClick={() => navigate("/activities")}>
            <BackIcon src={backIcon} alt="" />
          </BackButton>
          <Title>신청상세</Title>
        </Header>
        <Missing>신청 내역을 찾을 수 없어요.</Missing>
      </Screen>
    );
  }

  const copy = getStatusCopy(item.status);

  function cancel() {
    removeApplication(item.id);
    navigate("/activities");
  }

  return (
    <Screen>
      <Header>
        <BackButton type="button" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
          <BackIcon src={backIcon} alt="" />
        </BackButton>
        <Title>신청상세</Title>
      </Header>

      <Content>
        <Badge $background={BADGE[item.status].background} $color={BADGE[item.status].color}>
          {item.status}
        </Badge>
        <ActivityTitle>{item.title}</ActivityTitle>
        <Shelter>{item.shelter}</Shelter>

        <BlockTitle>신청상세</BlockTitle>
        <StatusTitle>{copy.headline}</StatusTitle>
        <StatusText>{copy.description}</StatusText>

        <SectionTitle>신청자 정보</SectionTitle>
        <Divider />
        <Row>
          <Label>일정</Label>
          <Value>{item.schedule}</Value>
        </Row>
        <Row>
          <Label>장소</Label>
          <Value>{item.place}</Value>
        </Row>
        <Row>
          <Label>신청일</Label>
          <Value>{item.appliedAt}</Value>
        </Row>
        <Row>
          <Label>신청자</Label>
          <Value>{item.applicant}</Value>
        </Row>

        <SectionTitle>준비물 및 유의사항</SectionTitle>
        <NoteText>{item.supplies}</NoteText>

        <Notice>
          <InfoIcon aria-hidden="true">
            <img src={infoRingIcon} alt="" />
            <InfoStem src={infoStemIcon} alt="" />
          </InfoIcon>
          <span>신청 취소 기능 기한은 보호시설 정책에 따라 달라져요</span>
        </Notice>

        <CancelButton type="button" onClick={cancel}>
          신청 취소하기
        </CancelButton>
      </Content>
    </Screen>
  );
}

const Screen = styled.div`
  min-height: 100dvh;
  background-color: #ffffff;
  color: #2f3833;
`;

const Header = styled.header`
  position: relative;
  display: flex;
  align-items: center;
  height: 72px;
  padding: 20px 24px 0;
`;

const BackButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
`;

const BackIcon = styled.img`
  display: block;
  transform: rotate(90deg);
`;

const Title = styled.h1`
  position: absolute;
  left: 50%;
  margin: 0;
  transform: translateX(-50%);
  color: #424242;
  font-size: 20px;
  font-weight: 600;
`;

const Missing = styled.p`
  padding: 40px 24px;
  color: #605b5b;
  font-size: 16px;
`;

const Content = styled.div`
  padding: 8px 24px 32px;
`;

const Badge = styled.span`
  display: inline-flex;
  padding: 5px 12px;
  border-radius: 10px;
  background-color: ${({ $background }) => $background};
  color: ${({ $color }) => $color};
  font-size: 15px;
  font-weight: 700;
`;

const ActivityTitle = styled.h2`
  margin: 14px 0 0;
  color: #382f2f;
  font-size: 26px;
  font-weight: 700;
`;

const Shelter = styled.p`
  margin: 8px 0 0;
  color: #605b5b;
  font-size: 16px;
  font-weight: 500;
`;

const BlockTitle = styled.h3`
  margin: 28px 0 0;
  color: #605b5b;
  font-size: 16px;
  font-weight: 500;
`;

const StatusTitle = styled.p`
  margin: 8px 0 0;
  color: #141414;
  font-size: 18px;
  font-weight: 600;
`;

const StatusText = styled.p`
  margin: 6px 0 0;
  color: #141414;
  font-size: 14px;
  font-weight: 500;
`;

const SectionTitle = styled.h3`
  margin: 28px 0 0;
  color: #4f7a5f;
  font-size: 15px;
  font-weight: 600;
`;

const Divider = styled.div`
  height: 1px;
  margin-top: 12px;
  background-color: #e6e6e6;
`;

const Row = styled.div`
  display: flex;
  gap: 28px;
  margin-top: 16px;
`;

const Label = styled.span`
  width: 56px;
  color: #4a524d;
  font-size: 16px;
  font-weight: 600;
`;

const Value = styled.span`
  color: #0e0e0e;
  font-size: 16px;
  font-weight: 600;
`;

const NoteText = styled.p`
  margin: 12px 0 0;
  color: #605b5b;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  white-space: pre-line;
`;

const Notice = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 28px;
  padding: 12px 14px;
  border-radius: 10px;
  background-color: #f7f4ef;
  color: #5e5a55;
  font-size: 13px;
  line-height: 19.5px;
`;

const InfoIcon = styled.span`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  margin-top: 2px;
`;

const InfoStem = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const CancelButton = styled.button`
  width: 100%;
  height: 44px;
  margin-top: 16px;
  border: 1px solid #4a524d;
  border-radius: 10px;
  background: transparent;
  color: #4a524d;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;
