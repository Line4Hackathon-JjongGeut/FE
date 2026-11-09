import styled from "styled-components";

/* 소개 2·3번 화면. 동그란 배경, 캐릭터, 제목, 설명으로 구성 */
export default function IntroSlide({ circle, image, title, titleColor, description }) {
  return (
    <Slide>
      <Badge>
        <img src={circle} alt="" />
        <Character src={image} alt="" />
      </Badge>
      <Title $color={titleColor}>{title}</Title>
      <Description>{description}</Description>
    </Slide>
  );
}

const Slide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
  text-align: center;
`;

const Badge = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Character = styled.img`
  position: absolute;
`;

const Title = styled.h2`
  margin-top: 17px;
  color: ${({ $color }) => $color};
  font-family: "KCC-Ganpan", sans-serif;
  font-size: 32px;
  font-weight: 400;
  line-height: 38px;
  white-space: pre-line;
`;

const Description = styled.p`
  margin-top: 20px;
  color: #403a38;
  font-size: 20px;
  font-weight: 500;
  white-space: pre-line;
`;