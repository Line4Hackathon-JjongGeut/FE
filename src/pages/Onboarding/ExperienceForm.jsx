import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/auth/BackHeader.jsx";
import TextInput from "../../components/auth/TextInput.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import Section from "../../components/onboarding/Section.jsx";
import ActivityTypeChips from "../../components/onboarding/ActivityTypeChips.jsx";
import { getPreferences, updatePreferences } from "../../dummyData/onboarding/preferences.js";
import { toggleItem } from "../../utils/toggleItem.js";
import { getDraft, updateDraft } from "../../dummyData/mypage/preferenceDraft.js";

const CONTENT_MAX_LENGTH = 300;

/* 이전 봉사 경험을 적는 화면 */
export default function ExperienceForm({ mode = "onboarding" }) {
  const navigate = useNavigate();
  const isEdit = mode === "edit";
  // 이미 작성한 적이 있으면 그 내용을 불러와서 고칠 수 있도록
  const saved = isEdit ? getDraft().experience : getPreferences().experience;
  const [activityTypes, setActivityTypes] = useState(saved?.activityTypes ?? []);
  const [organization, setOrganization] = useState(saved?.organization ?? "");
  const [content, setContent] = useState(saved?.content ?? "");

  function handleSubmit() {
    const experience = { activityTypes, organization: organization.trim(), content: content.trim() };

    if (isEdit) {
      updateDraft({ experience });
      navigate(-1);
      return;
    }
    updatePreferences({ experience });
    navigate("/onboarding/activity");
  }

  return (
    <Screen>
      <BackHeader title="봉사 경험 기입" onBack={() => navigate(-1)} />

      <Body>
        <Section label="활동 유형" required hint="복수 선택 가능">
          <ActivityTypeChips
            selectedTypes={activityTypes}
            onToggle={(type) => setActivityTypes(toggleItem(activityTypes, type))}
          />
        </Section>

        <Section label="봉사 기관명">
          <InputRow>
            <TextInput
              value={organization}
              onChange={(event) => setOrganization(event.target.value)}
              placeholder="예) OO동물보호센터"
            />
          </InputRow>
        </Section>

        <Section label="봉사 경험">
          <TextArea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={CONTENT_MAX_LENGTH}
            placeholder="예) 유기견 산책 봉사에 2회 참여했고, 소형견 산책과 견사 청소를 도왔어요."
          />
          <Counter>
            {content.length}/{CONTENT_MAX_LENGTH}
          </Counter>
        </Section>
      </Body>

      <Actions>
        <PrimaryButton disabled={activityTypes.length === 0} onClick={handleSubmit}>
          작성 완료
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

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 37px;
  padding: 41px 24px 0;
`;

const InputRow = styled.div`
  display: flex;
`;

const TextArea = styled.textarea`
  height: 174px;
  padding: 14px 16px;
  border: 1.5px solid #d9d9d9;
  border-radius: 10px;
  color: #111111;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  resize: none;

  &::placeholder {
    color: #d9d9d9;
  }

  &:focus {
    border-color: #e88b7a;
    outline: none;
  }
`;

const Counter = styled.p`
  margin-top: -4px;
  color: #7d7d7d;
  font-size: 13px;
  font-weight: 500;
  text-align: right;
`;

const Actions = styled.div`
  padding: 40px 24px 36px;
`;