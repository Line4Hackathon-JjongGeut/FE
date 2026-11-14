import { useNavigate } from "react-router-dom";
import OnboardingStep from "../../components/onboarding/OnboardingStep.jsx";

/* 관심 활동 선택 화면 */
export default function ActivitySelect() {
  const navigate = useNavigate();

  return (
    <OnboardingStep
      step={4}
      title={"어떤 봉사 활동에\n관심 있나요?"}
      onPrev={() => navigate("/onboarding/schedule")}
      onNext={() => navigate("/onboarding/complete")}
      nextLabel="입력 완료"
    >
      {/* TODO: 선택 영역 */}
    </OnboardingStep>
  );
}