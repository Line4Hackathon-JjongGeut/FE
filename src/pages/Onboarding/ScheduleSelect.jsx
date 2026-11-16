import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import OnboardingStep from "../../components/onboarding/OnboardingStep.jsx";
import Section from "../../components/onboarding/Section.jsx";
import DaySelector from "../../components/onboarding/DaySelector.jsx";
import TimeSlotCard from "../../components/onboarding/TimeSlotCard.jsx";
import SegmentedControl from "../../components/onboarding/SegmentedControl.jsx";
import {
  getPreferences,
  updatePreferences,
} from "../../dummyData/onboarding/preferences.js";

import { toggleItem } from "../../utils/toggleItem.js";
import { TIME_SLOTS, FREQUENCIES } from "../../dummyData/onboarding/preferenceOptions.js";

/* 활동 일정 설정 화면 */
export default function ScheduleSelect() {
  const navigate = useNavigate();
  const [days, setDays] = useState(() => getPreferences().days);
  const [timeSlots, setTimeSlots] = useState(() => getPreferences().timeSlots);
  const [frequency, setFrequency] = useState(() => getPreferences().frequency);

  const canNext = days.length > 0 && timeSlots.length > 0 && frequency !== null;

  function handleNext() {
    updatePreferences({ days, timeSlots, frequency });
    navigate("/onboarding/activity");
  }

  return (
    <OnboardingStep
      step={3}
      title="언제 활동할 수 있나요?"
      description="가능한 요일과 시간대를 모두 골라주세요."
      onPrev={() => navigate("/onboarding/region")}
      onNext={handleNext}
      nextDisabled={!canNext}
    >
      <Sections>
        <Section label="활동 가능 요일">
          <DaySelector
            selectedDays={days}
            onToggle={(day) => setDays(toggleItem(days, day))}
          />
        </Section>

        <Section label="활동 가능 시간대">
          <TimeGrid>
            {TIME_SLOTS.map((slot) => (
              <TimeSlotCard
                key={slot.id}
                icon={slot.icon}
                title={slot.title}
                time={slot.time}
                selected={timeSlots.includes(slot.id)}
                onClick={() => setTimeSlots(toggleItem(timeSlots, slot.id))}
              />
            ))}
          </TimeGrid>
        </Section>

        <Section label="얼마나 자주 참여할 수 있나요?">
          <SegmentedControl
            label="참여 빈도"
            options={FREQUENCIES}
            value={frequency}
            onChange={setFrequency}
          />
        </Section>
      </Sections>
    </OnboardingStep>
  );
}

const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const TimeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 14px;
`;
