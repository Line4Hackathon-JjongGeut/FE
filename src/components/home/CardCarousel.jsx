import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import PageDots from "../auth/PageDots.jsx";

const AUTO_SLIDE_DELAY = 3000;

/* 홈 카드 묶음을 옆으로 넘기는 칸  */
export default function CardCarousel({
  pages,
  renderCard,
  onPageChange,
  gap = 12,
}) {
  const trackRef = useRef(null);
  const [page, setPage] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const total = pages.length;
  // 페이지가 2개 이상이면 맨 뒤에 첫 페이지 복사본을 붙임
  const slides = total > 1 ? [...pages, pages[0]] : pages;

  useEffect(() => {
    if (total <= 1 || isHolding) return undefined;
    // 마지막 페이지(total - 1) 다음은 복사본(total)으로 → 방향이 그대로 유지됨
    const timer = setTimeout(() => goToPage(page + 1), AUTO_SLIDE_DELAY);
    return () => clearTimeout(timer);
  }, [page, total, isHolding]);

  function goToPage(index) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }

  function handleScroll() {
    const track = trackRef.current;
    const width = track.clientWidth;

    // 복사본까지 완전히 넘어왔으면, 똑같이 생긴 진짜 첫 페이지로 순간 이동 (애니메이션 없이)
    if (total > 1 && Math.abs(track.scrollLeft - total * width) < 1) {
      track.scrollTo({ left: 0, behavior: "instant" });
    }

    const next = Math.round(track.scrollLeft / width) % total;
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
        {slides.map((cards, index) => (
          // 복사본은 화면 읽기 프로그램이 같은 카드를 두 번 읽지 않게 숨김
          <Page
            key={index}
            $gap={gap}
            aria-hidden={index === total ? true : undefined}
          >
            {cards.map(renderCard)}
          </Page>
        ))}
      </Track>

      {/* 페이지가 2개 이상일 때만 점 표시 */}
      {total > 1 && (
        <DotsArea>
          <PageDots
            total={total}
            current={page}
            onSelect={goToPage}
            size={7}
            gap={8}
          />
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
