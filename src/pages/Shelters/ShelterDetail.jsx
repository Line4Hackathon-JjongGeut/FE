import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import backButtonIcon from "../../assets/icons/shelters/detail/back-button-light.svg";
import chevronIcon from "../../assets/icons/shelters/detail/chevron.svg";
import dividerIcon from "../../assets/icons/shelters/detail/divider.svg";
import mapPawIcon from "../../assets/icons/shelters/detail/map-paw.svg";
import pinIcon from "../../assets/icons/shelters/detail/pin.svg";
import pawIcon from "../../assets/icons/shelters/detail/paw.svg";
import pawFilledIcon from "../../assets/icons/shelters/detail/paw-filled.svg";
import { SHELTER_DETAIL } from "../../dummyData/shelters/shelterDummy.js";
import { getShelterAnimalStats, getShelterDetail, getShelterPostings } from "../../api/shelters.js";
import { setSavedFavorite } from "../../api/activities.js";
import { loadKakaoMap } from "../../lib/kakaoMap.js";
import { findCoordsByAddress } from "../../lib/kakaoAddress.js";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/* 모집 시작 시각을 카드에 보이는 날짜 문구로 바꿉니다. */
function formatStart(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]}) ${hours}:${minutes}`;
}

/* 모집 공고 한 건을 현재 모집 중 카드 모양으로 맞춥니다. */
function toPostingCard(post) {
  const full = post.capacity > 0 && (post.remainingCount === 0 || post.applicantCount >= post.capacity);
  return {
    id: post.postingId,
    title: post.title,
    cardSchedule: formatStart(post.activityStartAt),
    status: full ? "모집 마감" : "신청 가능",
    postingType: post.postingType,
  };
}

/* 상세 응답을 화면에 쓰던 시설 정보 모양으로 맞춥니다. 위쪽 사진은 imageUrls를 씁니다. */
function toShelterView(data) {
  const badges = [{ id: "certified", label: "쫑긋 인증 시설", tone: "filled" }];
  const info = [
    data.operatingHours ? { label: "운영 시간", value: data.operatingHours } : null,
    data.address ? { label: "위치", value: data.address } : null,
    data.visitPolicy ? { label: "방문 안내", value: data.visitPolicy } : null,
    data.phone ? { label: "연락처", value: data.phone } : null,
    data.distanceKm != null ? { label: "거리", value: `${data.distanceKm}km` } : null,
  ].filter(Boolean);
  const posts = (data.openPostings ?? []).map(toPostingCard);

  return {
    ...SHELTER_DETAIL,
    id: data.shelterId,
    name: data.name,
    address: data.address ?? SHELTER_DETAIL.address,
    intro: data.description ?? "",
    badges: badges.length ? badges : SHELTER_DETAIL.badges,
    info: info.length ? info : SHELTER_DETAIL.info,
    posts,
    bookmarked: Boolean(data.bookmarked),
    latitude: data.latitude ?? null,
    longitude: data.longitude ?? null,
    photos: (Array.isArray(data.imageUrls) ? data.imageUrls : [])
      .filter(Boolean)
      .map((src, index) => ({ id: index + 1, src, position: "center" })),
  };
}

/* 숫자로 된 좌표만 남깁니다. */
function toCoords(latitude, longitude) {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { latitude: lat, longitude: lng };
}

/* 시설 위치 칸에 해당 좌표의 카카오 지도를 올립니다. 좌표가 없으면 주소로 찾습니다. */
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

  return <MapCanvas ref={boxRef} aria-label="시설 위치 지도" />;
}

/* 지도에서 보호소 이름을 눌렀을 때 열리는 보호시설 상세입니다. */
export default function ShelterDetail() {
  const navigate = useNavigate();
  const { shelterId: shelterIdParam } = useParams();
  const [favorite, setFavorite] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [detail, setDetail] = useState(null);
  const [postings, setPostings] = useState(null);
  const [animalStats, setAnimalStats] = useState(null);
  const shelter = detail;
  const shelterId = shelterIdParam;
  const posts = postings ?? detail?.posts ?? [];
  const photos = shelter?.photos ?? [];
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
  }, [photos.length]);

  /* 보호시설 상세를 가져옵니다. 오기 전에는 임시 시설을 보여 주지 않습니다. */
  useEffect(() => {
    if (!shelterId) return undefined;
    setDetail(null);
    setAnimalStats(null);
    let ignore = false;
    getShelterDetail(shelterId)
      .then((result) => {
        if (ignore || !result?.isSuccess || !result.data) return;
        setDetail(toShelterView(result.data));
        setFavorite(Boolean(result.data.bookmarked));
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [shelterId]);

  /* 현재 모집 중 목록은 시설 모집공고 목록으로 채웁니다. */
  useEffect(() => {
    if (!shelterId) return undefined;
    setPostings(null);
    let ignore = false;
    getShelterPostings(shelterId)
      .then((result) => {
        if (ignore || !result?.isSuccess) return;
        setPostings((result.data?.items ?? []).map(toPostingCard));
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [shelterId]);

  /* 보호동물 현황을 가져옵니다. 실패하면 이 칸은 보여 주지 않습니다. */
  useEffect(() => {
    if (!shelterId) return undefined;
    let ignore = false;
    getShelterAnimalStats(shelterId)
      .then((result) => {
        if (ignore || !result?.isSuccess || !result.data) return;
        setAnimalStats(result.data);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [shelterId]);

  /* 발바닥은 이 보호시설만 저장하거나 해제합니다. */
  async function toggleBookmark() {
    if (savingBookmark) return;
    setSavingBookmark(true);
    try {
      await setSavedFavorite({ shelterId, saved: favorite });
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

  /* 모집 카드는 공고 종류에 맞는 상세로 이동합니다. */
  function openPost(post) {
    const type = String(post.postingType ?? "");
    if (type === "후원" || type.toUpperCase().includes("SPONSOR") || type.toUpperCase().includes("DONATION")) {
      navigate(`/donations/${post.id}`);
      return;
    }
    if (type === "임시보호" || type.toUpperCase().includes("FOSTER")) {
      navigate(`/fosters/${post.id}`);
      return;
    }
    navigate(`/shelters/volunteer/${post.id}`);
  }

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(shelter.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  if (!shelter) {
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
      {/* 화면 위쪽을 가득 채우는 가로로 긴 직사각형 사진입니다. 양옆으로 밀어 장을 바꿉니다. */}
      <Hero>
        <PhotoWindow
          ref={frameRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* 사진 직사각형을 가로로 이어 붙인 띠입니다. 밀면 이 띠가 좌우로 움직입니다. */}
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
        {/* 사진 왼쪽 위, 그림자가 있는 흰색 원 안에 왼쪽을 가리키는 꺾쇠입니다. */}
        <BackButton type="button" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
          <img src={backButtonIcon} alt="" />
        </BackButton>
        {/* 사진 오른쪽 아래, 반투명한 어두운 알약 모양에 지금 장과 전체 장 수를 적습니다. */}
        {photos.length > 0 && (
          <PhotoCount>
            {photoIndex + 1} / {photos.length}
          </PhotoCount>
        )}
      </Hero>

      <Content>
        {/* 제목 위, 채운 알약과 테두리만 있는 알약을 가로로 붙입니다. */}
        <BadgeRow>
          {shelter.badges.map((badge) => (
            <FilledBadge key={badge.id}>{badge.label}</FilledBadge>
          ))}
        </BadgeRow>

        <Title>{shelter.name}</Title>

        <Stack>
          {/* 시설 정보: 굵은 소제목 아래, 회색 라벨과 본문이 한 줄씩 놓입니다. */}
          <Section>
            <SectionTitle>시설 정보</SectionTitle>
            <InfoList>
              {shelter.info.map((item) => (
                <InfoRow key={item.label}>
                  <InfoLabel>{item.label}</InfoLabel>
                  <InfoValue>{item.value}</InfoValue>
                </InfoRow>
              ))}
            </InfoList>
          </Section>

          {animalStats && (
            <Section>
              <SectionTitle>보호동물 현황</SectionTitle>
              <InfoList>
                {[
                  ["강아지", animalStats.dogCount],
                  ["고양이", animalStats.catCount],
                  ["기타", animalStats.otherCount],
                  ["전체", animalStats.totalCount],
                ].map(([label, count]) => (
                  <InfoRow key={label}>
                    <InfoLabel>{label}</InfoLabel>
                    <InfoValue>{count}마리</InfoValue>
                  </InfoRow>
                ))}
              </InfoList>
            </Section>
          )}

          {/* 시설 소개: 소제목 아래 두세 줄로 이어지는 본문입니다. */}
          <Section>
            <SectionTitle>시설 소개</SectionTitle>
            <Intro>{shelter.intro}</Intro>
          </Section>

          {/* 구역을 나누는 얇은 가로 직선입니다. */}
          <Divider src={dividerIcon} alt="" />

          {/* 현재 모집 중: 테두리가 있는 가로로 긴 둥근 사각형 카드 목록입니다. */}
          <Section>
            <SectionTitle>현재 모집 중</SectionTitle>
            <PostList>
              {posts.map((post) => (
                <PostCard key={post.id} type="button" onClick={() => openPost(post)}>
                  <PostText>
                    <PostTitle>{post.title}</PostTitle>
                    <PostSchedule>{post.cardSchedule}</PostSchedule>
                  </PostText>
                  {/* 카드 오른쪽, 연두색으로 채운 알약입니다. */}
                  <StatusBadge>{post.status}</StatusBadge>
                  {/* 아래를 가리키는 꺾쇠를 돌려, 오른쪽 화살표로 씁니다. */}
                  <Chevron>
                    <img src={chevronIcon} alt="" />
                  </Chevron>
                </PostCard>
              ))}
            </PostList>
          </Section>

          <Divider src={dividerIcon} alt="" />

          {/* 시설 위치: 해당 시설 좌표의 지도를 둥근 칸에 보여 줍니다. */}
          <Section>
            <SectionTitle>시설 위치</SectionTitle>
            <LocationMap
              address={shelter.address}
              latitude={shelter.latitude}
              longitude={shelter.longitude}
            />
            <AddressRow>
              <img src={pinIcon} alt="" />
              <Address>{shelter.address}</Address>
              <CopyButton type="button" onClick={copyAddress}>
                {copied ? "복사됨" : "복사"}
              </CopyButton>
            </AddressRow>
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
            onClick={toggleBookmark}
        >
          <img src={favorite ? pawFilledIcon : pawIcon} alt="" />
        </PawButton>
        <ApplyButton type="button" onClick={() => posts[0] && openPost(posts[0])}>
          봉사 공고 보러가기
        </ApplyButton>
      </ActionBar>
    </Screen>
  );
}

/* 페이지 전체. 아래 고정 막대에 글이 가리지 않도록 밑을 비워 둡니다. */
const Screen = styled.div`
  position: relative;
  min-height: 100dvh;
  padding-bottom: 108px;
  overflow-x: hidden;
  background-color: #ffffff;
  color: #2f3833;
