import styled from "styled-components";
import emptyImage from "../../assets/images/home/recommend-empty.svg";

/* 참여 조건 안 정했을 때 안내 */
export default function RecommendEmpty() {
  return (
    <Empty>
      <img src={emptyImage} alt="" />
      <Message>{"참여 조건을 설정하고\n나를 위한 봉사 추천을 받아 보세요!"}</Message>
    </Empty>
  );
}

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  padding: 50px 0 39px;

  img {
    width: 125px;
  }
`;

const Message = styled.p`
  color: #50443d;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  text-align: center;
  white-space: pre-line;
`;