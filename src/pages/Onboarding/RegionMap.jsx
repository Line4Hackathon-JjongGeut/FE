import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/auth/BackHeader.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import { updatePreferences } from "../../dummyData/onboarding/preferences.js";
import { CURRENT_LOCATION } from "../../dummyData/onboarding/regionDummy.js";
import pinIcon from "../../assets/icons/onboarding/icon-map-pin.svg";
import locationIcon from "../../assets/icons/onboarding/icon-location.svg";

/* 지도에서 위치 확인 후 활동 지역으로 등록하는 화면 */
export default function RegionMap() {
  const navigate = useNavigate();
  const location = useLocation();
  const [address, setAddress] = useState(location.state?.address ?? CURRENT_LOCATION);

  function handleRegister() {
    updatePreferences({ region: address });
    navigate(-1);
  }

  return (
    <Screen>
      <BackHeader title="지도에서 위치 확인" onBack={() => navigate(-1)} />

      <MapArea aria-label="지도 영역">
        <PinGroup>
          <Tooltip>표시된 위치가 맞나요?</Tooltip>
          <img src={pinIcon} alt="" />
        </PinGroup>
        {/* TODO: 지도 API로 실제 현재 위치 가져오기 */}
        <LocateButton type="button" aria-label="현재 위치로 이동" onClick={() => setAddress(CURRENT_LOCATION)}>
          <img src={locationIcon} alt="" />
        </LocateButton>
      </MapArea>

      <Sheet>
        <Road>{address.road}</Road>
        <Jibun>{address.jibun}</Jibun>
        <Notice>표시된 주소가 맞는지 확인해주세요.</Notice>
        <PrimaryButton onClick={handleRegister}>이 위치로 주소 등록</PrimaryButton>
      </Sheet>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  background-color: #ffffff;
`;

/* 지도 자리 */
const MapArea = styled.div`
  position: relative;
  flex: 1;
  background-color: #f4efe6;
  background-image:
    linear-gradient(90deg, transparent 46%, #ffffff 46%, #ffffff 54%, transparent 54%),
    linear-gradient(0deg, transparent 46%, #ffffff 46%, #ffffff 54%, transparent 54%);
  background-position: center;
  background-size: 150px 150px;
`;

/* 핀 끝이 지도 정가운데를 가리키도록 위로 올림 */
const PinGroup = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  transform: translate(-50%, -100%);
`;

const Tooltip = styled.p`
  position: relative;
  padding: 9px 14px;
  border-radius: 8px;
  background-color: #2b2b2b;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;

  /* 말풍선 아래 꼬리 */
  &::after {
    position: absolute;
    bottom: -6px;
    left: 50%;
    border-width: 6px 6px 0;
    border-style: solid;
    border-color: #2b2b2b transparent transparent;
    content: "";
    transform: translateX(-50%);
  }
`;

const LocateButton = styled.button`
  position: absolute;
  right: 16px;
  bottom: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
`;

/* 지도 위로 올라오는 하단 시트 */
const Sheet = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  margin-top: -20px;
  padding: 24px 24px 36px;
  border-radius: 20px 20px 0 0;
  background-color: #ffffff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
`;

const Road = styled.p`
  color: #111111;
  font-size: 18px;
  font-weight: 700;
`;

const Jibun = styled.p`
  margin-top: 6px;
  color: #555555;
  font-size: 15px;
`;

const Notice = styled.p`
  margin: 20px 0 16px;
  padding: 12px;
  border-radius: 8px;
  background-color: #fdeceb;
  color: #e5534b;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
`;