`;

/* 위쪽 사진이 들어가는 직사각형. 높이는 시안의 사진 영역과 같습니다. */
const Hero = styled.div`
  position: relative;
  height: 298px;
  background-color: #dcdcdc;
`;

/* 사진이 직사각형 밖으로 나가지 않게 잘라 두는 창입니다. 세로는 페이지를 스크롤할 수 있습니다. */
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

/* 사진들을 가로로 붙인 띠. 한 장 너비만큼 옮겨 다음 직사각형이 창에 들어오게 합니다. */
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
  padding: 4px 10px;
  border-radius: 999px;
  background-color: rgba(47, 56, 51, 0.8);
  color: #fbf6ee;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
`;

const Content = styled.div`
  padding: 19px 21px 0;
`;

/* 알약 배지 두 개를 가로로 나란히 두는 줄입니다. */
const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

/* 연한 초록으로 속을 채운 알약입니다. */
const FilledBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 19px;
  padding: 0 7px;
  border-radius: 10px;
  background-color: #e3f0e6;
  color: #3e7556;
  font-size: 10px;
  font-weight: 700;
`;

/* 시설 이름. 한 줄을 차지하는 굵은 제목입니다. */
const Title = styled.h1`
  margin: 4px 0 0;
  color: #2f3833;
  font-size: 26px;
  font-weight: 700;
  line-height: 33px;
