
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
import { getPostingDetail, getPostings } from "../../api/postings.js";
import { getShelterPostings, getShelters } from "../../api/shelters.js";
import { getBookmarkedPostings, getBookmarkedShelters, setSavedFavorite } from "../../api/activities.js";
import { loadKakaoMap } from "../../lib/kakaoMap.js";

const SEOUL = { lat: 37.5665, lng: 126.978 };

const POSTING_CATEGORY = {
  VOLUNTEER: "봉사",
  SPONSOR: "후원",
  DONATION: "후원",
  FOSTER: "임시보호",
};

const PIN_TYPE_QUERY = {
  봉사: "VOLUNTEER",
  후원: "SPONSOR",
  임시보호: "FOSTER",
};

/* 지도에 올라간 마커를 지우고, 넘긴 시설 좌표만 다시 찍습니다. move가 아니면 보고 있는 위치는 그대로 둡니다. */
function drawMarkers(map, kakao, markersRef, selectRef, points, { move = true } = {}) {
  markersRef.current.forEach((marker) => marker.setMap(null));

  if (!points.length) {
    markersRef.current = [];
    if (move) {
      map.setCenter(new kakao.maps.LatLng(SEOUL.lat, SEOUL.lng));
      map.setLevel(8);
    }
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

    if (move) {
      if (points.length === 1) {
        map.setCenter(new kakao.maps.LatLng(points[0].lat, points[0].lng));
        map.setLevel(5);
      } else {
        map.setBounds(bounds);
      }
    }
  }

  if (!move) return;
  map.relayout();
  requestAnimationFrame(() => map.relayout());
}

/* 모집공고 검색 한 건을 지도 카드 모양으로 바꿉니다. */
function postingToPlace(item) {
  const shelter = item.shelter ?? {};
  return {
    id: item.postingId,
    shelterId: shelter.shelterId,
    title: item.title ?? "",
    postingId: item.postingId,
    category: POSTING_CATEGORY[item.postingType] ?? item.postingType ?? "",
    shelter: shelter.name ?? "",
    address: [shelter.region?.sido, shelter.region?.sigungu].filter(Boolean).join(" "),
    time: formatStart(item.activityStartAt),
    bookmarked: Boolean(item.bookmarked),
    photos: cardPhotos(shelter, item),
  };
}

/* 공고 검색 결과에서 시설마다 핀 하나씩만 남깁니다. */
function pointsFromPostings(items) {
  const seen = new Set();
  const points = [];
  items.forEach((item) => {
    const shelter = item.shelter ?? {};
    const shelterId = shelter.shelterId;
    const lat = Number(shelter.latitude);
    const lng = Number(shelter.longitude);
    if (shelterId == null || seen.has(String(shelterId))) return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    seen.add(String(shelterId));
    points.push({ shelterId, lat, lng });
  });
  return points;
}

/* 공고 사진이 있으면 그걸 쓰고, 없으면 시설 썸네일을 씁니다. */
function cardPhotos(shelter, posting) {
  const urls = [
    ...(Array.isArray(posting?.imageUrls) ? posting.imageUrls : []),
    posting?.thumbnailUrl,
    shelter?.thumbnailUrl,
  ].filter(Boolean);
  return [...new Set(urls)].map((src) => ({ src }));
}

