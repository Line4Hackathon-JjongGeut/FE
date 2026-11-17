import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/auth/BackHeader.jsx";
import ProfileCard from "../../components/mypage/ProfileCard.jsx";
import MenuList from "../../components/mypage/MenuList.jsx";
import ConfirmModal from "../../components/mypage/ConfirmModal.jsx";
import { getMyAccount } from "../../api/users.js";
import { logout } from "../../api/auth.js";
import { clearTokens } from "../../utils/tokenStorage.js";
import { startDraft } from "../../dummyData/mypage/preferenceDraft.js";
import applyIcon from "../../assets/icons/mypage/icon-apply.svg";
import doneIcon from "../../assets/icons/mypage/icon-done.svg";
import interestIcon from "../../assets/icons/mypage/icon-interest.svg";
import profileIcon from "../../assets/icons/mypage/icon-profile.svg";
import conditionIcon from "../../assets/icons/mypage/icon-condition.svg";
import accountIcon from "../../assets/icons/mypage/icon-account.svg";

const TOAST_DURATION = 2000;

/* 서버의 role 값을 화면에 보여 줄 말로 */
const ROLE_LABELS = {
  USER: "일반 사용자",
  OPERATOR: "보호시설 운영자",
  ADMIN: "관리자",
};

/* 마이페이지 */
export default function MyPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const [account, setAccount] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 화면이 처음 열릴 때 한 번 내 정보를 불러옴
  useEffect(() => {
    let ignore = false;
    getMyAccount()
      .then((response) => {
        if (!ignore) setAccount(response.data);
      })
      .catch(() => {
        if (!ignore) setLoadFailed(true);
      });
    // 응답이 오기 전에 화면을 떠나면, 늦게 온 응답은 무시
    return () => {
      ignore = true;
    };
  }, []);

  /* 불러오는 중이면 빈칸, 실패하면 기본 문구, 성공하면 닉네임과 회원 유형 */
  let profileName = null;
  let profileType = null;
  if (account) {
    profileName = account.nickname ?? account.name;
    profileType = ROLE_LABELS[account.role] ?? "일반 사용자";
  } else if (loadFailed) {
    profileName = "회원";
    profileType = "정보를 불러오지 못했어요";
  }

  function showComingSoon() {
    clearTimeout(toastTimer.current);
    setToast("준비 중인 기능이에요.");
    toastTimer.current = setTimeout(() => setToast(""), TOAST_DURATION);
  }

  function openPreferenceEdit() {
    startDraft();
    navigate("/mypage/preferences");
  }

  async function handleLogout() {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // 서버 요청이 실패해도 이 기기에서는 로그아웃 처리
    }
    clearTokens();
    // 화면에 남아 있는 이전 사용자 정보까지 지우려고, 페이지를 새로 열면서 소개 화면으로
    window.location.replace("/intro");
  }

  const activityMenus = [
    { icon: applyIcon, label: "활동 내역", onClick: () => navigate("/activities", { state: { tab: "history" } }) },
    {
      icon: doneIcon,
      label: "완료한 활동",
      onClick: () => navigate("/activities", { state: { tab: "history", filter: "참여 완료" } }),
    },
    { icon: interestIcon, label: "저장된 활동", onClick: () => navigate("/activities", { state: { tab: "saved" } }) },
  ];

  const settingMenus = [
    { icon: profileIcon, label: "프로필 수정", onClick: showComingSoon },
    { icon: conditionIcon, label: "추천 조건 수정", onClick: openPreferenceEdit },
    { icon: accountIcon, label: "계정 관리", onClick: () => setLogoutOpen(true) },
  ];

  return (
    <Page>
      <BackHeader title="마이페이지" />

      <Body>
        <ProfileCard name={profileName} type={profileType} onEdit={showComingSoon} />

        <Group>
          <GroupTitle>내 활동</GroupTitle>
          <MenuList items={activityMenus} />
        </Group>

        <Group>
          <GroupTitle>내 설정</GroupTitle>
          <MenuList items={settingMenus} />
        </Group>
      </Body>

      {toast && <Toast role="status">{toast}</Toast>}

      {logoutOpen && (
        <ConfirmModal
          title="로그아웃할까요?"
          description="다시 이용하려면 로그인해야 해요."
          confirmLabel="로그아웃"
          cancelLabel="취소"
          onConfirm={handleLogout}
          onCancel={() => setLogoutOpen(false)}
        />
      )}
    </Page>
  );
}

const Page = styled.div`
  min-height: 100%;
  background-color: #ffffff;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 24px 40px;
`;

const Group = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const GroupTitle = styled.h2`
  padding-left: 3px;
  color: #4f7a5f;
  font-size: 20px;
  font-weight: 700;
`;

const Toast = styled.p`
  position: fixed;
  bottom: 110px;
  left: 50%;
  padding: 10px 16px;
  border-radius: 20px;
  background-color: rgba(47, 56, 51, 0.9);
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  transform: translateX(-50%);
`;