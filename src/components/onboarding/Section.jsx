import styled from "styled-components";

/* 온보딩 화면 안의 소제목 + 내용 묶음. "활동 가능 요일" 아래에 요일 버튼 */
export default function Section({ label, required = false, hint, children }) {
  return (
    <Wrapper>
      <Head>
        <Label>
          {label}
          {required && <Required>*</Required>}
        </Label>
        {hint && <Hint>{hint}</Hint>}
      </Head>
      {children}
    </Wrapper>
  );
}

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Head = styled.div`
  display: flex;
  gap: 8px;
  align-items: baseline;
`;

const Label = styled.h2`
  color: #4f7a5f;
  font-size: 17px;
  font-weight: 600;
`;

const Required = styled.span`
  color: #e28777;
`;

const Hint = styled.span`
  color: #939393;
  font-size: 12px;
  font-weight: 600;
`;