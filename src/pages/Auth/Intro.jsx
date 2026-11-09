import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import IntroHero from "../../components/auth/IntroHero.jsx";
import IntroSlide from "../../components/auth/IntroSlide.jsx";
import PageDots from "../../components/auth/PageDots.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import greenCircleImage from "../../assets/images/auth/intro-circle-green.svg";
import catImage from "../../assets/images/auth/intro-cat.svg";
import pinkCircleImage from "../../assets/images/auth/intro-circle-pink.svg";
import dogImage from "../../assets/images/auth/intro-dog.svg";

/* 1번은 IntroHero / 2,3번은 아래 내용을 IntroSlide */
const SLIDES = [
  {
    circle: greenCircleImage,
    image: catImage,
    title: "나에게 맞는 활동을\n쉽게 찾아보세요!",
    titleColor: "#27371c",
    description: "관심 있는 동물과 지역, 가능한 일정에 맞춰\n쫑긋이 활동을 추천해 드려요.",
  },
  {
    circle: pinkCircleImage,
    image: dogImage,
    title: "작은 관심이 따뜻한\n변화로 이어지도록",
    titleColor: "#2e2121",
    description: "마음에 드는 봉사를 신청하고,\n직접 참여해 변화를 만들어 주세요.",
  },
];

const TOTAL = SLIDES.length + 1;
const SWIPE_DISTANCE = 50;

/* 서비스 소개 1~3 화면. 좌우로 밀거나 점을 눌러 넘기게 */
export default function Intro() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const startX = useRef(null);

  function handlePointerDown(event) {
    startX.current = event.clientX;
  }

  function handlePointerUp(event) {
    if (startX.current === null) return;
    const distance = event.clientX - startX.current;
    startX.current = null;

    if (distance < -SWIPE_DISTANCE && step < TOTAL - 1) setStep(step + 1);
    if (distance > SWIPE_DISTANCE && step > 0) setStep(step - 1);
  }

  return (
    <Screen>
      <Content onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}>
        <SlideArea>{step === 0 ? <IntroHero /> : <IntroSlide {...SLIDES[step - 1]} />}</SlideArea>
        <DotsArea>
          <PageDots total={TOTAL} current={step} onSelect={setStep} />
        </DotsArea>
      </Content>

      <Actions>
        <PrimaryButton onClick={() => navigate("/signup")}>시작하기</PrimaryButton>
        <LoginPrompt>
          이미 계정이 있으신가요?
          <LoginLink type="button" onClick={() => navigate("/login")}>
            로그인하기
          </LoginLink>
        </LoginPrompt>
      </Actions>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #fffcf5;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  touch-action: pan-y;
  user-select: none;

  /* 이미지를 끌면 브라우저가 이미지 드래그로 처리해서 스와이프가 끊기므로 막아 둡니다. */
  img {
    pointer-events: none;
  }
`;

/* 화면마다 높이가 달라도 점 위치가 흔들리지 않게 높이를 고정 */
const SlideArea = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 360px;
`;

const DotsArea = styled.div`
  margin-top: 86px;
`;

const Actions = styled.div`
  padding: 0 24px 36px;
`;

const LoginPrompt = styled.p`
  margin-top: 19px;
  color: #403a38;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
`;

const LoginLink = styled.button`
  margin-left: 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #e88b7a;
  font-size: 14px;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
`;