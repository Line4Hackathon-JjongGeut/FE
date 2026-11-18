import { useEffect, useState } from "react";
import { getRecommendations, recordRecommendationImpressions } from "../api/recommendations.js";
import { fromRecommendationResponse } from "../utils/recommendationMapper.js";

/* 추천 활동 불러오기 */
export function useRecommendations(limit, enabled) {
  const [state, setState] = useState({ status: "loading", batchId: null, cards: [] });
  const [attempt, setAttempt] = useState(0); // 다시 시도할 때마다 1씩 늘려서 effect를 다시 실행

  useEffect(() => {
    if (!enabled) return undefined;
    let ignore = false;
    getRecommendations(limit)
      .then((result) => {
        if (!ignore) setState({ status: "ready", ...fromRecommendationResponse(result.data) });
      })
      .catch(() => {
        if (!ignore) setState({ status: "error", batchId: null, cards: [] });
      });
    return () => {
      ignore = true;
    };
  }, [limit, enabled, attempt]);

  function retry() {
    setState({ status: "loading", batchId: null, cards: [] });
    setAttempt((count) => count + 1);
  }

  return { ...state, retry };
}

export function useRecordImpressions(batchId, visibleCards) {
  const ids = visibleCards.map((card) => card.id).join(",");

  useEffect(() => {
    if (!batchId || !ids) return;
    recordRecommendationImpressions(batchId, ids.split(",").map(Number)).catch(() => {});
  }, [batchId, ids]);
}