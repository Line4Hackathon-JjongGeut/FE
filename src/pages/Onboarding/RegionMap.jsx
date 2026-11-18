import { useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/auth/BackHeader.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import { updatePreferences } from "../../dummyData/onboarding/preferences.js";
import { updateDraft } from "../../dummyData/mypage/preferenceDraft.js";
import { loadKakaoMap } from "../../lib/kakaoMap.js";
import { findAddressByCoords, findCoordsByAddress } from "../../lib/kakaoAddress.js";
import { useCurrentAddress } from "../../hooks/useCurrentAddress.js";
import pinIcon from "../../assets/icons/onboarding/icon-map-pin.svg";
import locationIcon from "../../assets/icons/onboarding/icon-location.svg";

/* 지도에서 위치 확인 후 활동 지역으로 등록하는 화면 */
export default function RegionMap({ mode = "onboarding" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const startAddress = location.state?.address;

  const [address, setAddress] = useState(startAddress);
  const [isFinding, setIsFinding] = useState(false); // 지도를 옮긴 뒤 주소를 다시 찾는 중
  const [mapError, setMapError] = useState("");
  const { findCurrentAddress, isLocating, locateError } = useCurrentAddress();

  const mapBoxRef = useRef(null); 
  const mapRef = useRef(null); // 만들어진 카카오 지도

  // 처음 들어왔을 때 지도를 만들고, 고른 주소 위치로 가운데를 맞춤
  useEffect(() => {
    if (!startAddress) return undefined;
    let ignore = false;
    let map = null;

    // 지도를 끌어서 놓으면 가운데 좌표의 주소를 다시 찾음
    function handleDragStart() {
      setIsFinding(true);
    }
    function handleDragEnd() {
      const center = map.getCenter();
      findAddressByCoords(center.getLat(), center.getLng())
        .then((found) => {
          if (!ignore) setAddress(found);
        })
        .catch(() => {
          if (!ignore) setMapError("이 위치의 주소를 찾지 못했어요. 지도를 조금 옮겨 보세요.");
        })
        .finally(() => {
          if (!ignore) setIsFinding(false);
        });
    }

    async function init() {
      try {
        const kakao = await loadKakaoMap();
        // 상세 주소·현재 위치는 좌표가 이미 있고, 시·군·구만 고른 경우엔 이름으로 좌표를 찾음
        const hasCoords = startAddress.latitude != null && startAddress.longitude != null;
        const coords = hasCoords
          ? { latitude: startAddress.latitude, longitude: startAddress.longitude }
          : await findCoordsByAddress(startAddress.area ?? startAddress.road);
        if (ignore || !mapBoxRef.current) return;

        map = new kakao.maps.Map(mapBoxRef.current, {
          center: new kakao.maps.LatLng(coords.latitude, coords.longitude),
          level: hasCoords ? 3 : 7,
        });
        mapRef.current = map;
        kakao.maps.event.addListener(map, "dragstart", handleDragStart);
        kakao.maps.event.addListener(map, "dragend", handleDragEnd);
        // 시·군·구만 고른 경우에도 서버에 좌표를 같이 보낼 수 있게 채워 둠
        setAddress((prev) => ({ ...prev, latitude: coords.latitude, longitude: coords.longitude }));
      } catch {
        if (!ignore) setMapError("지도를 불러오지 못했어요. 주소는 그대로 등록할 수 있어요.");
      }
    }
    init();

    return () => {
      ignore = true;
      if (map) {
        window.kakao.maps.event.removeListener(map, "dragstart", handleDragStart);
        window.kakao.maps.event.removeListener(map, "dragend", handleDragEnd);
      }
      mapRef.current = null;
    };
  }, [startAddress]);

  // 주소 없이 주소창으로 바로 들어오면 검색 화면으로 돌려보냄
  if (!startAddress) {
    return <Navigate to={mode === "edit" ? "/mypage/preferences/region" : "/onboarding/region"} replace />;
  }

  /* 현재 GPS 위치로 지도와 주소를 같이 옮김 */
  async function handleLocate() {
    const found = await findCurrentAddress();
    if (!found) return;
    setMapError("");
    setAddress(found);
    mapRef.current?.setCenter(new window.kakao.maps.LatLng(found.latitude, found.longitude));
  }

  function handleRegister() {
    if (mode === "edit") {
      updateDraft({ region: address });
      navigate(location.state?.fromSearch ? -2 : -1);
      return;
    }
    updatePreferences({ region: address });
    navigate(-1);
  }

  // 장소로 고른 경우엔 장소 이름이 위, 주소가 아래
  const title = address.name ?? address.road;
  const subText = address.name ? address.road : address.jibun;
  const errorText = locateError || mapError;

  return (
    <Screen>
      <BackHeader title="지도에서 위치 확인" onBack={() => navigate(-1)} />

      <MapArea>
        <MapBox ref={mapBoxRef} aria-label="지도" />
        <PinGroup>
          <Tooltip>표시된 위치가 맞나요?</Tooltip>
          <img src={pinIcon} alt="" />
        </PinGroup>
        <LocateButton type="button" aria-label="현재 위치로 이동" onClick={handleLocate} disabled={isLocating}>
          <img src={locationIcon} alt="" />
        </LocateButton>
      </MapArea>

      <Sheet>
        <Road>{isFinding ? "주소 확인 중..." : title}</Road>
        {!isFinding && subText && <Jibun>{subText}</Jibun>}
        {errorText ? (
          <Notice role="alert">{errorText}</Notice>
        ) : (
          <Notice>표시된 주소가 맞는지 확인해주세요.</Notice>
        )}
        <PrimaryButton onClick={handleRegister} disabled={isFinding || isLocating}>
          이 위치로 주소 등록
        </PrimaryButton>
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

const MapArea = styled.div`
  position: relative;
  flex: 1;
  background-color: #f4efe6;
`;

const MapBox = styled.div`
  position: absolute;
  inset: 0;
`;

const PinGroup = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  transform: translate(-50%, -100%);
  /* 지도 위에 띄우고, 핀을 눌러도 지도가 끌리도록 클릭은 통과시킴 */
  z-index: 2;
  pointer-events: none;
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
  z-index: 2;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const Sheet = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  margin-top: -20px;
  padding: 24px 24px 36px;
  border-radius: 20px 20px 0 0;
  background-color: #ffffff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
  z-index: 3;
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