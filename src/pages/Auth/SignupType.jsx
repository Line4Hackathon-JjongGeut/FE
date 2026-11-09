import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/auth/BackHeader.jsx";
import UserTypeCard from "../../components/auth/UserTypeCard.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import TextLink from "../../components/auth/TextLink.jsx";
import userIcon from "../../assets/icons/auth/icon-user.svg";
import shelterIcon from "../../assets/icons/auth/icon-shelter.svg";
import infoIcon from "../../assets/icons/auth/icon-info.svg";

const USER_TYPES = [
  {
    id: "general",
    icon: userIcon,
    title: "일반 사용자",
    description: "산책, 견사 청소 봉사 등에\n참여하고 싶어요.",
  },
  {
    id: "shelter",
    icon: shelterIcon,
    title: "보호시설 운영자",
    description: "보호소 봉사 일정을 올리고\n봉사자를 관리해요.",
  },
];

/* 회원가입 첫 단계, 일반 사용자와 보호시설 운영자 중 하나 선택. */
export default function SignupType() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null);

  function handleStart() {
    // 보호시설 운영자 가입 화면은 아직 디자인이 없어서 같은 입력 화면 우선 보냄
    navigate("/signup/form", { state: { userType } });
  }

  return (
    <Screen>
      <BackHeader title="회원가입" onBack={() => navigate(-1)} />

      <Body>
        <Headline>
          쫑긋에 어떻게
          <br />
          함께 하시나요?
        </Headline>

        <Options role="radiogroup" aria-label="사용자 유형">
          {USER_TYPES.map((type) => (
            <UserTypeCard
              key={type.id}
              icon={type.icon}
              title={type.title}
              description={type.description}
              selected={userType === type.id}
              onClick={() => setUserType(type.id)}
            />
          ))}
          <Notice>
            <NoticeIcon src={infoIcon} alt="" />
            보호시설 운영자는 가입 후 시설 인증을 거쳐야 봉사 모집글을 올릴 수 있어요.
          </Notice>
        </Options>
      </Body>

      <Actions>
        <PrimaryButton disabled={!userType} onClick={handleStart}>
          시작하기
        </PrimaryButton>
        <BottomLink>
          <TextLink onClick={() => navigate("/intro")}>처음으로 돌아가기</TextLink>
        </BottomLink>
      </Actions>
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
  flex: 1;
  padding: 48px 24px 0;
`;

const Headline = styled.h2`
  color: #000000;
  font-size: 30px;
  font-weight: 600;
`;

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 19px;
  margin-top: 24px;
`;

const Notice = styled.p`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 12px 14px;
  border-radius: 10px;
  background-color: #f7f4ef;
  color: #5e5a55;
  font-size: 13px;
  line-height: 19.5px;
`;

const NoticeIcon = styled.img`
  flex-shrink: 0;
  margin-top: 2px;
`;

const Actions = styled.div`
  padding: 40px 24px 36px;
`;

const BottomLink = styled.div`
  margin-top: 18px;
`;