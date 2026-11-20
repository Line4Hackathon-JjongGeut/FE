import { useState } from "react";
import styled from "styled-components";
import chevronIcon from "../../assets/icons/search/chevron.svg";
import profilePhoto from "../../assets/images/mypage/profile-paw.png";

/* 마이페이지 맨 위 프로필 카드. 계정 조회 사진이 없으면 발바닥 사진을 씁니다. */
export default function ProfileCard({ name, type, image, imageReady, onEdit }) {
  const [imageFailed, setImageFailed] = useState(false);
  const photo = imageReady && image && !imageFailed ? image : imageReady ? profilePhoto : "";

  return (
    <Card>
      <Avatar alt="" {...(photo ? { src: photo } : {})} onError={() => setImageFailed(true)} />
      <Text>
        <Name>{name ? `${name} 님` : ""}</Name>
        <Type>{type}</Type>
      </Text>
      <EditButton type="button" onClick={onEdit}>
        프로필 수정
        <Chevron src={chevronIcon} alt="" />
      </EditButton>
    </Card>
  );
}

const Card = styled.div`
  position: relative;
  display: flex;
  gap: 15px;
  align-items: center;
  height: 105px;
  padding: 0 16px;
  border-radius: 10px;
  background-color: #deebde;
`;

const Avatar = styled.img`
  flex-shrink: 0;
  width: 65px;
  height: 65px;
  border: 4px solid #ffffff;
  border-radius: 50%;
  object-fit: cover;
  background-color: #ffffff;
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Name = styled.p`
  min-height: 26px;
  color: #000000;
  font-size: 22px;
  font-weight: 700;
`;

const Type = styled.p`
  min-height: 17px;
  color: #858585;
  font-size: 14px;
  font-weight: 600;
`;

const EditButton = styled.button`
  position: absolute;
  top: 17px;
  right: 17px;
  display: flex;
  gap: 6px;
  align-items: center;
  height: 26px;
  padding: 0 11px 0 13px;
  border: 0;
  border-radius: 21px;
  background-color: #fefefe;
  color: #525252;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`;

const Chevron = styled.img`
  width: 8px;
  height: 4px;
  transform: rotate(-90deg);
`;