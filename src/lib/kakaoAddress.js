import { loadKakaoMap } from "./kakaoMap.js";
import { findRegion } from "../utils/koreaRegions.js";

export async function findCoordsByAddress(address) {
  const kakao = await loadKakaoMap();
  const geocoder = new kakao.maps.services.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.addressSearch(address, (results, status) => {
      if (status === kakao.maps.services.Status.OK && results[0]) {
        resolve({ latitude: Number(results[0].y), longitude: Number(results[0].x) });
      } else {
        reject(new Error("이 지역의 위치를 찾지 못했어요."));
      }
    });
  });
}

function toDetailedRegion({ road, jibun, name, x, y }) {
  const text = road || jibun;
  if (!text) return null;
  const [sidoName, sigunguName] = text.split(" ");
  const region = findRegion(sidoName, sigunguName);
  if (!region) return null;
  const isOnlyRegion = text.split(" ").length <= 1 + region.sigungu.split(" ").length;
  if (isOnlyRegion && !name) return null;
  return {
    ...region,
    id: `${text}-${y}-${x}`,
    name: name || undefined,
    road: text,
    jibun: road && jibun && jibun !== road ? jibun : "",
    latitude: Number(y),
    longitude: Number(x),
  };
}

export async function searchDetailedAddresses(keyword) {
  const kakao = await loadKakaoMap();
  const { Geocoder, Places, Status } = kakao.maps.services;

  // 카카오 콜백 → Promise. 결과 없음은 빈 배열, 오류는 실패로
  const byAddress = new Promise((resolve, reject) => {
    new Geocoder().addressSearch(
      keyword,
      (results, status) => (status === Status.ERROR ? reject(new Error(status)) : resolve(results ?? [])),
      { size: 10 },
    );
  });
  const byPlace = new Promise((resolve, reject) => {
    new Places().keywordSearch(
      keyword,
      (results, status) => (status === Status.ERROR ? reject(new Error(status)) : resolve(results ?? [])),
      { size: 15 },
    );
  });

  const [addressResult, placeResult] = await Promise.allSettled([byAddress, byPlace]);
  if (addressResult.status === "rejected" && placeResult.status === "rejected") {
    throw new Error("주소 검색에 실패했어요.");
  }
  const addresses = addressResult.status === "fulfilled" ? addressResult.value : [];
  const places = placeResult.status === "fulfilled" ? placeResult.value : [];

  const list = [
    ...addresses.map((item) =>
      toDetailedRegion({
        road: item.road_address?.address_name,
        jibun: item.address?.address_name ?? item.address_name,
        x: item.x,
        y: item.y,
      }),
    ),
    ...places.map((item) =>
      toDetailedRegion({
        road: item.road_address_name,
        jibun: item.address_name,
        name: item.place_name,
        x: item.x,
        y: item.y,
      }),
    ),
  ].filter(Boolean);

  return list.filter((item, index) => list.findIndex((other) => other.id === item.id) === index);
}

export async function findAddressByCoords(latitude, longitude) {
  const kakao = await loadKakaoMap();
  const geocoder = new kakao.maps.services.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.coord2Address(longitude, latitude, (results, status) => {
      const address = results?.[0]?.road_address ?? results?.[0]?.address;
      const region = address && findRegion(address.region_1depth_name, address.region_2depth_name);
      if (status === kakao.maps.services.Status.OK && region) {
        resolve({ ...region, jibun: address.address_name, latitude, longitude });
      } else {
        reject(new Error("이 위치의 주소를 찾지 못했어요."));
      }
    });
  });
}

export function getCurrentCoords() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("이 브라우저는 위치 기능을 지원하지 않아요."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}