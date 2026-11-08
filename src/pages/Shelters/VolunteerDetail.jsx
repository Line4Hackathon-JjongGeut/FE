import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import backIcon from "../../assets/icons/shelters/back.svg";
import pawIcon from "../../assets/icons/shelters/paw.svg";
import pinIcon from "../../assets/icons/shelters/post-pin.svg";
import calendarIcon from "../../assets/icons/shelters/calendar.svg";
import beginnerIcon from "../../assets/icons/shelters/beginner.svg";
import recruitIcon from "../../assets/icons/shelters/recruit.svg";
import checkIcon from "../../assets/icons/shelters/check.svg";
import infoRingIcon from "../../assets/icons/shelters/info-ring.svg";
import infoStemIcon from "../../assets/icons/shelters/info-stem.svg";
import { findVolunteerPost } from "../../dummyData/shelters/shelterDummy.js";

/* 활동 내역, 준비물, 유의 사항은 같은 공고 안에서 탭으로 바뀝니다. */
const TABS = [
  { id: "activity", label: "활동 내역" },
  { id: "items", label: "준비물" },
  { id: "notes", label: "유의 사항" },
];

/* 지도에서 공고 제목이나 카드를 눌렀을 때 열리는 봉사 공고 상세입니다. */
export default function VolunteerDetail() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [tab, setTab] = useState("activity");
  const post = findVolunteerPost(postId);
  const panel = post.tabs[tab];

  return (
    <Screen>
      {/* 사진이 생기기 전 봉사 사진 자리 */}
      <Hero>
        <BackButton type="button" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
          <BackIcon src={backIcon} alt="" />
        </BackButton>
        <img src={pawIcon} alt="" />
        <HeroLabel>봉사 사진</HeroLabel>
      </Hero>

      <Content>
        <Title>{post.title}</Title>

        {/* 보호소 이름은 보호시설 상세로 이어집니다. */}
        <ShelterLink type="button" onClick={() => navigate(`/shelters/${post.shelterId}`)}>
          <img src={pinIcon} alt="" />
          {post.shelterName}
        </ShelterLink>

        <Facts>
          <Fact>
            <img src={calendarIcon} alt="" />
            {post.schedule}
          </Fact>
          <Fact>
            <img src={beginnerIcon} alt="" />
            {post.level}
          </Fact>
          <Fact>
            <img src={recruitIcon} alt="" />
            {post.recruit}
            {"  -  "}
            <Remain>{post.remain}</Remain>
          </Fact>
        </Facts>

        <TabList role="tablist" aria-label="공고 정보">
          {TABS.map((item) => (
            <Tab
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </Tab>
          ))}
        </TabList>

        <Description>{panel.description}</Description>
        <CheckList>
          {panel.items.map((item) => (
            <CheckItem key={item}>
              <img src={checkIcon} alt="" />
              {item}
            </CheckItem>
          ))}
        </CheckList>

        <Note>
          <InfoIcon aria-hidden="true">
            <img src={infoRingIcon} alt="" />
            <InfoStem src={infoStemIcon} alt="" />
          </InfoIcon>
          {post.donationNote}
        </Note>

        {/* 내용이 짧아도 지원하기는 화면 아래쪽에 붙습니다. */}
        <Grow />
        <ApplyButton type="button" onClick={() => navigate(`/volunteer/apply/${post.id}`)}>
          지원하기
        </ApplyButton>
      </Content>
    </Screen>
  );
}

const Screen = styled.div`
  min-height: 100dvh;
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
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - 250px);
  padding: 28px 28px 28px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.35;
`;

const ShelterLink = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #4f5a54;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const Facts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 18px;
`;

const Fact = styled.p`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 16px;
  font-weight: 600;
`;

const Remain = styled.span`
  color: #e88b7a;
`;

const TabList = styled.div`
  display: flex;
  justify-content: center;
  gap: 28px;
  margin-top: 26px;
  border-bottom: 1px solid #ececec;
`;

const Tab = styled.button`
  position: relative;
  border: 0;
  padding: 0 0 10px;
  background: transparent;
  color: ${({ "aria-selected": selected }) => (selected ? "#e88b7a" : "#d9d9d9")};
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;

  &::after {
    content: "";
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 2px;
    background-color: ${({ "aria-selected": selected }) => (selected ? "#e88b7a" : "transparent")};
  }
`;

const Description = styled.p`
  margin: 20px 0 0;
  color: #000000;
  font-size: 17px;
  font-weight: 600;
  line-height: 25px;
  white-space: pre-line;
`;

const CheckList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
`;

const CheckItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #242424;
  font-size: 15px;
  font-weight: 600;
`;

const Note = styled.p`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
  margin: 28px 0 0;
  color: #5e5a55;
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
`;

const InfoIcon = styled.span`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  margin-top: 1px;
`;

const InfoStem = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Grow = styled.div`
  flex: 1;
  min-height: 32px;
`;

const ApplyButton = styled.button`
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background-color: #e88b7a;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;
