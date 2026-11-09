import styled from "styled-components";

/* 흰 바탕에 테두리만 있는 보조 버튼. "지금은 안 할래요" */
export default function SecondaryButton({ children, onClick, type = "button" }) {
  return (
    <Button type={type} onClick={onClick}>
      {children}
    </Button>
  );
}

const Button = styled.button`
  width: 100%;
  height: 44px;
  border: 1px solid #878787;
  border-radius: 10px;
  background-color: #ffffff;
  color: #382f2f;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;