import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import SectionHeader from "./SectionHeader.jsx";
import HelpTile from "./HelpTile.jsx";
import donateIcon from "../../assets/icons/home/icon-donate.svg";
import fosterIcon from "../../assets/icons/home/icon-foster.svg";

const HELP_TILES = [
  {
    filter: "후원",
    icon: donateIcon,
    iconSize: 23,
    title: "후원하기",
    description: "필요한 물품과 후원 정보를\n확인하세요.",
    colors: { background: "#fbe3dc", title: "#5a4b4b", description: "#948282", arrow: "#e88b7a" },
  },
  {
    filter: "임시보호",
    icon: fosterIcon,
    iconSize: 16,
    title: "임시보호 찾기",
    description: "잠시 가족이 필요한 동물을\n만나보세요.",
    colors: { background: "#e3f0e6", title: "#4b5a4c", description: "#859482", arrow: "#6f957d" },
  },
];

/* 홈 맨 아래 "다른 방법으로 도와주기" 섹션 */
export default function HelpSection() {
  const navigate = useNavigate();

  return (
    <Section>
      <SectionHeader title="다른 방법으로 도와주기" />
      <Tiles>
        {HELP_TILES.map((tile) => (
          <HelpTile
            key={tile.filter}
            icon={tile.icon}
            iconSize={tile.iconSize}
            title={tile.title}
            description={tile.description}
            colors={tile.colors}
            onClick={() => navigate("/map", { state: { filter: tile.filter } })}
          />
        ))}
      </Tiles>
    </Section>
  );
}

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 26px;
`;

const Tiles = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;