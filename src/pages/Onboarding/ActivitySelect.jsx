import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import OnboardingStep from "../../components/onboarding/OnboardingStep.jsx";
import Section from "../../components/onboarding/Section.jsx";
import ActivityTypeChips from "../../components/onboarding/ActivityTypeChips.jsx";
import RadioGroup from "../../components/onboarding/RadioGroup.jsx";
import ExperienceCard from "../../components/onboarding/ExperienceCard.jsx";
import { getPreferences, updatePreferences } from "../../dummyData/onboarding/preferences.js";
import { useGoBack } from "../../hooks/useGoBack.js";
import { toggleItem } from "../../utils/toggleItem.js";
import { EXPERIENCE_LEVELS } from "../../dummyData/onboarding/preferenceOptions.js";
import { updateMyProfile, createVolunteerExperience } from "../../api/profile.js";
import { toProfileRequest, toExperienceRequest } from "../../utils/profileMapper.js";

/* 온보딩에서 고른 값을 서버에 저장. 봉사 경험을 적었으면 경험도 같이 저장 */
async function saveOnboarding(preferences) {
  await updateMyProfile(toProfileRequest(preferences));

  // 이미 저장한 경험과 같은 글이면 다시 보내지 않음 (완료 화면에서 뒤로 왔다가 또 누른 경우)
  const { experience, savedExperience } = preferences;
  if (experience && experience !== savedExperience) {
    await createVolunteerExperience(toExperienceRequest(experience));
    updatePreferences({ savedExperience: experience });
  }
}

export default function ActivitySelect() {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const [activityTypes, setActivityTypes] = useState(() => getPreferences().activityTypes);
  const [experienceLevel, setExperienceLevel] = useState(() => getPreferences().experienceLevel);
  const hasExperience = getPreferences().experience !== null;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const canNext = activityTypes.length > 0 && experienceLevel !== null;

  function saveSelections() {
    updatePreferences({ activityTypes, experienceLevel });
  }

  async function handleNext() {
    saveSelections();
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await saveOnboarding(getPreferences());
      navigate("/onboarding/complete");
    } catch (error) {
      // status가 없으면 서버까지 못 간 것 (인터넷 끊김 등)
      setSubmitError(
        error.status
          ? "저장하지 못했어요. 잠시 후 다시 시도해 주세요."
          : "인터넷 연결을 확인하고 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function openExperienceForm() {
    saveSelections();
    navigate("/onboarding/experience");
  }

  return (
    <OnboardingStep
      step={4}
      title={"어떤 봉사 활동에\n관심 있나요?"}
      onPrev={() => goBack("/onboarding/schedule")}
      onNext={handleNext}
      nextLabel={isSubmitting ? "저장 중..." : "입력 완료"}
      nextDisabled={!canNext || isSubmitting}
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

        {submitError && <ErrorText role="alert">{submitError}</ErrorText>}
      </Sections>
    </OnboardingStep>
  );
}

const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 38px;
`;

const ErrorText = styled.p`
  margin-top: -20px;
  color: #d9534f;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
`;