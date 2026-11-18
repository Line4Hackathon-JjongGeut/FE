import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import backButtonIcon from "../../assets/icons/shelters/detail/back-button-light.svg";
import dividerIcon from "../../assets/icons/shelters/volunteer/divider.svg";
import mapPawIcon from "../../assets/icons/shelters/detail/map-paw.svg";
import pinIcon from "../../assets/icons/shelters/volunteer/pin.svg";
import pawIcon from "../../assets/icons/shelters/detail/paw.svg";
import pawFilledIcon from "../../assets/icons/shelters/detail/paw-filled.svg";
import { findVolunteerPost } from "../../dummyData/shelters/shelterDummy.js";
import { getPostingDetail } from "../../api/postings.js";
import { setSavedFavorite } from "../../api/activities.js";
import { loadKakaoMap } from "../../lib/kakaoMap.js";
import { findCoordsByAddress } from "../../lib/kakaoAddress.js";

/* 숫자로 된 좌표만 남깁니다. */
function toCoords(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { latitude: lat, longitude: lng };
}

/* 근무지역 칸에 해당 좌표의 카카오 지도를 올립니다. 좌표가 없으면 주소로 찾습니다. */
function LocationMap({ address, latitude, longitude }) {
  const boxRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const known = toCoords(latitude, longitude);
    if (!known && !address) {
      setFailed(true);
      return undefined;
    }

    let ignore = false;
    setFailed(false);

    async function init() {
      try {
        const kakao = await loadKakaoMap();
        const coords = known ?? (await findCoordsByAddress(address));
        if (ignore || !boxRef.current) return;

        const position = new kakao.maps.LatLng(coords.latitude, coords.longitude);
        const map = new kakao.maps.Map(boxRef.current, {
          center: position,
          level: 3,
        });
        map.setDraggable(false);
        map.setZoomable(false);
        new kakao.maps.Marker({ position, map });
        map.relayout();
        requestAnimationFrame(() => map.relayout());
      } catch {
        if (!ignore) setFailed(true);
      }
    }

    init();
    return () => {
      ignore = true;
      if (boxRef.current) boxRef.current.innerHTML = "";
    };
  }, [address, latitude, longitude]);

  if (failed) {
    return (
      <MapPreview>
        <img src={mapPawIcon} alt="" />
        <MapLabel>지도 사진</MapLabel>
      </MapPreview>
    );
  }

  return <MapCanvas ref={boxRef} aria-label="근무지역 지도" />;
}

