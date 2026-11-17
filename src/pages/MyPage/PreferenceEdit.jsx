import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/auth/BackHeader.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import Section from "../../components/onboarding/Section.jsx";
import DaySelector from "../../components/onboarding/DaySelector.jsx";
import TimeSlotCard from "../../components/onboarding/TimeSlotCard.jsx";
import SegmentedControl from "../../components/onboarding/SegmentedControl.jsx";
import ActivityTypeChips from "../../components/onboarding/ActivityTypeChips.jsx";
import RadioGroup from "../../components/onboarding/RadioGroup.jsx";
import ExperienceCard from "../../components/onboarding/ExperienceCard.jsx";
import AnimalChip from "../../components/mypage/AnimalChip.jsx";
import ConfirmModal from "../../components/mypage/ConfirmModal.jsx";
import {
  getDraft,
  updateDraft,
  saveDraft,
  discardDraft,
  isDraftChanged,
} from "../../dummyData/mypage/preferenceDraft.js";
import { TIME_SLOTS, FREQUENCIES, EXPERIENCE_LEVELS } from "../../dummyData/onboarding/preferenceOptions.js";
import { CURRENT_LOCATION } from "../../dummyData/onboarding/regionDummy.js";
import { toggleItem } from "../../utils/toggleItem.js";
import dogIcon from "../../assets/icons/mypage/animal-dog.svg";
import catIcon from "../../assets/icons/mypage/animal-cat.svg";
import pawIcon from "../../assets/icons/mypage/animal-paw.svg";
import searchIcon from "../../assets/icons/onboarding/icon-search.svg";

const ANIMALS = [
  { id: "dog", label: "강아지", icon: dogIcon, iconWidth: 29 },
  { id: "cat", label: "고양이", icon: catIcon, iconWidth: 27 },
  { id: "any", label: "둘 다 상관없어요", icon: pawIcon, iconWidth: 32 },
];

/* 마이페이지 > 추천 조건 수정 */
export default function PreferenceEdit() {
  const navigate = useNavigate();
  // 고치는 값은 화면 state와 임시 사본(draft)에 같이 넣어 둠
  const [form, setForm] = useState(() => getDraft());
  const [leaveOpen, setLeaveOpen] = useState(false);

  function change(data) {
    setForm(updateDraft(data));
  }

  const canSave = form.animal !== null && form.region !== null && form.days.length > 0;

  function handleSave() {
    saveDraft();
    // 저장 후 뒤로 가기를 눌러도 수정 화면으로 돌아오지 않도록 replace
    navigate("/mypage", { replace: true });
  }
  /* 고친 게 있으면 확인 창, 없으면 바로 나감 */
  function handleBack() {
    if (isDraftChanged()) {
      setLeaveOpen(true);
      return;
    }
    leave();
  }

  /* 고치던 사본을 버리고 들어오기 전 화면으로 */
  function leave() {
    discardDraft();
    navigate(-1);
  }

  return (
    <Screen>
      <BackHeader title="추천 조건 수정" onBack={handleBack} />

      <Body>
        <Section label="관심 동물" required>
          <AnimalGrid role="radiogroup" aria-label="관심 동물">
            {ANIMALS.map((item) => (
              <AnimalChip
                key={item.id}
                icon={item.icon}
                iconWidth={item.iconWidth}
                label={item.label}
                selected={form.animal === item.id}
                onClick={() => change({ animal: item.id })}
              />
            ))}
          </AnimalGrid>
        </Section>

        <Divider />

        <Section label="활동 지역" required>
          <RegionField type="button" onClick={() => navigate("/mypage/preferences/region")}>
            <img src={searchIcon} alt="" />
            {form.region ? (
              form.region.road.split(" ").slice(0, 2).join(" ")
            ) : (
              <Placeholder>활동 지역을 설정해 주세요</Placeholder>
            )}
          </RegionField>
          <LocateButton
            type="button"
            onClick={() => navigate("/mypage/preferences/region/map", { state: { address: CURRENT_LOCATION } })}
          >
            현재 위치로 찾기
          </LocateButton>
        </Section>

        <Divider />

        <Group $gap={40}>
          <Section label="활동 가능 요일" required>
            <DaySelector selectedDays={form.days} onToggle={(day) => change({ days: toggleItem(form.days, day) })} />
          </Section>

          <Section label="활동 가능 시간대">
            <TimeGrid>
              {TIME_SLOTS.map((slot) => (
                <TimeSlotCard
                  key={slot.id}
                  icon={slot.icon}
                  title={slot.title}
                  time={slot.time}
                  selected={form.timeSlots.includes(slot.id)}
                  onClick={() => change({ timeSlots: toggleItem(form.timeSlots, slot.id) })}
                />
              ))}
            </TimeGrid>
          </Section>

          <Section label="얼마나 자주 참여할 수 있나요?">
            <SegmentedControl
              label="참여 빈도"
              options={FREQUENCIES}
              value={form.frequency}
              onChange={(frequency) => change({ frequency })}
            />
          </Section>
        </Group>

        <Divider />

        <Group $gap={38}>
          <Section label="활동 유형">
            <ActivityTypeChips
              selectedTypes={form.activityTypes}
              onToggle={(type) => change({ activityTypes: toggleItem(form.activityTypes, type) })}
            />
          </Section>

          <Section label="봉사 경험">
            <RadioGroup
              label="봉사 경험"
              options={EXPERIENCE_LEVELS}
              value={form.experienceLevel}
              onChange={(experienceLevel) => change({ experienceLevel })}
            />
          </Section>

          <ExperienceCard
            done={form.experience !== null}
            onClick={() => navigate("/mypage/preferences/experience")}
          />
        </Group>
      </Body>

      <Actions>
        <PrimaryButton disabled={!canSave} onClick={handleSave}>
          저장하기
        </PrimaryButton>
      </Actions>
      {leaveOpen && (
        <ConfirmModal
          title="작성을 중단할까요?"
          description={"지금 중단하면\n수정 사항이 저장되지 않아요."}
          onConfirm={leave}
          onCancel={() => setLeaveOpen(false)}
        />
      )}
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #ffffff;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 27px;
  padding: 30px 24px 0;
`;

/* 구분선 없이 붙어 있는 섹션 묶음 */
const Group = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap }) => $gap}px;
`;

const Divider = styled.hr`
  margin: 0;
  border: 0;
  border-top: 1px solid #e3e3e3;
`;

const AnimalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
`;

const RegionField = styled.button`
  display: flex;
  gap: 11px;
  align-items: center;
  height: 43px;
  padding: 0 16px;
  border: 1.5px solid #d9d9d9;
  border-radius: 10px;
  background-color: #ffffff;
  color: #444444;
  font-size: 15px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;

  img {
    width: 16px;
    height: 16px;
  }
`;

const Placeholder = styled.span`
  color: #b0b0b0;
  font-weight: 500;
`;

const LocateButton = styled.button`
  height: 43px;
  border: 1.5px solid #d9d9d9;
  border-radius: 10px;
  background-color: #ffffff;
  color: #2f3833;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const TimeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 14px;
`;

const Actions = styled.div`
  padding: 50px 24px 36px;
`;