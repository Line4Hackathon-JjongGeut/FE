import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/auth/BackHeader.jsx";
import FormField from "../../components/auth/FormField.jsx";
import TextInput from "../../components/auth/TextInput.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";

/* 로그인 화면. 아이디와 비밀번호를 모두 입력해야 버튼 눌림 */
export default function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = userId.trim() !== "" && password !== "";

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    // TODO: 로그인 API가 생기면 여기서 요청 보내기. 지금은 홈으로 이동
    navigate("/");
  }

  return (
    <Screen>
      <BackHeader title="로그인" onBack={() => navigate(-1)} />

      <Form onSubmit={handleSubmit}>
        <Fields>
          <FormField label="아이디" required>
            <TextInput value={userId} onChange={(event) => setUserId(event.target.value)} />
          </FormField>
          <FormField label="비밀번호" required>
            <TextInput
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </FormField>
        </Fields>

        <Actions>
          <PrimaryButton type="submit" disabled={!canSubmit}>
            로그인
          </PrimaryButton>
        </Actions>
      </Form>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #ffffff;
`;

const Form = styled.form`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Fields = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 26px;
  padding: 25px 24px 0;
`;

/* 다른 화면과 버튼 높이를 맞추려고 아래 여백 둠 */
const Actions = styled.div`
  padding: 40px 24px 74px;
`;