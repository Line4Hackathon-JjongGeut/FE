import styled from "styled-components";
import ProgressBar from "./ProgressBar.jsx";
import PrimaryButton from "../auth/PrimaryButton.jsx";

const TOTAL_STEPS = 4;

/* 진행바 + 제목·설명 + 내용(children) + 하단 버튼 */
export default function OnboardingStep({
  step,
  title,
  description,
  children,
  onPrev,
  onNext,
  nextLabel = "다음",
  nextDisabled = false,
}) {
  return (
    <Screen>
      <Top>
        <ProgressBar current={step} total={TOTAL_STEPS} />
      </Top>

      <Body>
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
        <Content>{children}</Content>
      </Body>

      <Actions>
        {onPrev && (
          <PrevButton type="button" onClick={onPrev}>
            이전
          </PrevButton>
        )}
        <PrimaryButton onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </PrimaryButton>
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

const Top = styled.div`
  padding: 72px 24px 0;
`;

const Body = styled.div`
  flex: 1;
  padding: 0 24px;
`;

const Title = styled.h1`
  margin-top: 41px;
  color: #000000;
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.02em;
  white-space: pre-line;
  /* 줄이 넘칠 때 글자 중간이 아니라 단어 단위로 넘어가게 */
  word-break: keep-all;
`;

const Description = styled.p`
  margin-top: 14px;
  color: #676767;
  font-size: 16px;
  line-height: 22px;
`;

const Content = styled.div`
  margin-top: 36px;
`;

const Actions = styled.div`
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
  gap: 11px;
  position: sticky;
  bottom: 0;
  z-index: 1;
  margin-top: 24px;
  padding: 16px 24px 36px;
  background-color: #ffffff;
`;

const PrevButton = styled.button`
  height: 44px;
  border: 2px solid #d9d9d9;
  border-radius: 10px;
  background-color: #ffffff;
  color: #382f2f;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;