
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import styled, { css, keyframes } from "styled-components";
import searchIcon from "../../assets/icons/map/search.svg";
import checkIcon from "../../assets/icons/map/check.svg";
import viewAllIcon from "../../assets/icons/map/view-all.svg";
import pinIcon from "../../assets/icons/map/pin.svg";
import calendarIcon from "../../assets/icons/map/calendar.svg";
import pawIcon from "../../assets/icons/map/paw-alt.svg";
import pawFilledIcon from "../../assets/icons/map/paw-filled.svg";
import animalInfoIcon from "../../assets/icons/map/animal-info.svg";
import { FILTERS, FILTER_COLORS } from "../../dummyData/map/mapDummy.js";
import { getPostingDetail } from "../../api/postings.js";
import { getShelterPostings, getShelters } from "../../api/shelters.js";
import { getBookmarkedPostings, getBookmarkedShelters, setSavedFavorite } from "../../api/activities.js";
import { loadKakaoMap } from "../../lib/kakaoMap.js";

const SEOUL = { lat: 37.5665, lng: 126.978 };

const POSTING_CATEGORY = {
  VOLUNTEER: "봉사",
  DONATION: "후원",
  FOSTER: "임시보호",
};

/* 공고 사진이 있으면 그걸 쓰고, 없으면 시설 썸네일을 씁니다. */
function cardPhotos(shelter, posting) {
  const urls = [
    ...(Array.isArray(posting?.imageUrls) ? posting.imageUrls : []),
    posting?.thumbnailUrl,
    shelter?.thumbnailUrl,
  ].filter(Boolean);
  return [...new Set(urls)].map((src) => ({ src }));
}

const NAV_HEIGHT = 90;

const SHEET_MS = 340;

/* 카드 한 장이 화면 아래에서 올라옵니다. */
const sheetRise = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;

/* 카드 한 장이 화면 아래로 내려갑니다. */
const sheetDrop = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(100%);
  }
`;

/* 가운데 정렬된 전체 목록도 아래로 내려갑니다. */
const sheetDropCentered = keyframes`
  from {
    transform: translateX(-50%) translateY(0);
  }
  to {
    transform: translateX(-50%) translateY(100%);
  }