function formatStart(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const week = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getMonth() + 1}/${date.getDate()}(${week}) ${hours}:${minutes}`;
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
  const [savedShelters, setSavedShelters] = useState([]);
  const [bookmarkedPostings, setBookmarkedPostings] = useState([]);
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);
  const [postingsByShelter, setPostingsByShelter] = useState(null);
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
  const locationOverlayRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapShown, setMapShown] = useState(false);
  const [filterPostings, setFilterPostings] = useState(null);

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

  /* 전체이거나 필터가 없으면 시설 좌표로 핀을 찍습니다. 위치가 정해진 뒤에만 지도를 보여 줍니다. */
  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.kakao?.maps || !sheltersLoaded) return undefined;
    if (filter && filter !== "전체") return undefined;
    const kakao = window.kakao;
    const map = mapRef.current;
    const points = markerKey
      .split("|")
      .filter(Boolean)
      .map((token) => {
        const [shelterId, coords] = token.split(":");
        const [lat, lng] = (coords ?? "").split(",").map(Number);
        return { shelterId, lat, lng };
      })
      .filter((point) => point.shelterId && Number.isFinite(point.lat) && Number.isFinite(point.lng));

    drawMarkers(map, kakao, markersRef, selectRef, points);
    setMapShown(true);
    return undefined;
  }, [mapReady, markerKey, sheltersLoaded, filter]);

  /* 봉사, 후원, 임시보호는 종류로, 저장은 bookmarked로 모집공고 검색 결과를 거릅니다. */
  useEffect(() => {
    const postingType = PIN_TYPE_QUERY[filter];
    const savedOnly = filter === "즐겨찾기";
    if (!postingType && !savedOnly) {
      setFilterPostings(null);
      return undefined;
    }
    let ignore = false;
    setFilterPostings(null);

    (async () => {
      const items = [];
      let page = 0;
      let hasNext = true;
      try {
        while (hasNext && page < 20) {
          const result = await getPostings({
            postingType,
            page,
            size: 50,
          });
          if (ignore || !result?.isSuccess) break;
          items.push(...(result.data?.items ?? []));
          hasNext = Boolean(result.data?.hasNext);
          page += 1;
        }
        if (!ignore) {
          setFilterPostings(savedOnly ? items.filter((item) => item.bookmarked) : items);
        }
      } catch {
        if (!ignore) setFilterPostings([]);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [filter]);

  /* 필터 핀은 검색 결과의 시설 좌표만 다시 찍고, 지도가 보고 있는 위치는 그대로 둡니다. */
  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.kakao?.maps) return undefined;
    if (!filter || filter === "전체" || filterPostings == null) return undefined;

    drawMarkers(
      mapRef.current,
      window.kakao,
      markersRef,
      selectRef,
      pointsFromPostings(filterPostings),
      { move: false },
    );
    setMapShown(true);
    return undefined;
  }, [mapReady, filter, filterPostings]);

  /* 보호시설 목록을 가져옵니다. 응답 전에는 카드를 보여 주지 않습니다. */
  useEffect(() => {
    let ignore = false;

    getShelters()
      .then(async (result) => {
        if (ignore) return;
        if (!result?.isSuccess) {
          setShelters([]);
          return;
        }
        const firstItems = result.data?.items ?? [];
        setShelters(firstItems);
        if (!result.data?.hasNext) return;
        const size = result.data?.size || firstItems.length || 20;
        const rest = [];
        let page = (result.data?.page ?? 0) + 1;
        let hasNext = true;
        while (hasNext && page < 20) {
          const next = await getShelters({ page, size });
          if (ignore || !next?.isSuccess) break;
          rest.push(...(next.data?.items ?? []));
          hasNext = Boolean(next.data?.hasNext);
          page += 1;
        }
        if (!ignore && rest.length) setShelters([...firstItems, ...rest]);
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
      setSavedShelters(shelters);
      setBookmarkedPostings(postings);
      setBookmarksLoaded(true);
    });

    return () => {
      ignore = true;
    };
  }, []);

  const shelterIdsKey = (shelters ?? []).map((item) => item.shelterId).join("|");

  /* 시설의 모집공고를 모두 가져옵니다. 카드는 시설이 오면 먼저 보여 주고, 공고는 이어서 채웁니다. */
  useEffect(() => {
    if (shelters === null) return undefined;
    const ids = shelterIdsKey.split("|").filter(Boolean);
    if (!ids.length) {
      setPostingsByShelter({});
      return undefined;
    }
    let ignore = false;

    Promise.all(
      ids.map(async (shelterId) => {
        try {
          const result = await getShelterPostings(shelterId, { page: 0, size: 50 });
          return [shelterId, result?.isSuccess ? result.data?.items ?? [] : []];
        } catch {
          return [shelterId, []];
        }
      }),
    ).then((pairs) => {
      if (ignore) return;
      setPostingsByShelter(Object.fromEntries(pairs));
      pairs.forEach(([shelterId, items]) => {
        items.forEach((posting) => {
          if (!posting?.postingId) return;
          getPostingDetail(posting.postingId)
            .then((detail) => {
              if (ignore || !detail?.isSuccess) return;
              const imageUrls = Array.isArray(detail.data?.imageUrls)
                ? detail.data.imageUrls.filter(Boolean)
                : [];
              setPostingsByShelter((current) => {
                const list = current?.[shelterId];
                if (!list) return current;
                return {
                  ...current,
                  [shelterId]: list.map((item) => (
                    String(item.postingId) === String(posting.postingId) ? { ...item, imageUrls } : item
                  )),
                };
              });
            })
            .catch(() => {});
        });
      });
    });

    return () => {
      ignore = true;
    };
  }, [shelters, shelterIdsKey]);

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

  /* 지도 카드의 발바닥은 그 공고만 저장합니다. 시설 카드는 시설만 해제합니다. */
  async function toggleShelterBookmark(place) {
    const saved = Boolean(place.bookmarked);
    const postingId = place.postingId;

    try {
      if (postingId != null) {
        await setSavedFavorite({ postingIds: [postingId], saved });
        setBookmarkedPostings((current) => {
          const rest = current.filter((item) => String(item.postingId) !== String(postingId));
          if (saved) return rest;
          return [{
            postingId,
            shelterId: place.shelterId,
            title: place.title,
            shelterName: place.shelter,
            postingType: Object.entries(POSTING_CATEGORY).find(([, label]) => label === place.category)?.[0],
            thumbnailUrl: place.photos?.[0]?.src,
          }, ...rest];
        });
        return;
      }

      if (!saved) return;
      await setSavedFavorite({ shelterId: place.shelterId, saved: true });
      setSavedShelters((current) => current.filter((item) => String(item.shelterId) !== String(place.shelterId)));
    } catch {
      /* 저장에 실패하면 목록은 그대로 둡니다. */
    }
  }

  const bookmarkedShelterIds = savedShelters.map((item) => item.shelterId);

  function isShelterSaved(shelterId) {
    return bookmarkedShelterIds.some((id) => String(id) === String(shelterId));
  }

  function isPostingSaved(postingId) {
    return bookmarkedPostings.some((item) => String(item.postingId) === String(postingId));
  }

  function isBookmarkedShelter(shelterId) {
    return isShelterSaved(shelterId) || bookmarkedPostings.some((item) => String(item.shelterId) === String(shelterId));
  }

  const shelterPlaces = (shelters ?? []).flatMap((item) => {
    const postings = postingsByShelter === null ? null : postingsByShelter[item.shelterId] ?? [];
    if (!postings?.length) {
      return [{
        id: `shelter-${item.shelterId}`,
        shelterId: item.shelterId,
        title: "",
        shelter: item.name,
        address: item.address,
        bookmarked: isBookmarkedShelter(item.shelterId),
        photos: cardPhotos(item, null),
      }];
    }
    return postings.map((posting) => ({
      id: posting.postingId,
      shelterId: item.shelterId,
      title: posting.title ?? "",
      postingId: posting.postingId,
      category: POSTING_CATEGORY[posting.postingType],
      shelter: item.name,
      address: item.address,
      time: formatStart(posting.activityStartAt),
      /* 시설을 저장해도 같은 시설의 다른 공고는 즐겨찾기에 넣지 않습니다. */
      bookmarked: isPostingSaved(posting.postingId),
      photos: cardPhotos(item, posting),
    }));
  });

  /* 즐겨찾기는 저장한 시설과 저장한 공고를 함께 보여 줍니다. 시설을 저장해도 그 공고를 전부 올리지는 않습니다. */
  const favoritePlaces = [
    ...savedShelters.map((item) => {
      const shelter = (shelters ?? []).find((place) => String(place.shelterId) === String(item.shelterId));
      const region = [item.region?.sido, item.region?.sigungu].filter(Boolean).join(" ");
      const name = item.name ?? shelter?.name ?? "";
      return {
        id: `shelter-${item.shelterId}`,
        shelterId: item.shelterId,
        title: name,
        shelter: "",
        address: shelter?.address ?? item.address ?? region,
        bookmarked: true,
        photos: cardPhotos(shelter ?? item, null),
      };
    }),
    ...bookmarkedPostings.map((item) => {
      const shelter = (shelters ?? []).find((place) => String(place.shelterId) === String(item.shelterId));
      const posting = postingsByShelter?.[item.shelterId]?.find(
        (place) => String(place.postingId) === String(item.postingId),
      );
      return {
        id: item.postingId,
        shelterId: item.shelterId,
        title: item.title ?? posting?.title ?? "",
        postingId: item.postingId,
        category: POSTING_CATEGORY[item.postingType] ?? POSTING_CATEGORY[posting?.postingType],
        shelter: item.shelterName ?? shelter?.name ?? "",
        address: shelter?.address ?? [item.region?.sido, item.region?.sigungu].filter(Boolean).join(" "),
        time: formatStart(item.activityStartAt ?? posting?.activityStartAt),
        bookmarked: true,
        photos: cardPhotos(shelter, posting ?? item),
      };
    }),
  ];

  const places = filter === "즐겨찾기"
    ? favoritePlaces
    : shelterPlaces.filter((place) => {
      if (!filter || filter === "전체") return true;
      return place.category === filter;
    });

  /* 브라우저 위치 권한으로 현재 좌표를 받아 지도 가운데로 옮깁니다. */
  function moveToCurrentLocation() {
    const map = mapRef.current;
    if (!map || !window.kakao?.maps || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const kakao = window.kakao;
        const here = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
        map.relayout();
        map.setLevel(4);
        map.setCenter(here);
        locationOverlayRef.current?.setMap(null);
        const dot = document.createElement("div");
        dot.style.width = "14px";
        dot.style.height = "14px";
        dot.style.borderRadius = "50%";
        dot.style.backgroundColor = "#2f80ed";
        dot.style.border = "2px solid #ffffff";
        dot.style.boxShadow = "0 0 0 6px rgba(47, 128, 237, 0.25)";
        const overlay = new kakao.maps.CustomOverlay({
          position: here,
          content: dot,
          xAnchor: 0.5,
          yAnchor: 0.5,
          zIndex: 4,
        });
        overlay.setMap(map);
        locationOverlayRef.current = overlay;
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

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

  const filterNarrows = Boolean(filter) && filter !== "전체";
  const waitingForPinCards = selectedShelterId != null && filterNarrows && filterPostings == null;
  /* 필터를 고른 뒤 핀을 누르면, 그 시설이면서 그 필터인 공고만 카드로 씁니다. */
  const pinCards = selectedShelterId != null && filterNarrows && filterPostings
    ? filterPostings
      .filter((item) => String(item.shelter?.shelterId) === String(selectedShelterId))
      .map(postingToPlace)
    : null;
  const selectedPlace = waitingForPinCards || selectedShelterId == null
    ? null
    : pinCards?.[0]
      ?? shelterPlaces.find((place) => String(place.shelterId) === String(selectedShelterId))
      ?? null;
  const showingPreview = (pinCards?.length > 0)
    || Boolean(selectedPlace)
    || (Boolean(filter) && places.length > 0);
  const emptyPreview = filterNarrows && selectedShelterId != null
    ? filterPostings != null && (pinCards?.length ?? 0) === 0
    : Boolean(filter) && places.length === 0 && !selectedPlace;
  const oneCard = !expanded && (showingPreview || emptyPreview);
  const visiblePlaces = waitingForPinCards
    ? []
    : pinCards != null
    ? pinCards
    : expanded
      ? places
      : selectedPlace
        ? [selectedPlace]
        : places.slice(0, 1);

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
              {name === "즐겨찾기" ? "저장" : name}
            </FilterChip>
          ))}
        </Filters>
      </Top>

      {/* 필터나 핀 카드가 없을 때만 전체보기와 현재 위치 버튼이 보입니다. */}
      {!expanded && !showingPreview && (
        <MapActions>
          <ViewAll type="button" onClick={() => setExpanded(true)}>
            <Icon src={viewAllIcon} alt="" />
            전체보기
          </ViewAll>
          <LocateButton type="button" aria-label="현재 위치로 찾기" onClick={moveToCurrentLocation}>
            <LocateMark />
          </LocateButton>
        </MapActions>
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
          {shelters === null || waitingForPinCards || (filter === "즐겨찾기" && !bookmarksLoaded) ? null : visiblePlaces.length === 0 ? (
            <Empty>
              {filter === "즐겨찾기"
                ? "저장한 활동이 없습니다."
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
            {place.shelter ? (
              <ShelterButton
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenShelter();
                }}
              >
                {place.shelter} &gt;
              </ShelterButton>
            ) : null}
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
            {place.shelter ? place.address : <PlaceLink>{place.address} &gt;</PlaceLink>}
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

const MapActions = styled.div`
  position: absolute;
  bottom: 52px;
  left: 50%;
  z-index: 2;
  transform: translateX(-50%);
`;

const ViewAll = styled.button`
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
  cursor: pointer;
`;

/* 전체보기 바로 오른쪽의 흰 원입니다. */
const LocateButton = styled.button`
  position: absolute;
  top: 0;
  left: calc(100% + 8px);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background-color: #ffffff;
  cursor: pointer;
`;

const LocateMark = styled.span`
  width: 16px;
  height: 16px;
  border: 2px solid #382f2f;
  border-radius: 50%;
  position: relative;

  &::before,
  &::after {
    content: "";
    position: absolute;
    background-color: #382f2f;
  }

  &::before {
    top: 50%;
    left: -4px;
    width: 20px;
    height: 2px;
    transform: translateY(-50%);
  }

  &::after {
    left: 50%;
    top: -4px;
    width: 2px;
    height: 20px;
    transform: translateX(-50%);
  }
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
  text-decoration: underline;
  text-decoration-thickness: from-font;
  text-underline-position: from-font;
  cursor: pointer;
`;

const PlaceLink = styled.span`
  text-decoration: underline;
  text-decoration-thickness: from-font;
  text-underline-position: from-font;
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
