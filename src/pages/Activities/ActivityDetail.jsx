import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import backButtonIcon from "../../assets/icons/shelters/detail/back-button-light.svg";
import linkIcon from "../../assets/icons/activities/link.svg";
import infoWaitIcon from "../../assets/icons/activities/info-wait.svg";
import infoPlanIcon from "../../assets/icons/activities/info-plan.svg";
import infoRejectIcon from "../../assets/icons/activities/info-reject.svg";
import infoReasonIcon from "../../assets/icons/activities/info-reason.svg";
import dogIcon from "../../assets/icons/activities/dog.svg";
import closeIcon from "../../assets/icons/activities/close.svg";
import { deleteVolunteerApplication, getApplicationDetail, getApplicationStatusHistory } from "../../api/volunteer.js";
import { getPostingDetail } from "../../api/postings.js";
import { SHELTER_DETAIL } from "../../dummyData/shelters/shelterDummy.js";
import { findApplication, removeApplication } from "../../dummyData/volunteer/applications.js";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/* 응답의 status를 화면 배지와 안내 문구에 맞는 이름으로 바꿉니다. */
const STATUS_LABEL = {
  PENDING: "승인 대기",
  APPROVED: "참여 예정",
  CONFIRMED: "참여 예정",
  COMPLETED: "참여 완료",
  REJECTED: "신청 반려",
  CANCELED: "신청 취소",
  CANCELLED: "신청 취소",
  ABSENT: "불참",
  NO_SHOW: "불참",
};

const ACTOR_LABEL = {
  USER: "신청자",
  SHELTER: "보호시설",
  ADMIN: "관리자",
};

const STATUS = {
  "승인 대기": {
    icon: infoWaitIcon,
    background: "#fcebc4",
    titleColor: "#6e5110",
    title: "보호시설에서 신청을 확인하고 있어요.",
    body: "보호시설에서 신청 확인이 완료되면 결과를 알림으로 안내해 드릴게요.",
    canCancel: true,
  },
  "참여 예정": {
    icon: infoPlanIcon,
    background: "#e3f0e6",
    titleColor: "#2f5e43",
    title: "봉사 참여가 확정되었어요!",
    body: "약속된 일정에 맞추어 활동에 참여해 주세요.\n준비물 및 유의사항은 활동 정보에서 확인하세요.",
    canCancel: true,
  },
  "신청 반려": {
    icon: infoRejectIcon,
    background: "#f9eae7",
    titleColor: "#c8807a",
    title: "이번 활동은 함께하기 어려워요.",
    body: "아쉽지만 이번 활동 참여가 불가능해요. 다른 활동에서 다시 만나요!",
    rejected: true,
  },
  "참여 완료": {
    icon: infoPlanIcon,
    background: "#e3f0e6",
    titleColor: "#2f5e43",
    title: "참여가 완료됐어요.",
    body: "함께해 주셔서 고마워요.",
  },
};

