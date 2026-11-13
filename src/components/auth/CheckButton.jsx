import styled from "styled-components";

/* 입력창 옆 "중복 확인" 버튼git add . */
export default function CheckButton({ children = "중복 확인", onClick, disabled = false }) {
  return (
    <Button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  );
}

const Button = styled.button`
  flex-shrink: 0;
  width: 87px;
  height: 43px;
  border: 1.5px solid #e88b7a;
  border-radius: 10px;
  background-color: #fbe3dc;
  color: #a9563f;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;