`;

// 카드 종류에 맞는 상세 페이지로 이동합니다.
function postPath(place) {
  if (place.category === "후원") return `/donations/${place.id}`;
  if (place.category === "임시보호") return `/fosters/${place.id}`;
  return `/shelters/volunteer/${place.id}`;
}

export default function Map() {
  const navigate = useNavigate();
  const { setHideNav } = useOutletContext();
  const location = useLocation();
  const [filter, setFilter] = useState(location.state?.filter ?? null);
  const [expanded, setExpanded] = useState(false);
  const [shelters, setShelters] = useState(null);
  const [bookmarkedShelterIds, setBookmarkedShelterIds] = useState(null);
  const [bookmarkedPostings, setBookmarkedPostings] = useState([]);
  const [postingsByShelter, setPostingsByShelter] = useState({});
  const [selectedShelterId, setSelectedShelterId] = useState(null);
  const [riseKey, setRiseKey] = useState(0);
  const [playRise, setPlayRise] = useState(false);
  const [dropping, setDropping] = useState(false);
  const dragStartY = useRef(null);
  const dropTimer = useRef(null);
  const dropNextRef = useRef(null);
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const closeRef = useRef(() => {});
  const selectRef = useRef(() => {});
  const markerPickRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapShown, setMapShown] = useState(false);

  /* 시트가 열려 있는 동안 하단 메뉴를 숨기고, 페이지를 떠나면 다시 보여 줍니다. */
  useEffect(() => {
    setHideNav(expanded);
    return () => setHideNav(false);
  }, [expanded, setHideNav]);

  useEffect(() => () => clearTimeout(dropTimer.current), []);

  /* 빈 지도 자리에 카카오 지도를 올립니다. 스크립트가 거절되면 빈 배경을 유지합니다. */
  useEffect(() => {
    let ignore = false;

    loadKakaoMap()
      .then((kakao) => {
        if (ignore || !mapElementRef.current || mapRef.current) return;
        const map = new kakao.maps.Map(mapElementRef.current, {
          center: new kakao.maps.LatLng(SEOUL.lat, SEOUL.lng),
          level: 8,
        });
        mapRef.current = map;
        kakao.maps.event.addListener(map, "click", () => closeRef.current());
        requestAnimationFrame(() => map.relayout());
        setMapReady(true);
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, []);

  const markerKey = (shelters ?? [])
    .filter((item) => item.latitude != null && item.longitude != null)
    .map((item) => `${item.shelterId}:${Number(item.latitude)},${Number(item.longitude)}`)
    .join("|");

  const sheltersLoaded = shelters !== null;

  /* 보호시설 좌표가 있으면 마커를 찍고, 없으면 서울을 중심으로 둡니다. 위치가 정해진 뒤에만 지도를 보여 줍니다. */
  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.kakao?.maps || !sheltersLoaded) return undefined;
    const kakao = window.kakao;
    const map = mapRef.current;
    markersRef.current.forEach((marker) => marker.setMap(null));

    const points = markerKey
      .split("|")
      .filter(Boolean)
      .map((token) => {
        const [shelterId, coords] = token.split(":");
        const [lat, lng] = (coords ?? "").split(",").map(Number);
        return { shelterId, lat, lng };
      })
      .filter((point) => point.shelterId && Number.isFinite(point.lat) && Number.isFinite(point.lng));

    if (!points.length) {
      markersRef.current = [];
      map.setCenter(new kakao.maps.LatLng(SEOUL.lat, SEOUL.lng));
      map.setLevel(8);
    } else {
      const bounds = new kakao.maps.LatLngBounds();
      markersRef.current = points.map((point) => {
        const position = new kakao.maps.LatLng(point.lat, point.lng);
        bounds.extend(position);
        const marker = new kakao.maps.Marker({ position });
        marker.setMap(map);
        kakao.maps.event.addListener(marker, "click", () => selectRef.current(point.shelterId));
        return marker;
      });

      if (points.length === 1) {
        map.setCenter(new kakao.maps.LatLng(points[0].lat, points[0].lng));
        map.setLevel(5);
      } else {
        map.setBounds(bounds);
      }
    }

    map.relayout();
    setMapShown(true);
    requestAnimationFrame(() => map.relayout());
    return undefined;
  }, [mapReady, markerKey, sheltersLoaded]);

  /* 보호시설 목록을 가져옵니다. 응답 전에는 카드를 보여 주지 않습니다. */
  useEffect(() => {
    let ignore = false;

    getShelters()
      .then((result) => {
        if (ignore) return;
        setShelters(result?.isSuccess ? result.data?.items ?? [] : []);
      })
      .catch(() => {
        if (!ignore) setShelters([]);
      });

    return () => {
      ignore = true;
    };
  }, []);

  /* 즐겨찾기는 저장한 시설과, 저장한 공고의 시설을 함께 보여 줍니다. */
  useEffect(() => {
    let ignore = false;

    Promise.all([
      getBookmarkedShelters({ page: 0, size: 50 }).catch(() => null),
      getBookmarkedPostings({ page: 0, size: 50 }).catch(() => null),
    ]).then(([shelterResult, postingResult]) => {
      if (ignore) return;
      const shelters = shelterResult?.isSuccess ? shelterResult.data?.items ?? [] : [];
      const postings = postingResult?.isSuccess ? postingResult.data?.items ?? [] : [];
      setBookmarkedShelterIds(shelters.map((item) => item.shelterId));
      setBookmarkedPostings(postings.map((item) => ({
        postingId: item.postingId,
        shelterId: item.shelterId,
      })));
    });

    return () => {
      ignore = true;
    };
  }, []);

  const shelterIdsKey = (shelters ?? []).map((item) => item.shelterId).join("|");

  /* 시설마다 가장 빠른 모집공고와 그 공고의 사진을 가져옵니다. */
  useEffect(() => {
    const ids = shelterIdsKey.split("|").filter(Boolean);
    if (!ids.length) return undefined;
    let ignore = false;

    Promise.all(
      ids.map(async (shelterId) => {
        try {
          const result = await getShelterPostings(shelterId, { page: 0, size: 1 });
          const posting = result?.isSuccess ? result.data?.items?.[0] ?? null : null;
          if (!posting?.postingId) return [shelterId, posting];
          try {
            const detail = await getPostingDetail(posting.postingId);
            const imageUrls = detail?.isSuccess && Array.isArray(detail.data?.imageUrls)
              ? detail.data.imageUrls.filter(Boolean)
              : [];
            return [shelterId, { ...posting, imageUrls }];
          } catch {
            return [shelterId, posting];
          }
        } catch {
          return [shelterId, null];
        }
      }),
    ).then((pairs) => {
      if (!ignore) setPostingsByShelter(Object.fromEntries(pairs));
    });

    return () => {
      ignore = true;
    };
  }, [shelterIdsKey]);

  /* 열려 있는 시트를 아래로 내린 뒤 다음 동작을 실행합니다. 닫힌 상태면 바로 실행합니다. */
  function runAfterDrop(next) {
    if (dropping) {
      dropNextRef.current = next;
      return;
    }

    const sheetOpen = expanded || Boolean(filter) || selectedShelterId != null;
    if (!sheetOpen) {
      next();
      return;
    }

    setPlayRise(false);
    setDropping(true);
    dropNextRef.current = next;
    clearTimeout(dropTimer.current);
    dropTimer.current = setTimeout(() => {
      setDropping(false);
      const action = dropNextRef.current;
      dropNextRef.current = null;
      action?.();
    }, SHEET_MS);
  }

  /* 같은 필터를 다시 누르면 내려가고, 다른 필터를 누르면 내려간 뒤 새 카드가 올라옵니다. */
  function selectFilter(name) {
    if (filter === name) {
      runAfterDrop(() => {
        setFilter(null);
        setExpanded(false);
        setSelectedShelterId(null);
      });
      return;
    }

    const openNext = () => {
      setFilter(name);
      setExpanded(false);
      setSelectedShelterId(null);
      setRiseKey((value) => value + 1);
    };

    if (expanded || filter || selectedShelterId != null) {
      runAfterDrop(openNext);
      return;
    }

    openNext();
  }

  function toggleFavorite(place) {
    toggleShelterBookmark(place);
  }

  async function toggleShelterBookmark(place) {
    const shelterId = place.shelterId;
    const saved = Boolean(place.bookmarked);
    const postingIds = [
      ...bookmarkedPostings
        .filter((item) => String(item.shelterId) === String(shelterId))
        .map((item) => item.postingId),
      place.postingId,
    ].filter((id, index, list) => id != null && list.findIndex((item) => String(item) === String(id)) === index);

    try {
      await setSavedFavorite({
        shelterId,
        postingIds: saved ? postingIds : [place.postingId].filter((id) => id != null),
        saved,
      });

      setBookmarkedShelterIds((current) => {
        const ids = (current ?? []).filter((id) => String(id) !== String(shelterId));
        return saved ? ids : [shelterId, ...ids];
      });
      setBookmarkedPostings((current) => {
        const rest = current.filter((item) => String(item.shelterId) !== String(shelterId));
        if (saved || place.postingId == null) return rest;
        return [{ postingId: place.postingId, shelterId }, ...rest];
      });
      setShelters((current) =>
        current?.map((item) =>
          item.shelterId === shelterId ? { ...item, bookmarked: !saved } : item,
        ) ?? current,
      );
    } catch {
      /* 저장에 실패하면 목록은 그대로 둡니다. */
    }
  }

  function isBookmarkedShelter(shelterId) {
    const key = String(shelterId);
    if ((bookmarkedShelterIds ?? []).some((id) => String(id) === key)) return true;
    return bookmarkedPostings.some((item) => String(item.shelterId) === key);
  }

  function bookmarkOrder(shelterId) {
    const index = (bookmarkedShelterIds ?? []).findIndex((id) => String(id) === String(shelterId));
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  }

  const shelterPlaces = (shelters ?? []).map((item) => {
    const posting = postingsByShelter[item.shelterId];
    return {
      id: item.shelterId,
      shelterId: item.shelterId,
      title: posting?.title ?? "",
      postingId: posting?.postingId,
      category: POSTING_CATEGORY[posting?.postingType],
      shelter: item.name,
      address: item.address,
      bookmarked: isBookmarkedShelter(item.shelterId),
      photos: cardPhotos(item, posting),
    };
  });

  const places = shelterPlaces
    .filter((place) => {
      if (!filter || filter === "전체") return true;
      if (filter === "즐겨찾기") return place.bookmarked;
      return place.category === filter;
    })
    .sort((a, b) => {
      if (filter !== "즐겨찾기") return 0;
      return bookmarkOrder(a.shelterId) - bookmarkOrder(b.shelterId);
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

  const selectedPlace = selectedShelterId == null
    ? null
    : shelterPlaces.find((place) => String(place.shelterId) === String(selectedShelterId)) ?? null;
  const showingPreview = Boolean(selectedPlace) || (Boolean(filter) && places.length > 0);
  const emptyPreview = Boolean(filter) && places.length === 0 && !selectedPlace;
  const oneCard = !expanded && (showingPreview || emptyPreview);
  const visiblePlaces = expanded ? places : selectedPlace ? [selectedPlace] : places.slice(0, 1);

  /* 카드 한 장이 새로 열릴 때마다 애니메이션을 껐다가 다시 켜서 아래서 위로 올라오게 합니다. */
  useLayoutEffect(() => {
    setPlayRise(false);
  }, [oneCard, riseKey]);

  useLayoutEffect(() => {
    if (!oneCard || playRise || dropping) return;
    setPlayRise(true);
  }, [oneCard, riseKey, playRise, dropping]);

  /* 핀을 누르면 그 시설 카드 한 장만 올립니다. 지도 클릭이 바로 따라와도 카드가 닫히지 않게 합니다. */
  function selectShelter(shelterId) {
    markerPickRef.current = true;
    window.setTimeout(() => {
      markerPickRef.current = false;
    }, SHEET_MS);
    const sameCard = !expanded && String(selectedShelterId) === String(shelterId);
    const openCard = () => {
      setSelectedShelterId(shelterId);
      setExpanded(false);
      setRiseKey((value) => value + 1);
    };

    if (sameCard) {
      setRiseKey((value) => value + 1);
      return;
    }

    if (expanded || filter || selectedShelterId != null) {
      runAfterDrop(openCard);
      return;
    }

    openCard();
  }

  /* 올라온 시트의 바깥 배경을 누르면 시트가 아래로 내려가고 선택된 필터와 핀 카드도 해제됩니다. */
  function closeFromBackground() {
    if (markerPickRef.current) return;
    if (!dropping && !expanded && !filter && selectedShelterId == null) return;
    runAfterDrop(() => {
      setExpanded(false);
      setFilter(null);
      setSelectedShelterId(null);
    });
  }

  closeRef.current = closeFromBackground;
  selectRef.current = selectShelter;

  return (
    <Screen>
      {/* 카카오 지도. 불러오지 못하면 뒤의 빈 배경이 그대로 보입니다. */}
      <MapArea ref={mapElementRef} $ready={mapShown} aria-label="지도 영역" onClick={closeFromBackground} />

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

      {/* 필터나 핀 카드가 없을 때만 전체보기 버튼이 보입니다. */}
      {!expanded && !showingPreview && (
        <ViewAll type="button" onClick={() => setExpanded(true)}>
          <Icon src={viewAllIcon} alt="" />
          전체보기
        </ViewAll>
      )}

      {/* 필터를 고르면 카드 하나 높이만 올라오고, 시트를 올리면 목록 전체가 보입니다. */}
      <Sheet
        $expanded={expanded}
        $preview={showingPreview}
        $empty={emptyPreview}
        $rise={playRise}
        $drop={dropping}
      >
        <Handle
          aria-label={expanded ? "목록 접기" : "목록 펼치기"}
          onPointerDown={handleDragStart}
          onPointerUp={handleDragEnd}
        >
          <Grip />
        </Handle>
        <List $preview={showingPreview && !expanded}>
          {shelters === null ? null : visiblePlaces.length === 0 ? (
            <Empty>
              {filter === "즐겨찾기"
                ? "즐겨찾기한 활동이 없습니다."
                : "조건에 맞는 활동이 없습니다."}
            </Empty>
          ) : (
            visiblePlaces.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                favorite={Boolean(place.bookmarked)}
                onToggleFavorite={toggleFavorite}
                onOpenPost={() =>
                  navigate(
                    place.postingId
                      ? postPath({ id: place.postingId, category: place.category })
                      : `/shelters/${place.shelterId}`,
                  )
                }
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
            onToggleFavorite(place);
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
          {place.time && (
            <Meta>
              <Icon src={calendarIcon} alt="" />
              {place.time}
            </Meta>
          )}
        </>
      )}

      {/* 공고와 시설 응답에 있는 사진만 보여 줍니다. */}
      <Photos>
        {(place.photos ?? []).map((photo) => (
          <PhotoImage key={`${place.id}-${photo.src}`} src={photo.src} alt="" />
        ))}
      </Photos>
    </Card>
  );
}

const Screen = styled.div`
  position: relative;
  height: calc(100dvh - ${NAV_HEIGHT}px);
  overflow: hidden;
  background-color: #ffffff;
