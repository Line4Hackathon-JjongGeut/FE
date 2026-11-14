import styled from "styled-components";

/* 온보딩 상단 진행바. */
export default function ProgressBar({ current, total }) {
  return (
    <Track role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current}>
      <Indicator $current={current} $total={total} />
    </Track>
  );
}

const Track = styled.div`
  position: relative;
  height: 7px;
  border-radius: 5.5px;
  background-color: #f3ede3;
  overflow: hidden;
`;

const Indicator = styled.div`
  position: absolute;
  top: 0;
  left: ${({ $current, $total }) => ((($current - 1) / $total) * 100).toFixed(2)}%;
  width: ${({ $total }) => (100 / $total).toFixed(2)}%;
  height: 100%;
  border-radius: 5.5px;
  background-color: #e28777;
  transition: left 0.3s ease;
`;