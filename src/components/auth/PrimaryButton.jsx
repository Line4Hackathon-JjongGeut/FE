import styled from "styled-components";

/* 화면 하단의 메인 버튼. 입력이 덜 끝났으면 disabled */
export default function PrimaryButton({ children, onClick, disabled = false, type = "button" }) {
  return (
    <Button type={type} onClick={onClick} disabled={disabled}>
      {children}
    </Button>
  );
}

const Button = styled.button`
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background-color: #e88b7a;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;