/* 활동 카드를 누르면 상태에 따라 신청 상세가 열립니다. */
export default function ActivityDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activityId } = useParams();
  const returnTab = location.state?.from === "saved" ? "saved" : "history";

  function goBack() {
    navigate("/activities", { state: { tab: returnTab } });
  }
  const saved = findApplication(activityId);
  const [item, setItem] = useState(saved);
  const [history, setHistory] = useState([]);
  /* 숫자 신청 번호만 상세 API를 부릅니다. 임시 번호는 기존 내용을 바로 보여 줍니다. */
  const [ready, setReady] = useState(!/^\d+$/.test(String(activityId ?? "")));

  /* 신청 상세를 가져옵니다. 실패하면 기존 임시 정보를 유지합니다. */
  useEffect(() => {
    if (!/^\d+$/.test(String(activityId ?? ""))) return undefined;
    let ignore = false;
    setHistory([]);
    getApplicationDetail(activityId)
      .then(async (result) => {
        if (ignore || !result?.isSuccess || !result.data) return;
        const view = toApplicationDetail(result.data);
        let photos = toPhotos(result.data.imageUrls);
        const postingId = result.data.posting?.postingId;
        if (!photos.length && postingId) {
          try {
            const detail = await getPostingDetail(postingId);
            if (detail?.isSuccess) photos = toPhotos(detail.data?.imageUrls);
          } catch {
            photos = [];
          }
        }
        if (ignore) return;
        photoIndexRef.current = 0;
        setPhotoIndex(0);
        setItem({ ...view, photos });
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setReady(true);
      });
    /* 상태 변경 이력을 오래된 순으로 가져옵니다. 실패하면 이 칸은 보여 주지 않습니다. */
    getApplicationStatusHistory(activityId)
      .then((result) => {
        if (ignore || !result?.isSuccess || !result.data) return;
        setHistory((result.data.items ?? []).map(toHistoryRow));
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [activityId]);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const photos = item?.photos ?? [];
  const frameRef = useRef(null);
  const dragRef = useRef(null);
  const photoIndexRef = useRef(0);
  const [frameWidth, setFrameWidth] = useState(0);

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
    dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, axis: null };
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

  if (!ready) {
    return (
      <Screen>
        <MissingHeader>
          <BackButton type="button" aria-label="뒤로 가기" onClick={goBack}>
            <img src={backButtonIcon} alt="" />
          </BackButton>
        </MissingHeader>
      </Screen>
    );
  }

  if (!item || !STATUS[item.status]) {
    return (
      <Screen>
        <MissingHeader>
          <BackButton type="button" aria-label="뒤로 가기" onClick={goBack}>
            <img src={backButtonIcon} alt="" />
          </BackButton>
        </MissingHeader>
        <Missing>신청 내역을 찾을 수 없어요.</Missing>
      </Screen>
    );
  }

  const status = STATUS[item.status];

  /* 숫자 신청 번호는 취소 API를 부르고, 임시 번호는 화면 목록에서만 뺍니다. */
  async function confirmCancel() {
    if (cancelling) return;
    if (!/^\d+$/.test(String(item.id ?? ""))) {
      removeApplication(item.id);
      navigate("/activities", { state: { tab: returnTab } });
      return;
    }
    setCancelling(true);
    setCancelError("");
    try {
      await deleteVolunteerApplication(item.id);
      removeApplication(item.id);
      navigate("/activities", { state: { tab: returnTab } });
    } catch (error) {
      setCancelError(error.message || "신청을 취소하지 못했습니다.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Screen>
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
        <BackButton type="button" aria-label="뒤로 가기" onClick={goBack}>
          <img src={backButtonIcon} alt="" />
        </BackButton>
        {/* 사진 오른쪽 아래, 반투명한 어두운 알약에 지금 장과 전체 장 수를 적습니다. */}
        {photos.length > 0 && (
          <PhotoCount>
            {photoIndex + 1} / {photos.length}
          </PhotoCount>
        )}
      </Hero>

      <Body>
        {/* 초록색으로 채워진 작은 알약 배지입니다. */}
        <Category>봉사</Category>
        <Title>{item.title}</Title>
        <ShelterButton type="button" onClick={() => navigate(`/shelters/${item.shelterId || SHELTER_DETAIL.id}`)}>
          {item.shelter} &gt;
        </ShelterButton>

        <SectionTitle>신청 정보</SectionTitle>
        <InfoList>
          <InfoRow>
            <InfoLabel>일정</InfoLabel>
            <InfoValue>{item.detailSchedule || item.schedule}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>장소</InfoLabel>
            <InfoValue>{item.place}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>신청일</InfoLabel>
            <InfoValue>{item.appliedAt}</InfoValue>
          </InfoRow>
          {item.applicant && (
            <InfoRow>
              <InfoLabel>신청자</InfoLabel>
              <InfoValue>{item.applicant}</InfoValue>
            </InfoRow>
          )}
        </InfoList>

        {/* 상태 안내가 들어가는 가로로 긴 둥근 사각형입니다. */}
        <Notice $background={status.background}>
          <StatusIcon src={status.icon} alt="" />
          <NoticeText>
            <NoticeTitle $color={status.titleColor}>{status.title}</NoticeTitle>
            <NoticeBody>{status.body}</NoticeBody>
          </NoticeText>
        </Notice>

        {status.rejected && (
          <Reason>
            <StatusIcon src={infoReasonIcon} alt="" />
            <NoticeText>
              <ReasonTitle>반려 사유</ReasonTitle>
              <NoticeBody>{[...history].reverse().find((row) => row.reason)?.reason || item.reason}</NoticeBody>
            </NoticeText>
          </Reason>
        )}

        {history.length > 0 && (
          <>
            <SectionTitle>상태 이력</SectionTitle>
            <HistoryList>
              {history.map((row) => (
                <HistoryItem key={row.id}>
                  <HistoryStatus>{row.status}</HistoryStatus>
                  <HistoryMeta>
                    {row.changedAt}
                    {row.actor ? ` · ${row.actor}` : ""}
                  </HistoryMeta>
                  {row.reason && <HistoryReason>{row.reason}</HistoryReason>}
                </HistoryItem>
              ))}
            </HistoryList>
          </>
        )}
      </Body>

      <Actions>
        {status.rejected ? (
          <>
            <Primary type="button" onClick={() => navigate("/map")}>
              다른 활동 찾아보기
            </Primary>
            <HomeLink type="button" onClick={() => navigate("/")}>
              홈으로 돌아가기
            </HomeLink>
          </>
        ) : (
          <>
            {status.canCancel !== false && status.title && (
              <Primary type="button" onClick={() => navigate(`/shelters/volunteer/${item.postId || 1}`)}>
                <LinkIcon src={linkIcon} alt="" />
                활동 정보 상세 보기
              </Primary>
            )}
            {status.canCancel && item.cancellable !== false && (
              <Secondary
                type="button"
                onClick={() => {
                  setCancelError("");
                  setConfirming(true);
                }}
              >
                신청 취소하기
              </Secondary>
            )}
          </>
        )}
      </Actions>

      {confirming && (
        <Overlay>
          {/* 화면 한가운데의 흰색 둥근 사각형 확인 창입니다. */}
          <Dialog role="dialog" aria-labelledby="cancel-title">
            <CloseButton type="button" aria-label="닫기" onClick={() => setConfirming(false)}>
              <CloseIcon src={closeIcon} alt="" />
            </CloseButton>
            <Dog src={dogIcon} alt="" />
            <DialogTitle id="cancel-title">신청을 취소할까요?</DialogTitle>
            <DialogText>
              취소 후 다시 참여하려면
              <br />
              새로 신청해야 해요.
            </DialogText>
            {cancelError && <CancelError>{cancelError}</CancelError>}
            <DialogActions>
              <YesButton type="button" disabled={cancelling} onClick={confirmCancel}>
                네
              </YesButton>
              <NoButton type="button" onClick={() => setConfirming(false)}>
                아니요
              </NoButton>
            </DialogActions>
          </Dialog>
        </Overlay>
      )}
    </Screen>
  );
}

function toHistoryRow(row) {
  return {
    id: row.historyId,
    status: STATUS_LABEL[row.toStatus] ?? row.toStatus,
    actor: ACTOR_LABEL[row.actor] ?? "",
    reason: row.reason ?? "",
    changedAt: formatHistoryTime(row.changedAt),
  };
}

function formatHistoryTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value ?? "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day} ${hours}:${minutes}`;
}

function toPhotos(urls) {
  return (Array.isArray(urls) ? urls : [])
    .filter(Boolean)
    .map((src, index) => ({ id: index + 1, src, position: "center" }));
}

function toApplicationDetail(data) {
  const region = [data.shelter?.region?.sido, data.shelter?.region?.sigungu].filter(Boolean).join(" ");
  const reason = [...(data.statusHistory ?? [])].reverse().find((row) => row.reason)?.reason ?? "";
  return {
    id: data.applicationId,
    status: STATUS_LABEL[data.status] ?? data.status,
    title: data.posting?.title ?? "",
    shelter: data.shelter?.name ?? "",
    shelterId: data.shelter?.shelterId,
    place: data.shelter?.address || region,
    detailSchedule: formatRange(data.schedule?.startAt, data.schedule?.endAt),
    appliedAt: formatApplied(data.appliedAt),
    postId: data.posting?.postingId,
    cancellable: data.cancellable,
    reason,
  };
}

function formatApplied(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value ?? "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day}`;
}

function formatRange(start, end) {
  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return "";
  const hours = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const head = `${startDate.getFullYear()}.${startDate.getMonth() + 1}.${startDate.getDate()} (${WEEKDAYS[startDate.getDay()]}) ${hours(startDate)}`;
  const endDate = new Date(end);
  if (Number.isNaN(endDate.getTime())) return head;
  return `${head}-${hours(endDate)}`;
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  overflow-x: hidden;
  background-color: #ffffff;
`;

const Hero = styled.div`
  position: relative;
  height: 298px;
  background-color: #dcdcdc;
`;

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

const PhotoTrack = styled.div`
  display: flex;
  height: 100%;
  transform: translate3d(${({ $index, $offset, $width }) => -$index * $width + $offset}px, 0, 0);
  transition: ${({ $dragging }) => ($dragging ? "none" : "transform 280ms ease")};
`;

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

const PhotoCount = styled.span`
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 2;
  padding: 4px 10px;
  border-radius: 999px;
  background-color: rgba(47, 56, 51, 0.8);
  color: #fbf6ee;
  font-size: 11px;
  font-weight: 700;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 18px 20px 8px;
`;

const Category = styled.span`
  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  height: 18px;
  padding: 0 8px;
  border-radius: 10px;
  background-color: #3e7556;
  color: #ffffff;
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

const ShelterButton = styled.button`
  align-self: flex-start;
  margin-top: 6px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #454545;
  font-size: 15px;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
`;

const SectionTitle = styled.h2`
  margin: 22px 0 0;
  color: #3e7556;
  font-size: 15px;
  font-weight: 700;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 11px;
`;

const InfoRow = styled.div`
  display: flex;
  gap: 13px;
  align-items: center;
`;

const InfoLabel = styled.span`
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

const HistoryList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 11px 0 0;
  padding: 0;
  list-style: none;
`;

const HistoryItem = styled.li`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const HistoryStatus = styled.span`
  color: #2f3833;
  font-size: 14px;
  font-weight: 600;
`;

const HistoryMeta = styled.span`
  color: #817f7f;
  font-size: 12px;
  font-weight: 500;
`;

const HistoryReason = styled.span`
  color: #4a524d;
  font-size: 13px;
  font-weight: 500;
`;

const Notice = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-top: 22px;
  padding: 16px 14px;
  border-radius: 10px;
  background-color: ${({ $background }) => $background};
`;

const StatusIcon = styled.img`
  flex-shrink: 0;
  width: 34px;
  height: 34px;
`;

const NoticeText = styled.div`
  min-width: 0;
`;

const NoticeTitle = styled.p`
  margin: 0;
  color: ${({ $color }) => $color};
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
`;

const NoticeBody = styled.p`
  margin: 4px 0 0;
  color: #2f3833;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  white-space: pre-line;
`;

const Reason = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-top: 10px;
  padding: 14px;
  border: 1px solid #e6e0d8;
  border-radius: 10px;
  background-color: #ffffff;
`;

const ReasonTitle = styled.p`
  margin: 0;
  color: #414141;
  font-size: 16px;
  font-weight: 600;
`;

const Actions = styled.div`
  margin-top: auto;
  padding: 20px 19px 28px;
`;

/* 가로로 긴 분홍색 둥근 사각형 버튼입니다. */
const Primary = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background-color: #e88b7a;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;

const LinkIcon = styled.img`
  width: 15px;
  height: 15px;
`;

/* 테두리만 있는 가로로 긴 둥근 사각형 버튼입니다. */
const Secondary = styled.button`
  width: 100%;
  height: 44px;
  margin-top: 10px;
  border: 1px solid #4a524d;
  border-radius: 10px;
  background-color: #ffffff;
  color: #4a524d;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;

const HomeLink = styled.button`
  display: block;
  width: 100%;
  margin-top: 16px;
  border: 0;
  background: transparent;
  color: #403a38;
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(42, 42, 42, 0.5);
`;

const Dialog = styled.div`
  position: relative;
  width: min(329px, calc(100% - 48px));
  padding: 28px 18px 22px;
  border-radius: 11px;
  background-color: #ffffff;
  text-align: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
`;

const CloseIcon = styled.img`
  width: 15px;
  height: 15px;
`;

const Dog = styled.img`
  width: 58px;
  height: 73px;
`;

const DialogTitle = styled.h2`
  margin: 12px 0 0;
  color: #2f3833;
  font-size: 21px;
  font-weight: 700;
`;

const CancelError = styled.p`
  margin: 8px 0 0;
  color: #c4513b;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
`;

const DialogText = styled.p`
  margin: 8px 0 0;
  color: #616161;
  font-size: 16px;
  font-weight: 500;
  line-height: 22px;
`;

const DialogActions = styled.div`
  display: flex;
  gap: 11px;
  margin-top: 22px;
`;

const YesButton = styled.button`
  flex: 1;
  height: 42px;
  border: 0;
  border-radius: 11px;
  background-color: #e3e0df;
  color: #2f3833;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

const NoButton = styled.button`
  flex: 1;
  height: 42px;
  border: 0;
  border-radius: 11px;
  background-color: #e88b7a;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

const MissingHeader = styled.div`
  position: relative;
  height: 64px;
`;

const Missing = styled.p`
  padding: 24px;
  color: #605b5b;
  font-size: 16px;
`;
