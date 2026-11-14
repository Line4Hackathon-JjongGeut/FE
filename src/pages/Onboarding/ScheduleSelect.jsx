import { useNavigate } from "react-router-dom";
import OnboardingStep from "../../components/onboarding/OnboardingStep.jsx";

/* 활동 일정 설정 화면 */
export default function ScheduleSelect() {
  const navigate = useNavigate();

  return (
    <OnboardingStep
      step={3}
      title="언제 활동할 수 있나요?"
      description="가능한 요일과 시간대를 모두 골라주세요."
      onPrev={() => navigate("/onboarding/region")}
      onNext={() => navigate("/onboarding/activity")}
    >
      {/* TODO: 선택 영역 */}
    </OnboardingStep>
  );
}