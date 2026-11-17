import styled from "styled-components";
import chevronIcon from "../../assets/icons/onboarding/icon-chevron-right.svg";
import doneIcon from "../../assets/icons/onboarding/icon-check-done.svg";

/* 봉사 경험 작성 화면으로 가는 카드. 작성을 마치면 제목과 오른쪽 아이콘 바뀜. */
export default function ExperienceCard({ done, onClick }) {
  return (
    <Card type="button" onClick={onClick}>
      <Text>
        <Title>
          {done ? (
            "봉사 경험 작성 완료"
          ) : (
            <>
              이전 봉사 경험 작성하기 <Optional>(선택)</Optional>
            </>
          )}
        </Title>
        <Description>활동했던 기관과 경험을 자세히 알려주세요.</Description>
      </Text>
      {done ? (
        <DoneIcon src={doneIcon} alt="" />
      ) : (
        <img src={chevronIcon} alt="" />
      )}
    </Card>
  );
}

const Card = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 73px;
  padding: 0 16px 0 18px;
  border: 1.5px solid #d9d9d9;
  border-radius: 10px;
  background-color: #ffffff;
  text-align: left;
  cursor: pointer;
`;

const DoneIcon = styled.img`
  flex-shrink: 0;
  width: 27px;
  height: 27px;
`;

const Text = styled.span`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Title = styled.span`
  color: #000000;
  font-size: 15px;
  font-weight: 600;
`;

const Optional = styled.span`
  color: #a1a1a1;
  font-size: 13px;
`;

const Description = styled.span`
  color: #868686;
  font-size: 12px;
  font-weight: 500;
`;