/* 공고 제목이나 모집 카드를 눌렀을 때 열리는 봉사 공고 상세입니다. */
export default function VolunteerDetail() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const isNumericId = /^\d+$/.test(String(postId ?? ""));
  const [post, setPost] = useState(() => (isNumericId ? null : findVolunteerPost(postId)));
  const photos = post?.photos ?? [];
  const [favorite, setFavorite] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const frameRef = useRef(null);
  const dragRef = useRef(null);
  const photoIndexRef = useRef(0);
  const [frameWidth, setFrameWidth] = useState(0);

  /* 숫자 공고 번호면 모집공고 상세를 가져옵니다. 오기 전에는 임시 공고를 보여 주지 않습니다. */
  useEffect(() => {
    if (!/^\d+$/.test(String(postId ?? ""))) return undefined;
    setPost(null);
    let ignore = false;
    getPostingDetail(postId)
      .then((result) => {
        if (ignore || !result?.isSuccess || !result.data) return;
        setPost(toVolunteerView(result.data));
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

  /* 사진 칸의 가로 길이를 재서, 한 장씩 정확히 밀리게 합니다. */
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;
    const measure = () => setFrameWidth(frame.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [photos.length]);

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

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(post.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  if (!post) {
    return (
      <Screen>
        <BackButton type="button" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
          <img src={backButtonIcon} alt="" />
        </BackButton>
      </Screen>
    );
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
        {photos.length > 0 && (
          <PhotoCount>
            {photoIndex + 1} / {photos.length}
          </PhotoCount>
        )}
      </Hero>

      <Content>
        <MetaRow>
          {/* 초록색으로 속을 채운 작은 알약입니다. */}
          <CategoryBadge>{post.category}</CategoryBadge>
          <PostedAt>{post.postedAt}</PostedAt>
        </MetaRow>

        <Title>{post.title}</Title>

        {/* 밑줄 글자와 꺾쇠. 누르면 보호시설 상세로 이동합니다. */}
        <ShelterLink type="button" onClick={() => navigate(`/shelters/${post.shelterId}`)}>
          <ShelterName>{post.shelterName}</ShelterName>
          <Chevron> &gt;</Chevron>
        </ShelterLink>

        <Section>
          <InfoTitle>활동 정보</InfoTitle>
          <InfoList>
            <InfoRow>
              <InfoLabel>활동 시간</InfoLabel>
              <InfoValue>{post.time}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>활동 일자</InfoLabel>
              <InfoValue>{post.date}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>모집 조건</InfoLabel>
              <InfoValue>{post.level}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>모집 인원</InfoLabel>
              <InfoValue>
                {post.recruit}
                {" - "}
                <Remain>{post.remain}</Remain>
              </InfoValue>
            </InfoRow>
          </InfoList>
        </Section>

        {/* 구역을 나누는 얇은 가로 직선입니다. */}
        <Divider src={dividerIcon} alt="" />

        <DetailStack>
          <Section>
            <InfoTitle>활동 내용</InfoTitle>
            <Body>{post.activity}</Body>
          </Section>
          <Section>
            <InfoTitle>준비물</InfoTitle>
            <Supply>{post.supplies}</Supply>
          </Section>
          <Section>
            <CautionTitle>유의사항</CautionTitle>
            {/* 속이 빈 동그란 점 뒤에 한 줄씩 이어지는 목록입니다. */}
            <CautionList>
              {post.cautions.map((item) => (
                <CautionItem key={item}>{item}</CautionItem>
              ))}
            </CautionList>
          </Section>
        </DetailStack>

        <Section>
          <InfoTitle>근무지역</InfoTitle>
          <LocationMap
            address={post.address}
            latitude={post.latitude}
            longitude={post.longitude}
          />
          <PlaceLink type="button" onClick={() => navigate(`/shelters/${post.shelterId}`)}>
            <PlaceName>{post.shelterName}</PlaceName>
            <Chevron> &gt;</Chevron>
          </PlaceLink>
          <AddressRow>
            <img src={pinIcon} alt="" />
            <Address>{post.address}</Address>
            <CopyButton type="button" onClick={copyAddress}>
              {copied ? "복사됨" : "복사"}
            </CopyButton>
          </AddressRow>
        </Section>
      </Content>

      {/* 화면을 내려도 아래에 붙는 흰색 가로 막대입니다. */}
      <ActionBar>
        <PawButton
          type="button"
          aria-label={favorite ? "즐겨찾기 해제" : "즐겨찾기"}
          aria-pressed={favorite}
          onClick={saveBookmark}
        >
          <img src={favorite ? pawFilledIcon : pawIcon} alt="" />
        </PawButton>
        <ApplyButton type="button" onClick={() => navigate(`/volunteer/apply/${post.id}`)}>
          지원하기
        </ApplyButton>
      </ActionBar>
    </Screen>
  );
}

function toVolunteerView(data) {
  const start = data.volunteer?.activityStartAt;
  const end = data.volunteer?.activityEndAt;
  const region = [data.shelter?.region?.sido, data.shelter?.region?.sigungu].filter(Boolean).join(" ");
  const requirements = data.volunteer?.conditions?.requirements;
  return {
    id: data.postingId,
    category: "봉사",
    postedAt: formatPosted(data.createdAt),
    title: data.title ?? "",
    shelterId: data.shelter?.shelterId,
    shelterName: data.shelter?.name ?? "",
    time: formatClockRange(start, end),
    date: formatDay(start),
    level: data.volunteer?.conditions?.beginnerFriendly ? "초보자 참여 가능" : "참여 조건 확인",
    recruit: data.volunteer?.capacity != null ? `모집 ${data.volunteer.capacity}명` : "",
    remain: data.volunteer?.remainingCount != null ? `잔여 ${data.volunteer.remainingCount}명` : "",
    activity: data.description ?? "",
    supplies: requirements || "담당자 안내를 확인해 주세요.",
    cautions: requirements ? [requirements] : ["보호시설의 안내를 따라 주세요."],
    address: data.shelter?.address || region,
    latitude: data.shelter?.latitude ?? null,
    longitude: data.shelter?.longitude ?? null,
    photos: (Array.isArray(data.imageUrls) ? data.imageUrls : [])
      .filter(Boolean)
      .map((src, index) => ({ id: index + 1, src, position: "center" })),
  };
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

function formatDay(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const week = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} (${week})`;
}

function formatClockRange(start, end) {
  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return "";
  const clock = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const endDate = new Date(end);
  if (Number.isNaN(endDate.getTime())) return clock(startDate);
  return `${clock(startDate)}~${clock(endDate)}`;
}

const Screen = styled.div`
  position: relative;
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

/* 화면 왼쪽 위에 고정합니다. 앱 화면이 가운데일 때도 사진 위 같은 자리에 둡니다. */
const BackButton = styled.button`
  position: fixed;
  top: 16px;
  left: max(20px, calc(50vw - 195px + 20px));
  z-index: 6;
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
  padding: 15px 21px 32px;
`;

/* 왼쪽 알약과 오른쪽 날짜를 한 줄의 양끝에 둡니다. */
const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

/* 진한 초록으로 속을 채운 작은 알약입니다. */
const CategoryBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 19px;
  padding: 0 7px;
  border-radius: 10px;
  background-color: #3e7556;
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

/* 글자 아래에 선을 그은 시설명입니다. */
const ShelterName = styled.span`
  color: #454545;
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

const Section = styled.section`
  display: flex;
  flex-direction: column;
`;

/* 활동 정보, 활동 내용, 준비물, 근무지역에 쓰는 초록색 소제목입니다. */
const InfoTitle = styled.h2`
  margin: 32px 0 0;
  color: #4f7a5f;
  font-size: 15px;
  font-weight: 700;
  line-height: 17px;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 13px;
`;

/* 짧은 회색 라벨과 값을 한 줄에 붙입니다. */
const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
`;

const InfoLabel = styled.span`
  flex-shrink: 0;
  width: 52px;
  color: #817f7f;
  font-size: 12px;
  font-weight: 600;
`;

const InfoValue = styled.span`
  color: #382f2f;
  font-size: 13px;
  font-weight: 500;
`;

/* 잔여 인원만 살구색으로 굵게 표시합니다. */
const Remain = styled.span`
  color: #e88b7a;
  font-weight: 700;
`;

/* 가로 348, 세로 1인 회색 직선입니다. 파일에 크기가 들어 있어 여기서 늘리지 않습니다. */
const Divider = styled.img`
  display: block;
  margin-top: 22px;
`;

/* 활동 내용, 준비물, 유의사항을 같은 간격으로 세로로 쌓습니다. */
const DetailStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 27px;

  ${InfoTitle} {
    margin-top: 0;
  }
`;

const Body = styled.p`
  margin: 8px 0 0;
  color: #151515;
  font-size: 14px;
  font-weight: 500;
  line-height: 19px;
`;

const Supply = styled.p`
  margin: 8px 0 0;
  color: #151515;
  font-size: 14px;
  font-weight: 500;
  line-height: 15px;
`;

/* 유의사항만 붉은색 소제목입니다. */
const CautionTitle = styled.h2`
  margin: 0;
  color: #b03c22;
  font-size: 15px;
  font-weight: 700;
  line-height: 17px;
`;

const CautionList = styled.ul`
  margin: 8px 0 0;
  padding-left: 21px;
  color: #151515;
  font-size: 14px;
  font-weight: 500;
  line-height: 19px;
`;

const CautionItem = styled.li`
  margin: 0;
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

/* 가로로 긴 둥근 사각형 버튼. 속을 살구색으로 채웁니다. */
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

/* 근무지역이 들어가는 둥근 칸입니다. 지도가 채워지기 전에는 연한 초록으로 둡니다. */
const MapCanvas = styled.div`
  height: 117px;
  margin-top: 6px;
  overflow: hidden;
  border-radius: 10px;
  background-color: #bdd9c4;
`;

/* 지도를 찾지 못했을 때 보여 주는 연한 초록 둥근 사각형입니다. */
const MapPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 117px;
  margin-top: 6px;
  border-radius: 10px;
  background-color: #bdd9c4;
`;

const MapLabel = styled.span`
  color: #1f1e1c;
  font-size: 14px;
  font-weight: 600;
`;

const PlaceLink = styled.button`
  display: flex;
  align-items: center;
  margin-top: 12px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #000000;
  cursor: pointer;
`;

const PlaceName = styled.span`
  color: #000000;
  font-size: 15px;
  font-weight: 600;
  line-height: 18px;
  text-decoration: underline;
  text-underline-offset: 2px;
`;

const AddressRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
`;

const Address = styled.span`
  color: #151515;
  font-size: 12px;
  font-weight: 500;
  line-height: 15px;
`;

/* 주소 옆의 작은 파란 글자 버튼입니다. 네모 배경은 없습니다. */
const CopyButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  color: #1dadef;
  font-size: 10px;
  font-weight: 500;
  line-height: 15px;
  cursor: pointer;
`;
