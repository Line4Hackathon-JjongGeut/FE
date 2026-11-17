import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { getPreferences } from "../../dummyData/onboarding/preferences.js";
import { startDraft } from "../../dummyData/mypage/preferenceDraft.js";
import { formatPreferenceSummary } from "../../utils/preferenceSummary.js";
import filterIcon from "../../assets/icons/home/icon-filter.svg";
import catImage from "../../assets/images/onboarding/animal-cat.svg";

/* "내 참여 조건" 박스. 조건이 있으면 마이페이지 추천 조건 수정으로, 없으면 온보딩으로 */
export default function PreferenceSummary() {
  const navigate = useNavigate();
  const summary = formatPreferenceSummary(getPreferences());

  function openPreferenceEdit() {
    startDraft();
    navigate("/mypage/preferences");
  }

  if (!summary) {
    return (
      <Box type="button" onClick={() => navigate("/onboarding")}>
        <Cat src={catImage} alt="" />
        <Text>
          <EmptyTitle>온보딩이 완료되지 않았어요!</EmptyTitle>
          <Summary>참여 조건을 설정해 주세요</Summary>
        </Text>
        <Arrow aria-hidden>›</Arrow>
      </Box>
    );
  }

  return (
    <Box type="button" aria-label="내 참여 조건 수정하기" onClick={openPreferenceEdit}>
      <Text>
        <Label>내 참여 조건</Label>
        <Summary>{summary}</Summary>
      </Text>
      <img src={filterIcon} alt="" />
    </Box>
  );
}

const Box = styled.button`
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  min-height: 62px;
  padding: 10px 13px 10px 14px;
  border: 0;
  border-radius: 10px;
  background-color: #f7f1e7;
  text-align: left;
  cursor: pointer;
`;

const Text = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Label = styled.span`
  color: #4f7a5f;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: -0.5px;
`;

const Summary = styled.span`
  color: #2f3833;
  font-size: 14px;
  font-weight: 600;
`;

const Cat = styled.img`
  flex-shrink: 0;
  width: 38px;
`;

const EmptyTitle = styled.span`
  color: #4f7a5f;
  font-size: 12px;
  font-weight: 700;
`;

const Arrow = styled.span`
  color: #4f7a5f;
  font-size: 20px;
`;