import { useEffect, useState } from "react";
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
import { searchAddresses } from "../../lib/kakaoAddress.js";
import { useCurrentAddress } from "../../hooks/useCurrentAddress.js";
import locationIcon from "../../assets/icons/onboarding/icon-location.svg";

/* 희망 지역 설정 화면 */
export default function RegionSelect({ mode = "onboarding" }) {
  const navigate = useNavigate();
  const goBack = useGoBack();
  const isEdit = mode === "edit";

  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const region = isEdit ? getDraft().region : getPreferences().region;

  const { findCurrentAddress, isLocating, locateError } = useCurrentAddress();
  // 마지막으로 검색한 결과
  const [search, setSearch] = useState({ keyword: "", status: "done", results: [] });

  // 검색어가 바뀌고 0.3초 동안 더 안 바뀌면 카카오에 주소 검색 
  useEffect(() => {
    const keyword = query.trim();
    if (!keyword) return undefined;

    let ignore = false;
    const timer = setTimeout(() => {
      setSearch({ keyword, status: "loading", results: [] });
      searchAddresses(keyword)
        .then((results) => {
          if (!ignore) setSearch({ keyword, status: "done", results });
        })
        .catch(() => {
          if (!ignore) setSearch({ keyword, status: "error", results: [] });
        });
    }, 300);

    // 다음 글자를 치면 이전 타이머와 늦게 온 결과는 버림
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query]);

  const keyword = query.trim();
  // 지금 검색어의 결과가 아직 안 왔으면 "찾는 중"으로 봄
  const isSearching = keyword !== "" && (search.keyword !== keyword || search.status === "loading");
  const searchFailed = keyword !== "" && search.keyword === keyword && search.status === "error";

  // 검색어가 없으면 이미 등록한 주소만, 있으면 검색 결과
  let addresses = [];
  if (!keyword) addresses = region ? [region] : [];
  else if (!isSearching) addresses = search.results;

  async function handleLocate() {
    const address = await findCurrentAddress();
    if (address) openMap(address);
  }

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
        <LocateButton type="button" onClick={handleLocate} disabled={isLocating}>
          <img src={locationIcon} alt="" />
          {isLocating ? "현재 위치 확인 중..." : "현재 위치로 찾기"}
        </LocateButton>
        {locateError && <ErrorText role="alert">{locateError}</ErrorText>}
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
        {isSearching && <Empty>주소를 찾고 있어요...</Empty>}
        {searchFailed && <Empty>주소를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</Empty>}
        {keyword && !isSearching && !searchFailed && addresses.length === 0 && (
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

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const ErrorText = styled.p`
  color: #d9534f;
  font-size: 12px;
  font-weight: 600;
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