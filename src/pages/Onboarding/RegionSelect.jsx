import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import OnboardingStep from "../../components/onboarding/OnboardingStep.jsx";
import BackHeader from "../../components/auth/BackHeader.jsx";
import Section from "../../components/onboarding/Section.jsx";
import SearchInput from "../../components/onboarding/SearchInput.jsx";
import AddressItem from "../../components/onboarding/AddressItem.jsx";
import { getPreferences } from "../../dummyData/onboarding/preferences.js";
import { useGoBack } from "../../hooks/useGoBack.js";
import { getDraft } from "../../dummyData/mypage/preferenceDraft.js";
import {
  CURRENT_LOCATION,
  searchAddresses,
} from "../../dummyData/onboarding/regionDummy.js";
import locationIcon from "../../assets/icons/onboarding/icon-location.svg";

/* 희망 지역 설정 화면 */
export default function RegionSelect({ mode = "onboarding" }) {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const isEdit = mode === "edit";

  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const region = isEdit ? getDraft().region : getPreferences().region;

  // 검색어가 없으면 이미 등록한 주소만, 있으면 검색 결과
  const addresses = query.trim()
    ? searchAddresses(query)
    : region
      ? [region]
      : [];

  function openMap(address) {
    setSearchParams(query ? { q: query } : {}, { replace: true });
    if (isEdit) {
      navigate("/mypage/preferences/region/map", { state: { address, fromSearch: true } });
    } else {
      navigate("/onboarding/region/map", { state: { address } });
    }
  }

  const content = (
    <>
      <Section label="활동 지역">
        <SearchInput
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery("")}
          placeholder="동·읍·면으로 검색"
        />
        <LocateButton type="button" onClick={() => openMap(CURRENT_LOCATION)}>
          <img src={locationIcon} alt="" />
          현재 위치로 찾기
        </LocateButton>
      </Section>

      <Results>
        {addresses.map((address) => (
          <AddressItem
            key={address.id}
            address={address}
            selected={region?.id === address.id}
            onClick={() => openMap(address)}
          />
        ))}
        {query.trim() && addresses.length === 0 && (
          <Empty>
            검색 결과가 없어요. 동·읍·면 이름으로 다시 검색해 주세요.
          </Empty>
        )}
      </Results>
    </>
  );

  if (isEdit) {
    return (
      <EditScreen>
        <BackHeader title="활동 지역 설정" onBack={() => navigate(-1)} />
        <EditBody>{content}</EditBody>
      </EditScreen>
    );
  }

  return (
    <OnboardingStep
      step={2}
      title="어디에서 활동하고 싶나요?"
      description="주로 활동 가능한 지역을 설정해 주세요."
      onPrev={() => goBack("/onboarding")}
      onNext={() => navigate("/onboarding/schedule")}
      nextDisabled={!region}
    >
      {content}
    </OnboardingStep>
  );
}

const EditScreen = styled.div`
  min-height: 100dvh;
  background-color: #ffffff;
`;

const EditBody = styled.div`
  padding: 30px 24px 40px;
`;

const LocateButton = styled.button`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  height: 48px;
  border: 1px solid #e6ddce;
  border-radius: 10px;
  background-color: #ffffff;
  color: #2f3833;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`;

const Results = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 29px;
`;

const Empty = styled.p`
  color: #8a8a8a;
  font-size: 14px;
`;