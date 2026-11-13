import { useEffect, useRef, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import styled from "styled-components";
import searchIcon from "../../assets/icons/map/search.svg";
import checkIcon from "../../assets/icons/map/check.svg";
import viewAllIcon from "../../assets/icons/map/view-all.svg";
import pinIcon from "../../assets/icons/map/pin.svg";
import calendarIcon from "../../assets/icons/map/calendar.svg";
import photoPawIcon from "../../assets/icons/map/photo-paw.svg";
import pawIcon from "../../assets/icons/map/paw-alt.svg";
import pawFilledIcon from "../../assets/icons/map/paw-filled.svg";
import animalInfoIcon from "../../assets/icons/map/animal-info.svg";
import shelterPhoto from "../../assets/icons/map/shelter-photo.png";
import { FILTERS, FILTER_COLORS, PLACES } from "../../dummyData/map/mapDummy.js";

const NAV_HEIGHT = 90;

export default function Map() {
  const navigate = useNavigate();
  const { setHideNav } = useOutletContext();
  const [filter, setFilter] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [favorites, setFavorites] = useState(() => new Set());
  const dragStartY = useRef(null);
  const filterTimer = useRef(null);

  /* 시트가 열려 있는 동안 하단 메뉴를 숨기고, 페이지를 떠나면 다시 보여 줍니다. */
  useEffect(() => {
    setHideNav(expanded);
    return () => setHideNav(false);
  }, [expanded, setHideNav]);

  useEffect(() => () => clearTimeout(filterTimer.current), []);

  /* 같은 필터를 다시 누르면 내려가고, 다른 필터를 누르면 내려간 뒤 새 카드가 올라옵니다. */
  function selectFilter(name) {
    clearTimeout(filterTimer.current);
    setExpanded(false);

    if (filter === name) {
      setFilter(null);
      return;
    }

    if (filter) {
      setFilter(null);
      filterTimer.current = setTimeout(() => setFilter(name), 280);
      return;
    }

    setFilter(name);
  }

  function toggleFavorite(id) {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const places = PLACES.filter((place) => {
    return (
      !filter ||
      filter === "전체" ||
      (filter === "즐겨찾기" ? favorites.has(place.id) : place.category === filter)
    );
  });

  /* 손잡이를 위로 밀면 열리고, 아래로 밀면 닫힙니다. 거의 움직이지 않고 누르면 열림과 닫힘이 바뀝니다. */
  function handleDragStart(event) {
    dragStartY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleDragEnd(event) {
    const delta = event.clientY - dragStartY.current;
    if (delta <= -30) setExpanded(true);
    else if (delta >= 30) setExpanded(false);
    else setExpanded((open) => !open);
  }

  const showingPreview = Boolean(filter) && places.length > 0;

  /* 올라온 시트의 바깥 배경을 누르면 시트가 내려가고 선택된 필터도 해제됩니다. */
  function closeFromBackground() {
    if (!expanded && !filter) return;
    clearTimeout(filterTimer.current);
    setExpanded(false);
    setFilter(null);
  }

  return (
    <Screen>
      {/* 지도 API가 붙기 전, 피그마의 빈 지도 배경만 보여 주는 영역 */}
      <MapArea aria-label="지도 영역" onClick={closeFromBackground} />

      <Top onClick={(event) => event.target === event.currentTarget && closeFromBackground()}>
        {/* 지역, 보호 시설 이름 검색 */}
        <SearchBox type="button" onClick={() => navigate("/search")}>
          <Icon src={searchIcon} alt="" />
          <SearchPlaceholder>지역, 보호 시설 이름으로 검색</SearchPlaceholder>
        </SearchBox>

        {/* 필터를 누르면 카드 한 장이 올라옵니다. 전체를 눌러도 한 장만 올라옵니다. */}
        <Filters>
          {FILTERS.map((name) => (
            <FilterChip
              key={name}
              type="button"
              $active={filter === name}
              $color={FILTER_COLORS[name]}
              onClick={() => selectFilter(name)}
            >
              {name}
            </FilterChip>
          ))}
        </Filters>
      </Top>

      {/* 필터가 없을 때만 전체보기 버튼이 보입니다. */}
      {!expanded && !filter && (
        <ViewAll type="button" onClick={() => setExpanded(true)}>
          <Icon src={viewAllIcon} alt="" />
          전체보기
        </ViewAll>
      )}

      {/* 필터를 고르면 카드 하나 높이만 올라오고, 시트를 올리면 목록 전체가 보입니다. */}
      <Sheet
        $expanded={expanded}
        $preview={showingPreview}
        $empty={Boolean(filter) && places.length === 0}
      >
        <Handle
          aria-label={expanded ? "목록 접기" : "목록 펼치기"}
          onPointerDown={handleDragStart}
          onPointerUp={handleDragEnd}
        >
          <Grip />
        </Handle>
        <List>
          {places.length === 0 ? (
            <Empty>
              {filter === "즐겨찾기"
                ? "즐겨찾기한 활동이 없습니다."
                : "조건에 맞는 활동이 없습니다."}
            </Empty>
          ) : (
            (expanded ? places : places.slice(0, 1)).map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                favorite={favorites.has(place.id)}
                onToggleFavorite={toggleFavorite}
                onOpenPost={() => navigate(`/shelters/volunteer/${place.id}`)}
                onOpenShelter={() => navigate(`/shelters/${place.shelterId}`)}
              />
            ))
          )}
        </List>
      </Sheet>
    </Screen>
  );
}

/* 바텀시트 안의 활동 카드 한 장. 보호소 이름은 시설 상세, 나머지 카드는 공고 상세로 갑니다. */
function PlaceCard({ place, favorite, onToggleFavorite, onOpenPost, onOpenShelter }) {
  return (
    <Card onClick={onOpenPost}>
      <CardHead>
        <div>
          <BadgeRow>
            <Badge>
              <Icon src={checkIcon} alt="" />
              쫑긋 인증
            </Badge>
            <ShelterButton
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenShelter();
              }}
            >
              {place.shelter}
            </ShelterButton>
          </BadgeRow>
          <Title>{place.title}</Title>
        </div>
        {/* 발바닥은 즐겨찾기. 누르면 색이 채워지고, 다시 누르면 빠집니다. */}
        <FavoriteButton
          type="button"
          aria-pressed={favorite}
          aria-label={favorite ? "즐겨찾기 해제" : "즐겨찾기"}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(place.id);
          }}
        >
          <Icon src={favorite ? pawFilledIcon : pawIcon} alt="" />
        </FavoriteButton>
      </CardHead>

      {place.info ? (
        <Meta>
          <Icon src={animalInfoIcon} alt="" />
          {place.info}
        </Meta>
      ) : (
        <>
          <Meta>
            <Icon src={pinIcon} alt="" />
            {place.address}
          </Meta>
          <Meta>
            <Icon src={calendarIcon} alt="" />
            {place.time}
          </Meta>
        </>
      )}

      {/* 첫 칸은 보호소 사진, 나머지는 사진이 생기기 전의 자리 표시 */}
      <Photos>
        {place.photos.map((photo, index) =>
          photo.image ? (
            <PhotoImage key={`${place.id}-${index}`} src={shelterPhoto} alt="행복한동물보호소" />
          ) : (
            <Photo key={`${place.id}-${index}`}>
              <Icon src={photoPawIcon} alt="" />
              {photo.label}
            </Photo>
          ),
        )}
      </Photos>
    </Card>
  );
}

