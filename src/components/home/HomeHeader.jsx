import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import PreferenceSummary from "./PreferenceSummary.jsx";
import headerImage from "../../assets/images/home/home-header.svg";
import dogImage from "../../assets/images/home/home-dog.svg";
import searchIcon from "../../assets/icons/onboarding/icon-search.svg";

/* 홈 맨 위 영역 */
export default function HomeHeader() {
  const navigate = useNavigate();

  return (
    <Wrapper>
      <Background src={headerImage} alt="" />

      <Card>
        <Dog src={dogImage} alt="" />
        <Title>
          오늘은 어떤 도움을
          <br />
          <Highlight>나눠 볼까요?</Highlight>
        </Title>

        <PreferenceSummary />

        <SearchButton type="button" onClick={() => navigate("/search")}>
          <SearchIcon src={searchIcon} alt="" />
          지역, 보호 시설, 봉사 활동 검색
        </SearchButton>
      </Card>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  padding: 55px 20px 0;
`;

const Background = styled.img`
  position: absolute;
  top: -37px;
  left: 0;
  width: 100%;
`;

const Card = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px 20px 16px;
  border-radius: 20px;
  background-color: #ffffff;
  box-shadow: 0 3px 12.9px rgba(0, 0, 0, 0.21);
`;

const Dog = styled.img`
  position: absolute;
  top: 24px;
  right: 28px;
  width: 79px;
  height: 88px;
`;

const Title = styled.h1`
  margin: 0 0 5px 10px;
  color: #000000;
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
`;

const Highlight = styled.span`
  margin-left: -4px;
  padding: 0 4px;
  background: linear-gradient(transparent 50%, rgba(189, 217, 196, 0.48) 50%);
`;

const SearchButton = styled.button`
  display: flex;
  gap: 5px;
  align-items: center;
  height: 42px;
  padding: 0 11px;
  border: 0.7px solid #000000;
  border-radius: 10px;
  background-color: #ffffff;
  color: #746b6b;
  font-size: 13.3px;
  font-weight: 500;
  cursor: pointer;
`;

const SearchIcon = styled.img`
  width: 18px;
  height: 18px;
`;