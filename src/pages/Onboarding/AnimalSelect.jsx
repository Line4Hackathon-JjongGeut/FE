import { useNavigate } from "react-router-dom";
import OnboardingStep from "../../components/onboarding/OnboardingStep.jsx";

/* 관심 동물 선택 화면 */
export default function AnimalSelect() {
  const navigate = useNavigate();

  return (
    <OnboardingStep
      step={1}
      title="어떤 동물과 함께하고 싶나요?"
      description="관심 있는 동물을 선택해 주세요."
      onNext={() => navigate("/onboarding/region")}
    >
      {/* TODO: 선택 영역 */}
    </OnboardingStep>
  );
}