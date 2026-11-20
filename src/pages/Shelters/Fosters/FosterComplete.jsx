import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import dogIcon from "../../../assets/icons/fosters/dog.svg";
import checkIcon from "../../../assets/icons/fosters/check.svg";
import { getPostingDetail } from "../../../api/postings.js";

const TYPE_LABEL = {
  FOSTER: "임시보호",
  VOLUNTEER: "봉사",
  SPONSOR: "후원",
  DONATION: "후원",
};

/* 지원 완료하기를 누르면 열리는 임시보호 접수 완료 화면입니다. */
export default function FosterComplete() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [post, setPost] = useState(null);

  /* 완료 카드의 제목과 사진은 방금 신청한 공고 상세에서 가져옵니다. */
  useEffect(() => {
    if (!/^\d+$/.test(String(postId ?? ""))) {
      setPost({});
      return undefined;
    }
    let ignore = false;
    getPostingDetail(postId)
      .then((result) => {
        if (ignore) return;
        const data = result?.isSuccess ? result.data : null;
        const photo = (Array.isArray(data?.imageUrls) ? data.imageUrls : []).find(Boolean) || "";
        setPost(data ? {
          title: data.title ?? "",
          category: TYPE_LABEL[data.postingType] ?? "임시보호",
          photo,
        } : {});
      })
      .catch(() => {
        if (!ignore) setPost({});
      });
    return () => {
      ignore = true;
    };
  }, [postId]);

  return (
    <Screen>
      <Center>
        {/* 강아지 그림 아래, 분홍 원 안에 체크가 있는 그림입니다. */}
        <Mascot>
          <Check src={checkIcon} alt="" />
          <Dog src={dogIcon} alt="" />
        </Mascot>
        <Title>임시보호 지원이 완료되었어요!</Title>
        <Text>
          보호 시설에서 지원서 확인 후
          <br />
          연락드릴 예정이에요.
        </Text>

        {/* 얇은 회색 테두리의 가로로 긴 둥근 사각형 카드입니다. */}
        <Summary>
          {post?.photo ? <Thumb src={post.photo} alt="" /> : <ThumbPlaceholder />}
          <SummaryBody>
            <SummaryTitle>{post?.title ?? ""}</SummaryTitle>
            <Badges>
              {/* 노란 주황으로 속을 채운 작은 알약입니다. */}
              <CategoryBadge>{post?.category ?? "임시보호"}</CategoryBadge>
              {/* 연한 초록으로 속을 채운 작은 알약입니다. */}
              <DoneBadge>접수 완료</DoneBadge>
            </Badges>
          </SummaryBody>
        </Summary>
      </Center>

      <Actions>
        {/* 가로로 긴 둥근 사각형 버튼. 속을 살구색으로 채웁니다. */}
        <Primary type="button" onClick={() => navigate("/activities")}>
          문의 내역 보기
        </Primary>
        {/* 밑줄만 있는 글자 버튼입니다. */}
        <HomeLink type="button" onClick={() => navigate("/")}>
          홈으로 돌아가기
        </HomeLink>
      </Actions>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding: 48px 24px 28px;
  background-color: #ffffff;
`;

const Center = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

/* 분홍 체크 위에 강아지가 앉도록, 피그마와 같은 자리에 겹칩니다. */
const Mascot = styled.div`
  position: relative;
  width: 68px;
  height: 126px;
`;

const Dog = styled.img`
  position: absolute;
  top: 0;
  left: 0;
`;

const Check = styled.img`
  position: absolute;
  top: 70px;
  left: 12px;
`;

const Title = styled.h1`
  max-width: 332px;
  margin: 18px 0 0;
  color: #2f3833;
  font-size: 26px;
  font-weight: 700;
  line-height: 33px;
  text-align: center;
`;

const Text = styled.p`
  margin: 12px 0 0;
  color: #535353;
  font-size: 18px;
  font-weight: 500;
  line-height: 26px;
  text-align: center;
`;

const Summary = styled.article`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  max-width: 351px;
  margin-top: 28px;
  padding: 16px;
  border: 1px solid #908b8a;
  border-radius: 10px;
`;

/* 카드 왼쪽의 가로로 긴 둥근 사진입니다. */
const Thumb = styled.img`
  flex-shrink: 0;
  width: 118px;
  height: 93px;
  border-radius: 8px;
  object-fit: cover;
`;

const ThumbPlaceholder = styled.div`
  flex-shrink: 0;
  width: 118px;
  height: 93px;
  border-radius: 8px;
  background-color: #d9d9d9;
`;

const SummaryBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
`;

const SummaryTitle = styled.h2`
  margin: 0;
  color: #2f3833;
  font-size: 18px;
  font-weight: 700;
  line-height: 24px;
`;

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
`;

const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  background-color: #f2a60c;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
`;

const DoneBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 11px;
  background-color: #e3f0e6;
  color: #2f5e43;
  font-size: 12px;
  font-weight: 600;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 36px;
`;

const Primary = styled.button`
  width: 100%;
  max-width: 352px;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background-color: #e88b7a;
  color: #ffffff;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
`;

const HomeLink = styled.button`
  margin-top: 16px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #403a38;
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
`;
