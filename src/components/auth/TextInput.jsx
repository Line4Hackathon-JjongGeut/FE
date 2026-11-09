import styled from "styled-components";

/* 회원가입·로그인에서 쓰는 기본 입력창 */
export default function TextInput({ type = "text", value, onChange, placeholder }) {
  return <Input type={type} value={value} onChange={onChange} placeholder={placeholder} />;
}

const Input = styled.input`
  flex: 1;
  min-width: 0;
  height: 43px;
  padding: 0 14px;
  border: 1.5px solid #d9d9d9;
  border-radius: 10px;
  background: transparent;
  color: #111111;
  font-size: 15px;

  &:focus {
    border-color: #e88b7a;
    outline: none;
  }
`;