const SDK_URL = "https://dapi.kakao.com/v2/maps/sdk.js";

let loading = null;

/* 카카오 지도 스크립트를 한 번만 불러오고, 준비되면 kakao 객체를 돌려줍니다. */
export function loadKakaoMap() {
  const appkey = import.meta.env.VITE_KAKAO_MAP_KEY;
  if (!appkey) return Promise.reject(new Error("카카오 지도 키가 없습니다."));

  if (window.kakao?.maps?.load) {
    return new Promise((resolve) => {
      window.kakao.maps.load(() => resolve(window.kakao));
    });
  }

  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${SDK_URL}?appkey=${encodeURIComponent(appkey)}&autoload=false&libraries=services`;
      script.async = true;
      script.onload = () => {
        if (!window.kakao?.maps?.load) {
          reject(new Error("카카오 지도를 불러오지 못했습니다."));
          return;
        }
        window.kakao.maps.load(() => resolve(window.kakao));
      };
      script.onerror = () => reject(new Error("카카오 지도를 불러오지 못했습니다."));
      document.head.appendChild(script);
    }).catch((error) => {
      loading = null;
      throw error;
    });
  }

  return loading;
}