`;

const MapArea = styled.div`
  position: absolute;
  inset: 0;
  visibility: ${({ $ready }) => ($ready ? "visible" : "hidden")};
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
  position: ${({ $expanded }) => ($expanded ? "fixed" : "absolute")};
  right: 0;
  bottom: 0;
  left: ${({ $expanded }) => ($expanded ? "50%" : "0")};
  z-index: 20;
  display: flex;
  flex-direction: column;
  width: ${({ $expanded }) => ($expanded ? "min(100%, 390px)" : "100%")};
  height: ${({ $expanded, $preview, $empty }) =>
    $expanded ? "calc(100dvh - 40px)" : $preview ? "auto" : $empty ? "120px" : "36px"};
  overflow: hidden;
  border-radius: 20px 20px 0 0;
  background-color: #ffffff;
  transform: ${({ $expanded }) => ($expanded ? "translateX(-50%)" : "none")};
  ${({ $rise, $drop, $expanded }) => {
    if ($drop) {
      return css`
        animation: ${$expanded ? sheetDropCentered : sheetDrop} ${SHEET_MS}ms
          cubic-bezier(0.22, 1, 0.36, 1) forwards;
      `;
    }
    if ($rise) {
      return css`
        animation: ${sheetRise} ${SHEET_MS}ms cubic-bezier(0.22, 1, 0.36, 1);
      `;
    }
    return "";
  }}
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
  padding-bottom: ${({ $preview }) => ($preview ? "0" : "24px")};
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

const Icon = styled.img`
  display: block;
  flex-shrink: 0;
`;
