import { useEffect, useState } from "react";
import { getPostings } from "../api/postings.js";
import { fromUrgentResponse } from "../utils/urgentMapper.js";

// 홈과 긴급 모집 목록이 같이 쓰는 개수
const URGENT_SIZE = 20;

/* 긴급 모집 공고 불러오기 */
export function useUrgentPosts({ latitude, longitude, enabled = true } = {}) {
  const [state, setState] = useState({ status: "loading", posts: [] });
  const [attempt, setAttempt] = useState(0); // 다시 시도할 때마다 1씩 늘려서 effect를 다시 실행

  useEffect(() => {
    if (!enabled) return undefined;
    let ignore = false;
    getPostings({ urgentOnly: true, size: URGENT_SIZE, latitude, longitude })
      .then((result) => {
        if (!ignore) setState({ status: "ready", posts: fromUrgentResponse(result.data) });
      })
      .catch(() => {
        if (!ignore) setState({ status: "error", posts: [] });
      });
    return () => {
      ignore = true;
    };
  }, [latitude, longitude, enabled, attempt]);

  function retry() {
    setState({ status: "loading", posts: [] });
    setAttempt((count) => count + 1);
  }

  return { ...state, retry };
}