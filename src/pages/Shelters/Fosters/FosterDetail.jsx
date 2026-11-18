import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import backButtonIcon from "../../../assets/icons/shelters/detail/back-button.svg";
import dividerIcon from "../../../assets/icons/shelters/detail/divider.svg";
import pawIcon from "../../../assets/icons/shelters/detail/paw.svg";
import pawFilledIcon from "../../../assets/icons/shelters/detail/paw-filled.svg";
import { findFosterPost } from "../../../dummyData/shelters/fosters/fosterDummy.js";
import { getPostingDetail } from "../../../api/postings.js";
import { setSavedFavorite } from "../../../api/activities.js";

/* 지도에서 임시보호 카드를 눌렀을 때 열리는 임시보호 공고 상세입니다. */
export default function FosterDetail() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const saved = findFosterPost(postId);
  const [post, setPost] = useState(saved);
  const photos = post.photos;
  const [favorite, setFavorite] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef(null);
  const dragRef = useRef(null);
  const photoIndexRef = useRef(0);
  const [frameWidth, setFrameWidth] = useState(0);

  /* 사진 칸의 가로 길이를 재서, 한 장씩 정확히 밀리게 합니다. */
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;
    const measure = () => setFrameWidth(frame.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  /* 숫자 공고 번호면 모집공고 상세를 가져옵니다. 실패하면 임시 내용을 유지합니다. */
  useEffect(() => {
    if (!/^\d+$/.test(String(postId ?? ""))) return undefined;
    setPost(findFosterPost(postId));
    let ignore = false;
    getPostingDetail(postId)
      .then((result) => {
        if (ignore || !result?.isSuccess || !result.data) return;
        setPost((current) => ({ ...current, ...toFosterView(result.data), photos: current.photos }));
        if (typeof result.data.bookmarked === "boolean") setFavorite(result.data.bookmarked);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [postId]);

  /* 발바닥은 공고와 그 보호시설을 함께 저장하거나 해제합니다. */
  async function saveBookmark() {
    if (savingBookmark) return;
    setSavingBookmark(true);
    try {
      await setSavedFavorite({
        shelterId: post.shelterId,
        postingIds: [post.id],
        saved: favorite,
      });
      setFavorite(!favorite);
    } catch (error) {
      if (error.status === 409) setFavorite(true);
      if (error.status === 404) setFavorite(false);
    } finally {
      setSavingBookmark(false);
    }
  }

  function showPhoto(nextIndex) {
    photoIndexRef.current = nextIndex;
    setPhotoIndex(nextIndex);
  }

  /* 오른쪽에서 왼쪽으로 밀면 다음 장, 왼쪽에서 오른쪽으로 밀면 이전 장입니다. */
  function onPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      dx: 0,
      axis: null,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.axis) {
      if (Math.hypot(dx, dy) < 8) return;
      drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (drag.axis === "x") setDragging(true);
    }
    if (drag.axis !== "x") return;
    const index = photoIndexRef.current;
    const atFirst = index === 0 && dx > 0;
    const atLast = index === photos.length - 1 && dx < 0;
    drag.dx = atFirst || atLast ? dx * 0.3 : dx;
    setDragX(drag.dx);
  }

  function onPointerUp(event) {
    const drag = dragRef.current;
    if (!drag || event.pointerId !== drag.id) return;
    const dx = drag.dx;
    const horizontal = drag.axis === "x";
    dragRef.current = null;
    setDragging(false);
    setDragX(0);
    if (!horizontal) return;
    const index = photoIndexRef.current;
    if (dx <= -48 && index < photos.length - 1) showPhoto(index + 1);
    else if (dx >= 48 && index > 0) showPhoto(index - 1);
  }

  return (
    <Screen>
      {/* 위쪽을 가득 채우는 가로로 긴 직사각형 사진입니다. 양옆으로 밀어 장을 바꿉니다. */}
      <Hero>
        <PhotoWindow
          ref={frameRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <PhotoTrack $index={photoIndex} $offset={dragX} $width={frameWidth} $dragging={dragging}>
            {photos.map((photo) => (
              <HeroPhoto
                key={photo.id}
                src={photo.src}
                alt=""
                draggable={false}
                $width={frameWidth}
                $position={photo.position}
              />
            ))}
          </PhotoTrack>
        </PhotoWindow>
        {/* 사진 왼쪽 위, 그림자가 있는 흰색 원 안에 왼쪽 꺾쇠입니다. */}
        <BackButton type="button" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
          <img src={backButtonIcon} alt="" />
        </BackButton>
        {/* 사진 오른쪽 아래, 반투명한 어두운 알약에 사진 순서를 적습니다. */}
        <PhotoCount>
          {photoIndex + 1} / {photos.length}
        </PhotoCount>
      </Hero>

      <Content>
        <MetaRow>
          {/* 노란 주황으로 속을 채운 작은 알약입니다. */}
          <CategoryBadge>{post.category}</CategoryBadge>
          <PostedAt>{post.postedAt}</PostedAt>
        </MetaRow>

        <Title>{post.title}</Title>

        {/* 밑줄 글자와 꺾쇠. 누르면 보호시설 상세로 이동합니다. */}
        <ShelterLink type="button" onClick={() => navigate(`/shelters/${post.shelterId}`)}>
          <ShelterName>{post.shelterName}</ShelterName>
          <Chevron> &gt;</Chevron>
        </ShelterLink>

        <Stack>
          <InfoBlock title="아이 정보" rows={post.animal} />
          <Divider src={dividerIcon} alt="" />
          <InfoBlock title="임시보호 정보" rows={post.care} />
          <Divider src={dividerIcon} alt="" />
          <Section>
            <SectionTitle>상세 내용</SectionTitle>
            <Body>{post.detail}</Body>
          </Section>
        </Stack>
      </Content>

      {/* 화면을 내려도 아래에 붙는 흰색 가로 막대입니다. */}
      <ActionBar>
        {/* 막대 왼쪽의 발바닥 윤곽입니다. 누르면 같은 모양을 회색으로 채웁니다. */}
        <PawButton
          type="button"
          aria-label={favorite ? "즐겨찾기 해제" : "즐겨찾기"}
          aria-pressed={favorite}
          onClick={saveBookmark}
        >
          <img src={favorite ? pawFilledIcon : pawIcon} alt="" />
        </PawButton>
        {/* 가로로 긴 둥근 사각형 버튼. 속을 살구색으로 채웁니다. */}
        <ApplyButton type="button" onClick={() => navigate(`/fosters/${post.id}/apply`)}>
          지원하기
        </ApplyButton>
      </ActionBar>
    </Screen>
  );
}

function toFosterView(data) {
  const animal = [{ label: "동물", value: data.animalType || "" }].filter((row) => row.value);
  const care = [
    {
      label: "문의 방법",
      value: data.foster?.contactMethod === "APP" ? "앱 문의" : data.foster?.contactMethod || "",
    },
    { label: "외부 링크", value: data.foster?.externalUrl || "" },
  ].filter((row) => row.value);
  const view = {
    id: data.postingId,
    category: "임시보호",
    postedAt: formatPosted(data.createdAt),
    title: data.title ?? "",
    shelterId: data.shelter?.shelterId,
    shelterName: data.shelter?.name ?? "",
    detail: data.description ?? "",
  };
  if (animal.length) view.animal = animal;
  if (care.length) view.care = care;
  return view;
}

function formatPosted(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value ?? "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}`;
}

/* 노란 소제목 아래, 회색 라벨과 값을 여러 줄로 둔 칸입니다. */
function InfoBlock({ title, rows }) {
  return (
    <Section>
      <SectionTitle>{title}</SectionTitle>
      <InfoList>
        {rows.map((item) => (
          <InfoRow key={item.label}>
            <InfoLabel>{item.label}</InfoLabel>
            <InfoValue>{item.value}</InfoValue>
          </InfoRow>
        ))}
      </InfoList>
    </Section>
  );
}

const Screen = styled.div`
  min-height: 100dvh;
  padding-bottom: 108px;
  overflow-x: hidden;
  background-color: #ffffff;
  color: #2f3833;
`;

/* 위쪽 사진이 들어가는 직사각형입니다. */
const Hero = styled.div`
  position: relative;
  height: 298px;
  background-color: #dcdcdc;
`;

/* 사진이 직사각형 밖으로 나가지 않게 잘라 두는 창입니다. */
const PhotoWindow = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  touch-action: pan-y;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

/* 사진들을 가로로 붙인 띠입니다. */
const PhotoTrack = styled.div`
  display: flex;
  height: 100%;
  transform: translate3d(
    ${({ $index, $offset, $width }) => -$index * $width + $offset}px,
    0,
    0
  );
  transition: ${({ $dragging }) => ($dragging ? "none" : "transform 280ms ease")};
`;

/* 띠 안의 사진 한 장. 창과 같은 크기의 직사각형입니다. */
const HeroPhoto = styled.img`
  flex: 0 0 ${({ $width }) => $width}px;
  width: ${({ $width }) => $width}px;
  height: 100%;
  object-fit: cover;
  object-position: ${({ $position }) => $position};
  user-select: none;
  pointer-events: none;
`;

const BackButton = styled.button`
  position: absolute;
  top: 16px;
  left: 20px;
  z-index: 1;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
`;

/* 모서리를 완전히 둥글려 알약처럼 만든 어두운 배지입니다. */
const PhotoCount = styled.span`
  position: absolute;
  right: 16px;
  bottom: 14px;
  z-index: 1;
  padding: 4px 10px;
  border-radius: 999px;
  background-color: rgba(47, 56, 51, 0.8);
  color: #fbf6ee;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
`;

const Content = styled.div`
  padding: 15px 21px 0;
`;

/* 왼쪽 알약과 오른쪽 날짜를 한 줄의 양끝에 둡니다. */
const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

/* 노란 주황으로 속을 채운 작은 알약입니다. */
const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 19px;
  padding: 0 8px;
  border-radius: 10px;
  background-color: #f2a60c;
  color: #ffffff;
  font-size: 10px;
  font-weight: 500;
`;

const PostedAt = styled.span`
  color: #a4a4a4;
  font-size: 10px;
  font-weight: 500;
`;

const Title = styled.h1`
  margin: 8px 0 0;
  color: #2f3833;
  font-size: 26px;
  font-weight: 700;
  line-height: 33px;
`;

const ShelterLink = styled.button`
  display: flex;
  align-items: center;
  margin-top: 8px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #454545;
  cursor: pointer;
`;

const ShelterName = styled.span`
  font-size: 15px;
  font-weight: 500;
  line-height: 18px;
  text-decoration: underline;
  text-underline-offset: 2px;
`;

const Chevron = styled.span`
  color: inherit;
  font-size: 15px;
  font-weight: 500;
  line-height: 18px;
`;

/* 아이 정보, 임시보호 정보, 상세 내용을 같은 간격으로 세로로 쌓습니다. */
const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 29px;
  margin-top: 32px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
`;

/* 각 칸의 노란 소제목입니다. */
const SectionTitle = styled.h2`
  margin: 0;
  color: #f2a60c;
  font-size: 15px;
  font-weight: 700;
  line-height: 17px;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 11px;
`;

/* 짧은 회색 라벨과 값을 한 줄에 붙입니다. */
const InfoRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 13px;
`;

const InfoLabel = styled.span`
  flex-shrink: 0;
  width: 52px;
  color: #817f7f;
  font-size: 12px;
  font-weight: 600;
  line-height: 17px;
`;

const InfoValue = styled.span`
  color: #382f2f;
  font-size: 13px;
  font-weight: 500;
  line-height: 17px;
`;

const Body = styled.p`
  margin: 8px 0 0;
  color: #151515;
  font-size: 14px;
  font-weight: 500;
  line-height: 19px;
`;

/* 가로 348, 세로 1인 회색 직선입니다. 파일에 크기가 들어 있어 여기서 늘리지 않습니다. */
const Divider = styled.img`
  display: block;
`;

/* 화면 아래쪽에 고정된 흰색 가로 직사각형입니다. */
const ActionBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 18px;
  width: min(100%, 390px);
  padding: 16px 24px 20px 28px;
  background-color: #ffffff;
  transform: translateX(-50%);
`;

const PawButton = styled.button`
  display: flex;
  flex-shrink: 0;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
`;

const ApplyButton = styled.button`
  flex: 1;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background-color: #e88b7a;
  color: #ffffff;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 0.51px;
  cursor: pointer;
`;