`;

/* 정보, 소개, 모집, 위치를 세로로 쌓고 구역 사이에 같은 간격을 둡니다. */
const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 29px;
  margin-top: 23px;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
`;

/* 각 구역의 굵은 소제목입니다. */
const SectionTitle = styled.h2`
  margin: 0;
  color: #303030;
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

/* 짧은 라벨과 값을 한 줄에 붙인 가로 막대입니다. */
const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 13px;
`;

const InfoLabel = styled.span`
  flex-shrink: 0;
  width: 56px;
  color: #817f7f;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
`;

const InfoValue = styled.span`
  flex: 1;
  min-width: 0;
  color: #382f2f;
  font-size: 13px;
  font-weight: 500;
  line-height: 17px;
  word-break: break-word;
`;

/* 소개 본문. 줄 사이가 조금 넓은 직사각형 글 덩어리입니다. */
const Intro = styled.p`
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

const PostList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
`;

/* 모서리를 10px 둥글린 가로로 긴 사각형 카드입니다. 얇은 회색 테두리가 있습니다. */
const PostCard = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 68px;
  padding: 0 8px 0 19px;
  border: 1px solid #dcdcdc;
  border-radius: 10px;
  background-color: #ffffff;
  text-align: left;
  cursor: pointer;
`;

const PostText = styled.span`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`;

const PostTitle = styled.span`
  overflow: hidden;
  color: #2f3833;
  font-size: 15px;
  font-weight: 700;
  line-height: 24px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PostSchedule = styled.span`
  color: #595959;
  font-size: 13px;
  font-weight: 500;
  line-height: 14px;
`;

/* 카드 안의 작은 알약. 연두색으로 속을 채웁니다. */
const StatusBadge = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 50px;
  background-color: #bdd9c4;
  color: #104627;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
`;

/* 꺾쇠 아이콘을 시계 반대 방향으로 90도 돌려 오른쪽을 가리키게 합니다. */
const Chevron = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  transform: rotate(-90deg);
`;

/* 시설 위치가 들어가는 둥근 칸입니다. 지도가 채워지기 전에는 회색으로 둡니다. */
const MapCanvas = styled.div`
  height: 117px;
  margin-top: 6px;
  overflow: hidden;
  border-radius: 10px;
  background-color: #dcdcdc;
`;

/* 지도를 찾지 못했을 때 보여 주는 회색 둥근 사각형입니다. */
const MapPreview = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 117px;
  margin-top: 6px;
  border-radius: 10px;
  background-color: #dcdcdc;
`;

const MapLabel = styled.span`
  color: #1f1e1c;
  font-size: 14px;
  font-weight: 600;
`;

/* 위치 핀, 주소, 복사 글자를 한 줄로 잇습니다. */
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
