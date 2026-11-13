import styled from "styled-components";

/* "처음으로 돌아가기" 밑줄이 있는 글자 버튼 */
export default function TextLink({ children, onClick }) {
  return (
    <Link type="button" onClick={onClick}>
      {children}
    </Link>
  );
}

const Link = styled.button`
  display: block;
  margin: 0 auto;
  border: 0;
  background: transparent;
  color: #403a38;
  font-size: 14px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
`;