const Screen = styled.div`
  position: relative;
  height: calc(100dvh - ${NAV_HEIGHT}px);
  overflow: hidden;
  background-color: #f4efe6;
`;

const MapArea = styled.div`
  position: absolute;
  inset: 0;
`;

const Top = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 40px 20px 0;
`;

const SearchBox = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 47px;
  padding: 0 16px;
  border: 1px solid #382f2f;
  border-radius: 10px;
  background-color: #ffffff;
  cursor: pointer;
  text-align: left;
`;

const SearchPlaceholder = styled.span`
  color: #382f2f;
  font-size: 15px;
  font-weight: 500;
`;

const Filters = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
`;

const FilterChip = styled.button`
  flex-shrink: 0;
  height: 34px;
  padding: 0 12px;
  border: 1px solid #382f2f;
  border-radius: 18px;
  border-color: ${({ $active, $color }) => ($active && $color ? $color : "#382f2f")};
  background-color: ${({ $active, $color }) => ($active && $color ? $color : "#ffffff")};
  color: ${({ $active, $color }) => ($active && $color ? "#ffffff" : "#382f2f")};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`;

const ViewAll = styled.button`
  position: absolute;
  bottom: 52px;
  left: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: 18px;
  background-color: #ffffff;
  color: #382f2f;
  font-size: 13px;
  font-weight: 700;
  transform: translateX(-50%);
  cursor: pointer;
`;

const Sheet = styled.section`
  position: fixed;
  bottom: ${({ $expanded }) => ($expanded ? "0" : `${NAV_HEIGHT}px`)};
  left: 50%;
  z-index: 20;
  display: flex;
  flex-direction: column;
  width: min(100%, 390px);
  height: ${({ $expanded, $preview, $empty }) =>
    $expanded ? "calc(100dvh - 40px)" : $preview ? "320px" : $empty ? "120px" : "36px"};
  overflow: hidden;
  border-radius: 20px 20px 0 0;
  background-color: #ffffff;
  transform: translateX(-50%);
  transition:
    height 0.28s ease,
    bottom 0.28s ease;
`;

const Handle = styled.button`
  flex-shrink: 0;
  width: 100%;
  height: 36px;
  padding: 13px 0 0;
  border: 0;
  background: transparent;
  touch-action: none;
  cursor: grab;
`;

const Grip = styled.span`
  display: block;
  width: 38px;
  height: 4px;
  margin: 0 auto;
  border-radius: 15px;
  background-color: #c9c9c9;
`;

const List = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
  padding-bottom: 24px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Empty = styled.p`
  padding: 24px 21px;
  color: #646464;
  font-size: 14px;
`;

const Card = styled.article`
  padding-bottom: 14px;
  border-bottom: 1px solid #e6e6e6;
  cursor: pointer;
`;

const FavoriteButton = styled.button`
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
`;

const CardHead = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 0 21px;
`;

const BadgeRow = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 20px;
  padding: 0 6px;
  border-radius: 4.6px;
  background-color: #e3f0e6;
  color: #2f3833;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
`;

const ShelterButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  color: #5a4f4f;
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
`;

const Title = styled.h2`
  margin-top: 8px;
  color: #212121;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.35;
`;

const Meta = styled.p`
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  padding: 0 21px;
  color: #646464;
  font-size: 13px;
  font-weight: 500;
`;

const Photos = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 14px;
  padding-left: 19px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const PhotoImage = styled.img`
  flex: 0 0 160px;
  width: 160px;
  height: 119px;
  border-radius: 5.714px;
  object-fit: cover;
`;

const Photo = styled.div`
  display: flex;
  flex: 0 0 160px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 119px;
  border-radius: 5.714px;
  background-color: #bdd9c4;
  color: #2f3833;
  font-size: 12.5px;
  font-weight: 600;
`;

const Icon = styled.img`
  display: block;
  flex-shrink: 0;
`;
