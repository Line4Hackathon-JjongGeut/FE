import { loadKakaoMap } from "./kakaoMap.js";

function toRegion(roadAddress, jibunAddress, latitude, longitude) {
  const base = roadAddress ?? jibunAddress;
  const road = roadAddress?.address_name ?? jibunAddress?.address_name ?? "";
  return {
    id: `${road}-${latitude}-${longitude}`,
    road,
    jibun: jibunAddress?.address_name ?? road,
    sido: base?.region_1depth_name ?? "",
    sigungu: base?.region_2depth_name ?? "",
    latitude,
    longitude,
  };
}

export async function searchAddresses(keyword) {
  const kakao = await loadKakaoMap();
  const geocoder = new kakao.maps.services.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.addressSearch(
      keyword,
      (results, status) => {
        if (status === kakao.maps.services.Status.OK) {
          resolve(results.map((item) => toRegion(item.road_address, item.address, Number(item.y), Number(item.x))));
        } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
          resolve([]);
        } else {
          reject(new Error("주소 검색에 실패했어요."));
        }
      },
      { size: 10 },
    );
  });
}

export async function findAddressByCoords(latitude, longitude) {
  const kakao = await loadKakaoMap();
  const geocoder = new kakao.maps.services.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.coord2Address(longitude, latitude, (results, status) => {
      if (status === kakao.maps.services.Status.OK && results[0]) {
        resolve(toRegion(results[0].road_address, results[0].address, latitude, longitude));
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