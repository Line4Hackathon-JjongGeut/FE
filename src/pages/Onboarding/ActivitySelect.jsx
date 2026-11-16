import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import OnboardingStep from "../../components/onboarding/OnboardingStep.jsx";
import Section from "../../components/onboarding/Section.jsx";
import ActivityTypeChips from "../../components/onboarding/ActivityTypeChips.jsx";
import RadioGroup from "../../components/onboarding/RadioGroup.jsx";
import ExperienceCard from "../../components/onboarding/ExperienceCard.jsx";
import { getPreferences, updatePreferences } from "../../dummyData/onboarding/preferences.js";
import { toggleItem } from "../../utils/toggleItem.js";
import { EXPERIENCE_LEVELS } from "../../dummyData/onboarding/preferenceOptions.js";

/* 관심 활동 선택 화면 */
export default function ActivitySelect() {
  const navigate = useNavigate();
  const [activityTypes, setActivityTypes] = useState(() => getPreferences().activityTypes);
  const [experienceLevel, setExperienceLevel] = useState(() => getPreferences().experienceLevel);
  const hasExperience = getPreferences().experience !== null;

  const canNext = activityTypes.length > 0 && experienceLevel !== null;

  function saveSelections() {
    updatePreferences({ activityTypes, experienceLevel });
  }

  function handleNext() {
    saveSelections();
    navigate("/onboarding/complete");
  }

  function openExperienceForm() {
    saveSelections();
    navigate("/onboarding/experience");
  }

  return (
    <OnboardingStep
      step={4}
      title={"어떤 봉사 활동에\n관심 있나요?"}
      onPrev={() => navigate("/onboarding/schedule")}
      onNext={handleNext}
      nextLabel="입력 완료"
      nextDisabled={!canNext}
    >
      <Sections>
        <Section label="활동 유형">
          <ActivityTypeChips
            selectedTypes={activityTypes}
            onToggle={(type) => setActivityTypes(toggleItem(activityTypes, type))}
          />
        </Section>

        <Section label="봉사 경험">
          <RadioGroup
            label="봉사 경험"
            options={EXPERIENCE_LEVELS}
            value={experienceLevel}
            onChange={setExperienceLevel}
          />
        </Section>

        <ExperienceCard done={hasExperience} onClick={openExperienceForm} />
      </Sections>
    </OnboardingStep>
  );
}

const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 38px;
`;