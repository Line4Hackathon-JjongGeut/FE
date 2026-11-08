import { NavLink } from "react-router-dom";
import styled from "styled-components";
import homeActiveIcon from "../../assets/icons/nav/nav-home.svg";
import homeIcon from "../../assets/icons/nav/nav-home-inactive.svg";
import mapActiveIcon from "../../assets/icons/nav/nav-map-active.svg";
import mapIcon from "../../assets/icons/nav/nav-map.svg";
import activitiesActiveIcon from "../../assets/icons/nav/nav-activities-active.svg";
import activitiesIcon from "../../assets/icons/nav/nav-activities.svg";
import myActiveIcon from "../../assets/icons/nav/nav-my-active.svg";
import myIcon from "../../assets/icons/nav/nav-my.svg";

const NAV_ITEMS = [
  { to: "/", label: "홈", icon: homeIcon, activeIcon: homeActiveIcon, end: true },
  { to: "/map", label: "지도", icon: mapIcon, activeIcon: mapActiveIcon },
  {
    to: "/activities",
    label: "참여내역",
    icon: activitiesIcon,
    activeIcon: activitiesActiveIcon,
  },
  { to: "/mypage", label: "마이", icon: myIcon, activeIcon: myActiveIcon },
];

export default function BottomNav() {
  return (
    <Bar aria-label="하단 메뉴">
      <Items>
        {NAV_ITEMS.map((item) => (
          <Item key={item.to} to={item.to} end={item.end}>
            {({ isActive }) => (
              <>
                <Icon src={isActive ? item.activeIcon : item.icon} alt="" />
                <Label>{item.label}</Label>
              </>
            )}
          </Item>
        ))}
      </Items>
    </Bar>
  );
}

const Bar = styled.nav`
  position: sticky;
  bottom: 0;
  z-index: 10;
  height: 90px;
  background-color: #ffffff;
  border-top: 1px solid #908b8a;
`;

const Items = styled.div`
  display: flex;
  padding: 7px 12px 0;
`;

const Item = styled(NavLink)`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  gap: 3.314px;
  padding: 6.628px 0;
  color: #908b8a;
  font-size: 12.151px;
  font-weight: 500;
  line-height: 15px;

  &.active {
    color: #c4513b;
    font-weight: 700;
  }
`;

const Icon = styled.img`
  display: block;
  flex-shrink: 0;
`;

const Label = styled.span`
  white-space: nowrap;
`;
