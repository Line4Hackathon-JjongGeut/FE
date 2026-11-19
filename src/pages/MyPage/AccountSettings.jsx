import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/auth/BackHeader.jsx";
import MenuList from "../../components/mypage/MenuList.jsx";
import ConfirmModal from "../../components/mypage/ConfirmModal.jsx";
import { getMyAccount, deleteMyAccount } from "../../api/users.js";
import { logout } from "../../api/auth.js";
import { clearTokens } from "../../utils/tokenStorage.js";
import idIcon from "../../assets/icons/mypage/icon-id.svg";
import lockIcon from "../../assets/icons/mypage/icon-lock.svg";
import documentIcon from "../../assets/icons/mypage/icon-document.svg";
import logoutIcon from "../../assets/icons/mypage/icon-logout.svg";
import withdrawIcon from "../../assets/icons/mypage/icon-withdraw.svg";
import withdrawCat from "../../assets/images/mypage/withdraw-cat.svg";

const TOAST_DURATION = 2000;

/* 마이페이지 > 계정 관리 */
export default function AccountSettings() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [modal, setModal] = useState(null); // null | "logout" | "withdraw"
  const [isWorking, setIsWorking] = useState(false); // 로그아웃·탈퇴 요청 중 (버튼 두 번 누르기 방지)
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  // 아이디 줄 오른쪽에 보여 줄 내 아이디
  useEffect(() => {
    let ignore = false;
    getMyAccount()
      .then((response) => {
        if (!ignore) setLoginId(response.data?.loginId ?? "");
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  // 화면을 나갈 때 남아 있는 안내 타이머 정리
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  function showToast(message) {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), TOAST_DURATION);
  }

  function leaveApp() {
    clearTokens();
    window.location.replace("/intro");
  }

  async function handleLogout() {
    if (isWorking) return;
    setIsWorking(true);
    try {
      await logout();
    } catch {
      // 서버 요청이 실패해도 이 기기에서는 로그아웃 처리
    }
    leaveApp();
  }

  async function handleWithdraw() {
    if (isWorking) return;
    setIsWorking(true);
    try {
      await deleteMyAccount();
      leaveApp();
    } catch {
      // 탈퇴는 서버에서 처리돼야 하니까, 실패하면 로그인 상태를 그대로 두고 알려 줌
      setIsWorking(false);
      setModal(null);
      showToast("탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  }

  const comingSoon = () => showToast("준비 중인 기능이에요.");

  const infoMenus = [
    { icon: idIcon, label: "아이디", value: loginId, onClick: comingSoon },
    { icon: lockIcon, label: "비밀번호 변경", onClick: comingSoon },
    { icon: documentIcon, label: "개인정보 처리방침", onClick: comingSoon },
    { icon: documentIcon, label: "서비스 이용약관", onClick: comingSoon },
  ];

  const accountMenus = [
    { icon: logoutIcon, label: "로그아웃", onClick: () => setModal("logout") },
    { icon: withdrawIcon, label: "회원 탈퇴", danger: true, onClick: () => setModal("withdraw") },
  ];

  return (
    <Page>
      <BackHeader title="계정 관리" onBack={() => navigate(-1)} />

      <Body>
        <MenuList items={infoMenus} />

        <Group>
          <GroupTitle>계정</GroupTitle>
          <MenuList items={accountMenus} />
        </Group>
      </Body>

      {toast && <Toast role="status">{toast}</Toast>}

      {modal === "logout" && (
        <ConfirmModal
          title="로그아웃할까요?"
          description="현재 계정에서 로그아웃됩니다."
          confirmLabel="로그아웃"
          cancelLabel="취소"
          primary="confirm"
          disabled={isWorking}
          onConfirm={handleLogout}
          onCancel={() => setModal(null)}
        />
      )}

      {modal === "withdraw" && (
        <ConfirmModal
          title="회원을 탈퇴하시겠어요?"
          description={"탈퇴 시 계정 정보와 신청 내역이 삭제되며\n복구할 수 없어요."}
          confirmLabel="탈퇴하기"
          cancelLabel="취소"
          primary="confirm"
          image={withdrawCat}
          imageWidth={61}
          disabled={isWorking}
          onConfirm={handleWithdraw}
          onCancel={() => setModal(null)}
        />
      )}
    </Page>
  );
}

const Page = styled.div`
  min-height: 100dvh;
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
  bottom: 60px;
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