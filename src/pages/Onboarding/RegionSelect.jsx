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
import { searchRegions } from "../../utils/koreaRegions.js";
import { useCurrentAddress } from "../../hooks/useCurrentAddress.js";
import { searchDetailedAddresses } from "../../lib/kakaoAddress.js";
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

  const [search, setSearch] = useState({
    keyword: "",
    failed: false,
    results: [],
  });

  const keyword = query.trim();

  useEffect(() => {
    if (!keyword) return undefined;
    let ignore = false;
    const timer = setTimeout(() => {
      searchDetailedAddresses(keyword)
        .then((results) => {
          if (!ignore) setSearch({ keyword, failed: false, results });
        })
        .catch(() => {
          if (!ignore) setSearch({ keyword, failed: true, results: [] });
        });
    }, 300);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [keyword]);

  const regions = keyword ? searchRegions(keyword).slice(0, 5) : [];
  const isSearching = keyword !== "" && search.keyword !== keyword;
  const details = !isSearching && keyword ? search.results : [];
  const searchFailed = !isSearching && keyword !== "" && search.failed;
  const isEmpty =
    keyword !== "" &&
    !isSearching &&
    !searchFailed &&
    regions.length === 0 &&
    details.length === 0;
  const results = [...regions, ...details];
  // 지금 등록된 주소가 검색 결과에 없으면 맨 위에 따로 보여 줌
  const showCurrent = region && !results.some((item) => item.id === region.id);

  async function handleLocate() {
    const address = await findCurrentAddress();
    if (address) openMap(address);
  }

  function openMap(address) {
    setSearchParams(query ? { q: query } : {}, { replace: true });
    if (isEdit) {
      navigate("/mypage/preferences/region/map", {
        state: { address, fromSearch: true },
      });
    } else {
      navigate("/onboarding/region/map", { state: { address } });
    }
  }

  const content = (
    <>
      <SearchArea>
        <Section label="활동 지역">
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery("")}
            placeholder="지역, 도로명, 장소로 검색 (예: 경기, 망원로)"
          />
          <LocateButton
            type="button"
            onClick={handleLocate}
            disabled={isLocating}
          >
            <img src={locationIcon} alt="" />
            {isLocating ? "현재 위치 확인 중..." : "현재 위치로 찾기"}
          </LocateButton>
          {locateError && <ErrorText role="alert">{locateError}</ErrorText>}
        </Section>
      </SearchArea>

      <Results>
        {showCurrent && (
          <AddressItem
            address={region}
            selected
            onClick={() => openMap(region)}
          />
        )}

        {results.map((address) => (
          <AddressItem
            key={address.id}
            address={address}
            selected={region?.id === address.id}
            onClick={() => openMap(address)}
          />
        ))}

        {isSearching && <Empty>상세 주소를 찾는 중...</Empty>}
        {searchFailed && (
          <Empty>
            상세 주소를 불러오지 못했어요. 잠시 후 다시 검색해 주세요.
          </Empty>
        )}
        {isEmpty && (
          <Empty>
            검색 결과가 없어요. 지역, 도로명, 장소 이름으로 다시 검색해 주세요.
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

const SearchArea = styled.div`
  position: sticky;
  top: 0;
  z-index: 1;
  margin-top: -12px;
  padding: 12px 0;
  background-color: #ffffff;
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
  margin-top: 17px;
`;

const Empty = styled.p`
  color: #8a8a8a;
  font-size: 14px;
`;
