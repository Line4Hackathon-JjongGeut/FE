import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/auth/BackHeader.jsx";
import ProfileCard from "../../components/mypage/ProfileCard.jsx";
import MenuList from "../../components/mypage/MenuList.jsx";
import { USER } from "../../dummyData/mypage/userDummy.js";
import applyIcon from "../../assets/icons/mypage/icon-apply.svg";
import doneIcon from "../../assets/icons/mypage/icon-done.svg";
import interestIcon from "../../assets/icons/mypage/icon-interest.svg";
import profileIcon from "../../assets/icons/mypage/icon-profile.svg";
import conditionIcon from "../../assets/icons/mypage/icon-condition.svg";
import accountIcon from "../../assets/icons/mypage/icon-account.svg";

const TOAST_DURATION = 2000;

/* 마이페이지 */
export default function MyPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  function showComingSoon() {
    clearTimeout(toastTimer.current);
    setToast("준비 중인 기능이에요.");
    toastTimer.current = setTimeout(() => setToast(""), TOAST_DURATION);
  }

  const activityMenus = [
    { icon: applyIcon, label: "신청 내역", onClick: () => navigate("/activities", { state: { tab: "history" } }) },
    {
      icon: doneIcon,
      label: "완료한 활동",
      onClick: () => navigate("/activities", { state: { tab: "history", filter: "참여 완료" } }),
    },
    {
      icon: interestIcon,
      label: "관심 활동",
      onClick: () => navigate("/map", { state: { filter: "즐겨찾기" } }),
    },
  ];

  const settingMenus = [
    { icon: profileIcon, label: "프로필 수정", onClick: showComingSoon },
    { icon: conditionIcon, label: "추천 조건 수정", onClick: () => navigate("/mypage/preferences") },
    { icon: accountIcon, label: "계정 관리", onClick: showComingSoon },
  ];

  return (
    <Page>
      <BackHeader title="마이페이지" />

      <Body>
        <ProfileCard name={USER.name} type={USER.type} onEdit={showComingSoon} />

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