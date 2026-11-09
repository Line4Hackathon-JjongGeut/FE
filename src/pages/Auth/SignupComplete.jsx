import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import SecondaryButton from "../../components/auth/SecondaryButton.jsx";
import dogImage from "../../assets/images/auth/complete-dog.svg";
import checkImage from "../../assets/images/auth/complete-check.svg";

/* 회원가입을 마친 뒤 보여 주는 화면. 바로 참여 조건 설정 혹은 홈으로 */
export default function SignupComplete() {
  const navigate = useNavigate();

  return (
    <Screen>
      <Mascot>
        <Dog src={dogImage} alt="" />
        <Check src={checkImage} alt="" />
      </Mascot>

      <Title>회원가입이 완료됐어요!</Title>
      <Text>
        {"이제 나에게 맞는 활동을 찾아볼까요?\n\n활동 지역, 가능한 일정 등 몇 가지 질문에 답하면\n쫑긋이 나에게 맞는 활동을 추천해 드릴게요."}
      </Text>

      <Actions>
        {/* 온보딩 화면은 다음 작업 예정 */}
        <PrimaryButton onClick={() => navigate("/onboarding")}>내 참여 조건 설정하기</PrimaryButton>
        <SecondaryButton onClick={() => navigate("/", { replace: true })}>지금은 안 할래요</SecondaryButton>
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


const Dog = styled.img`
  position: relative;
  z-index: 1;
  transform: translateX(-8px);
`;

/* 강아지 발이 원 위에 걸치도록 위로 겹침. */
const Check = styled.img`
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
  margin-top: 68px;
`;