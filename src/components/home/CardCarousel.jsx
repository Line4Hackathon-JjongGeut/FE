import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import PageDots from "../auth/PageDots.jsx";

const AUTO_SLIDE_DELAY = 3000; 

/* 홈 카드 묶음을 옆으로 넘기는 칸  */
export default function CardCarousel({ pages, renderCard, onPageChange, gap = 12 }) {
  const trackRef = useRef(null);
  const [page, setPage] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    if (pages.length <= 1 || isHolding) return undefined;
    const timer = setTimeout(() => {
      const next = (page + 1) % pages.length;
      goToPage(next);
    }, AUTO_SLIDE_DELAY);
    return () => clearTimeout(timer);
  }, [page, pages.length, isHolding]);

  function goToPage(index) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }

  // 스크롤 위치로 지금 몇 번째 페이지인지 계산
  function handleScroll() {
    const track = trackRef.current;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next === page) return;
    setPage(next);
    onPageChange?.(next);
  }

  return (
    <>
      <Track
        ref={trackRef}
        onScroll={handleScroll}
        onTouchStart={() => setIsHolding(true)}
        onTouchEnd={() => setIsHolding(false)}
        onMouseEnter={() => setIsHolding(true)}
        onMouseLeave={() => setIsHolding(false)}
      >
        {pages.map((cards, index) => (
          <Page key={index} $gap={gap}>
            {cards.map(renderCard)}
          </Page>
        ))}
      </Track>

      {/* 페이지가 2개 이상일 때만 점 표시 */}
      {pages.length > 1 && (
        <DotsArea>
          <PageDots total={pages.length} current={page} onSelect={goToPage} size={7} gap={8} />
        </DotsArea>
      )}
    </>
  );
}

const Track = styled.div`
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Page = styled.div`
  display: flex;
  flex: 0 0 100%;
  min-width: 0; /* 긴 제목 때문에 페이지가 화면보다 넓어지지 않게 (그래야 제목이 "..."으로 잘림) */
  flex-direction: column;
  gap: ${({ $gap }) => $gap}px;
  scroll-snap-align: start;
`;

const DotsArea = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 9px;
`;