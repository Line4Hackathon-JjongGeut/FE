import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import SecondaryButton from "../../components/auth/SecondaryButton.jsx";
import catImage from "../../assets/images/onboarding/complete-cat.svg";
import checkImage from "../../assets/images/onboarding/complete-check.svg";

/* 온보딩 마친 뒤 보여 주는 화면 */
export default function OnboardingComplete() {
  const navigate = useNavigate();

  return (
    <Screen>
      <Mascot>
        <Cat src={catImage} alt="" />
        <Check src={checkImage} alt="" />
      </Mascot>

      <Title>설정이 완료되었어요!</Title>
      <Text>{"앞으로 홈 화면에서 쫑긋이 추천해 주는\n활동을 만나 보세요!"}</Text>

      <Actions>
        {/* 나를 위한 봉사 추천 페이지 - 홈 작업 */}
        <PrimaryButton onClick={() => navigate("/recommendations", { replace: true })}>
          지금 바로 추천 활동 보러 가기
        </PrimaryButton>
        <SecondaryButton onClick={() => navigate("/", { replace: true })}>홈으로 가기</SecondaryButton>
      </Actions>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  padding: 0 24px;
  background-color: #fffcf5;
  text-align: center;
`;

const Mascot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Cat = styled.img`
  position: relative;
  z-index: 1;
  width: 57px;
  height: 72px;
`;

const Check = styled.img`
  width: 56px;
  height: 56px;
  margin-top: -11px;
`;

const Title = styled.h1`
  margin-top: 22px;
  color: #000000;
  font-size: 30px;
  font-weight: 600;
`;

const Text = styled.p`
  margin-top: 38px;
  color: #000000;
  font-size: 17px;
  line-height: 21px;
  white-space: pre-line;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 63px;
`;