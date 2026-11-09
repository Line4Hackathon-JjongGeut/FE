import styled from "styled-components";
import blobImage from "../../assets/images/auth/intro-blob.svg";
import petsImage from "../../assets/images/auth/intro-pets.svg";
import pawRightImage from "../../assets/images/auth/intro-paw-right.svg";
import pawLeftImage from "../../assets/images/auth/intro-paw-left.svg";

/* 소개 1번 화면. 배경, 강아지·고양이, 발바닥, 쫑긋 로고를 겹쳐서 배치 */
export default function IntroHero() {
  return (
    <Slide>
      <Art>
        <Blob src={blobImage} alt="" />
        <Pets src={petsImage} alt="" />
        <PawRight src={pawRightImage} alt="" />
        <PawLeft src={pawLeftImage} alt="" />
        <Logo>쫑긋</Logo>
      </Art>
      <Description>
        보호소와 봉사자를 이어주는
        <br />
        반려동물 봉사 플랫폼
      </Description>
    </Slide>
  );
}

const Slide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

/* 피그마 좌표 그대로 겹치기 위해 기준 상자 생성 */
const Art = styled.div`
  position: relative;
  width: 306px;
  height: 300px;
`;

const Blob = styled.img`
  position: absolute;
  top: 20px;
  left: 7px;
`;

const Pets = styled.img`
  position: absolute;
  top: 95px;
  left: 38px;
`;

const PawRight = styled.img`
  position: absolute;
  top: 211px;
  left: 217px;
`;

const PawLeft = styled.img`
  position: absolute;
  top: 246px;
  left: 28px;
`;

const Logo = styled.p`
  position: absolute;
  top: 227px;
  left: 50%;
  transform: translateX(-50%);
  color: #332c29;
  font-family: "KCC-Ganpan", sans-serif;
  font-size: 63px;
  line-height: 63px;
  white-space: nowrap;
`;

const Description = styled.p`
  margin-top: 6px;
  color: #403a38;
  font-size: 20px;
  font-weight: 500;
  text-align: center;
`;
