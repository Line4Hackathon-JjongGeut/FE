import { useState } from "react";
import { findAddressByCoords, getCurrentCoords } from "../lib/kakaoAddress.js";

/* "현재 위치로 찾기" 버튼용 */
export function useCurrentAddress() {
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState("");

  async function findCurrentAddress() {
    setIsLocating(true);
    setLocateError("");
    try {
      const { latitude, longitude } = await getCurrentCoords();
      return await findAddressByCoords(latitude, longitude);
    } catch (error) {
      setLocateError(
        error.code === 1
          ? "위치 권한이 꺼져 있어요. 주소창 왼쪽 설정에서 위치를 허용해 주세요."
          : "현재 위치를 찾지 못했어요. 주소로 검색해 주세요.",
      );
      return null;
    } finally {
      setIsLocating(false);
    }
  }

  return { findCurrentAddress, isLocating, locateError };
}