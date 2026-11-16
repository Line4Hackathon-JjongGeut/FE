import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import SecondaryButton from "../../components/auth/SecondaryButton.jsx";
import { useGoBack } from "../../hooks/useGoBack.js";
import dogImage from "../../assets/images/auth/complete-dog.svg";

/* 없는 주소로 들어왔을 때 보여 주는 화면 */
export default function NotFound() {
  const navigate = useNavigate();
  const goBack = useGoBack();

  return (
    <Screen>
      <Dog src={dogImage} alt="" />
      <Title>페이지를 찾을 수 없어요</Title>
      <Text>{"주소가 잘못됐거나\n더 이상 볼 수 없는 페이지예요."}</Text>

      <Actions>
        <PrimaryButton onClick={() => navigate("/", { replace: true })}>홈으로 가기</PrimaryButton>
        <SecondaryButton onClick={() => goBack("/")}>이전 화면으로</SecondaryButton>
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

const Dog = styled.img`
  width: 64px;
`;

const Title = styled.h1`
  margin-top: 22px;
  color: #2f3833;
  font-size: 24px;
  font-weight: 700;
`;

const Text = styled.p`
  margin-top: 14px;
  color: #616161;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
  white-space: pre-line;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 48px;
`;