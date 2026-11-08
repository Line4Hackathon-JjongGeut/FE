import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import backIcon from "../../assets/icons/shelters/back.svg";
import pawIcon from "../../assets/icons/shelters/paw.svg";
import mapPawIcon from "../../assets/icons/shelters/map-paw.svg";
import calendarIcon from "../../assets/icons/shelters/calendar.svg";
import clockIcon from "../../assets/icons/shelters/clock.svg";
import clockHandIcon from "../../assets/icons/shelters/clock-hand.svg";
import personIcon from "../../assets/icons/shelters/person.svg";
import capacityIcon from "../../assets/icons/shelters/capacity.svg";
import applicantsIcon from "../../assets/icons/shelters/applicants.svg";
import locationIcon from "../../assets/icons/shelters/location.svg";
import subwayIcon from "../../assets/icons/shelters/subway.svg";
import favoritePawIcon from "../../assets/icons/map/paw-alt.svg";
import pawFilledIcon from "../../assets/icons/map/paw-filled.svg";
import { SHELTER_DETAIL } from "../../dummyData/shelters/shelterDummy.js";

/* 지도에서 보호소 이름을 눌렀을 때 열리는 보호시설 상세입니다. */
export default function ShelterDetail() {
  const navigate = useNavigate();
  const [favorite, setFavorite] = useState(false);
  const shelter = SHELTER_DETAIL;

  return (
    <Screen>
      {/* 사진이 생기기 전 보호소 사진 자리. 뒤로 가기는 사진 위에 둡니다. */}
      <Hero>
        <BackButton type="button" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
          <BackIcon src={backIcon} alt="" />
        </BackButton>
        <img src={pawIcon} alt="" />
        <HeroLabel>보호소 사진</HeroLabel>
      </Hero>

      <Content>
        <Title>{shelter.title}</Title>
        <Posted>
          {shelter.name}
          {"   ㅣ   "}
          {shelter.postedAgo}
        </Posted>

        {/* 일정, 시간, 참여 조건, 모집 인원 */}
        <Facts>
          <Fact>
            <img src={calendarIcon} alt="" />
            {shelter.date}
          </Fact>
          <Fact>
            <Clock>
              <img src={clockIcon} alt="" />
              <ClockHand src={clockHandIcon} alt="" />
            </Clock>
            {shelter.time}
          </Fact>
          <Fact>
            <img src={personIcon} alt="" />
            {shelter.requirement}
          </Fact>
          <Fact>
            <img src={capacityIcon} alt="" />
            {shelter.capacity}
          </Fact>
        </Facts>

        <Block>
          <ActivityLabel>
            활동 내역<Required>*</Required>
          </ActivityLabel>
          <BodyText>{shelter.activity}</BodyText>
        </Block>

        <Block>
          <SupplyLabel>준비물</SupplyLabel>
          <BodyText>{shelter.supplies}</BodyText>
        </Block>

        <Block>
          <CautionLabel>유의사항</CautionLabel>
          <BodyText>{shelter.caution}</BodyText>
        </Block>

        <Applicants>
          <ApplicantsIcon src={applicantsIcon} alt="" />
          {shelter.applicants}
        </Applicants>

        {/* 지도 API 전, 위치 자리 표시 */}
        <MapPreview>
          <img src={mapPawIcon} alt="" />
          <HeroLabel>지도 사진</HeroLabel>
        </MapPreview>

        <Address>
          <img src={locationIcon} alt="" />
          {shelter.address}
        </Address>
        <Station>
          <Subway>
            <img src={subwayIcon} alt="" />
            <LineNumber>{shelter.stationLine}</LineNumber>
          </Subway>
          <StationName>{shelter.station}</StationName>
          <Walk>{shelter.walk}</Walk>
        </Station>
      </Content>

      {/* 화면을 내려도 발바닥과 지원하기는 아래에 고정됩니다. */}
      <ActionBar>
        {/* 발바닥은 즐겨찾기입니다. 누르면 색이 채워지고, 다시 누르면 비워집니다. */}
        <PawButton
          type="button"
          aria-label={favorite ? "즐겨찾기 해제" : "즐겨찾기"}
          aria-pressed={favorite}
          onClick={() => setFavorite((current) => !current)}
        >
          <PawIcon src={favorite ? pawFilledIcon : favoritePawIcon} alt="" />
        </PawButton>
        <ApplyButton type="button" onClick={() => navigate("/volunteer/apply/1")}>
          지원하기
        </ApplyButton>
      </ActionBar>
    </Screen>
  );
}

const Screen = styled.div`
  min-height: 100dvh;
  padding-bottom: 96px;
  background-color: #ffffff;
  color: #2f3833;
`;

const Hero = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  height: 250px;
  background-color: #bdd9c4;
`;

const BackButton = styled.button`
  position: absolute;
  top: 32px;
  left: 28px;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
`;

/* 아이콘 파일이 아래를 가리키고 있어, 왼쪽으로 돌려 뒤로 가기로 씁니다. */
const BackIcon = styled.img`
  display: block;
  transform: rotate(90deg);
`;

const HeroLabel = styled.span`
  color: #1f1e1c;
  font-size: 20px;
  font-weight: 600;
`;

const Content = styled.div`
  padding: 28px 28px 0;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.35;
`;

const Posted = styled.p`
  margin: 14px 0 0;
  color: #717171;
  font-size: 15px;
  font-weight: 500;
`;

const Facts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 22px;
`;

const Fact = styled.p`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
`;

const Clock = styled.span`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
`;

const ClockHand = styled.img`
  position: absolute;
  top: 46%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Block = styled.section`
  margin-top: 22px;
`;

const ActivityLabel = styled.h2`
  margin: 0;
  color: #4f7a5f;
  font-size: 15px;
  font-weight: 600;
`;

const Required = styled.span`
  color: #e88b7a;
`;

const SupplyLabel = styled.h2`
  margin: 0;
  color: #4f7a5f;
  font-size: 15px;
  font-weight: 600;
`;

const CautionLabel = styled.h2`
  margin: 0;
  color: #b03c22;
  font-size: 15px;
  font-weight: 600;
`;

const BodyText = styled.p`
  margin: 8px 0 0;
  color: #151515;
  font-size: 13px;
  font-weight: 500;
  line-height: 15px;
  white-space: pre-line;
`;

const Applicants = styled.p`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 22px 0 0;
  font-size: 14px;
  font-weight: 700;
`;

const ApplicantsIcon = styled.img`
  display: block;
  transform: scaleX(-1);
`;

const MapPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 184px;
  margin-top: 16px;
  border-radius: 10px;
  background-color: #bdd9c4;
`;

const Address = styled.p`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0 0;
  color: #151515;
  font-size: 16px;
  font-weight: 500;
`;

const Station = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
`;

const Subway = styled.span`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
`;

const LineNumber = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
`;

const StationName = styled.span`
  font-size: 13px;
  font-weight: 700;
`;

const Walk = styled.span`
  color: #444444;
  font-size: 13px;
  font-weight: 400;
`;

const ActionBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 16px;
  width: min(100%, 390px);
  padding: 12px 24px 20px;
  background-color: #ffffff;
  transform: translateX(-50%);
`;

const PawButton = styled.button`
  display: flex;
  flex-shrink: 0;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
`;

const PawIcon = styled.img`
  display: block;
`;

const ApplyButton = styled.button`
  flex: 1;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background-color: #e88b7a;
  color: #ffffff;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.51px;
  cursor: pointer;
`;
