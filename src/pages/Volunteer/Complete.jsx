import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import catIcon from "../../assets/icons/volunteer/cat-badge.svg";
import catCircleIcon from "../../assets/icons/volunteer/cat.svg";

/* 접수 신청을 마친 뒤 보여 주는 완료 화면입니다. */
export default function Complete() {
  const navigate = useNavigate();

  return (
    <Screen>
      <Center>
        <Mascot>
          <img src={catIcon} alt="" />
          <Circle src={catCircleIcon} alt="" />
        </Mascot>
        <Title>접수가 신청됐어요!</Title>
        <Text>
          보호시설이 신청 내용을 확인한 뒤
          <br />
          승인 결과를 알려드릴게요
        </Text>
      </Center>

      <Actions>
        <Primary type="button" onClick={() => navigate("/activities")}>
          문의 내역 보기
        </Primary>
        <HomeLink type="button" onClick={() => navigate("/")}>
          홈으로 돌아가기
        </HomeLink>
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

const Center = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  text-align: center;
`;

const Mascot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Circle = styled.img`
  margin-top: -22px;
`;

const Title = styled.h1`
  margin: 18px 0 0;
  color: #2f3833;
  font-size: 26px;
  font-weight: 700;
  line-height: 33px;
`;

const Text = styled.p`
  margin: 8px 0 0;
  color: #535353;
  font-size: 18px;
  font-weight: 500;
  line-height: 26px;
`;

const Actions = styled.div`
  padding: 0 24px 36px;
`;

const Primary = styled.button`
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

const HomeLink = styled.button`
  display: block;
  width: 100%;
  margin-top: 18px;
  border: 0;
  background: transparent;
  color: #403a38;
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
`;
