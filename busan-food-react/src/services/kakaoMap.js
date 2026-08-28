import { APP_CONFIG } from "../config";

let kakaoSdkPromise = null;

export function loadKakaoSdk() {
  if (window.kakao?.maps) return Promise.resolve(window.kakao);
  if (kakaoSdkPromise) return kakaoSdkPromise;

  const key = String(APP_CONFIG.KAKAO_JAVASCRIPT_KEY || "").trim();

  if (!key || key === "YOUR_KAKAO_JAVASCRIPT_KEY") {
    const error = new Error("KAKAO_KEY_MISSING");
    error.code = "KAKAO_KEY_MISSING";
    return Promise.reject(error);
  }

  kakaoSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false&libraries=clusterer`;
    script.async = true;

    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new Error("Kakao Maps SDK unavailable"));
        return;
      }
      window.kakao.maps.load(() => resolve(window.kakao));
    };

    script.onerror = () => reject(new Error("Failed to load Kakao Maps SDK"));
    document.head.appendChild(script);
  });

  return kakaoSdkPromise;
}
