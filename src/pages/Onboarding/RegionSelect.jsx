import { useNavigate } from "react-router-dom";
import OnboardingStep from "../../components/onboarding/OnboardingStep.jsx";

/* 희망 지역 설정 화면 */
export default function RegionSelect() {
  const navigate = useNavigate();

  return (
    <OnboardingStep
      step={2}
      title="어디에서 활동하고 싶나요?"
      description="주로 활동 가능한 지역을 설정해 주세요."
      onPrev={() => navigate("/onboarding")}
      onNext={() => navigate("/onboarding/schedule")}
    >
      {/* TODO: 선택 영역 */}
    </OnboardingStep>
  );
}