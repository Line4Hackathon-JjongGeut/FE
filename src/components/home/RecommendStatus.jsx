import styled from "styled-components";

/* 추천 활동을 불러오는 중·실패·결과 없음일 때 카드 자리에 보여 주는 안내 */
export default function RecommendStatus({ status, onRetry }) {
  return (
    <Box>
      {status === "loading" && <Message>추천 활동을 불러오는 중...</Message>}
      {status === "error" && (
        <>
          <Message role="alert">추천 활동을 불러오지 못했어요.</Message>
          <RetryButton type="button" onClick={onRetry}>
            다시 시도
          </RetryButton>
        </>
      )}
      {status === "empty" && <Message>{"지금 조건에 맞는 활동이 없어요.\n참여 조건을 바꿔 보세요."}</Message>}
    </Box>
  );
}

const Box = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  min-height: 129px;
`;

const Message = styled.p`
  color: #8a8a8a;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  text-align: center;
  white-space: pre-line;
`;

const RetryButton = styled.button`
  height: 36px;
  padding: 0 18px;
  border: 1.5px solid #d9d9d9;
  border-radius: 10px;
  background-color: #ffffff;
  color: #2f3833;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`;