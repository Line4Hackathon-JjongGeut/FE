import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/auth/BackHeader.jsx";
import FormField from "../../components/auth/FormField.jsx";
import TextInput from "../../components/auth/TextInput.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import { login } from "../../api/auth.js";
import { saveTokens } from "../../utils/tokenStorage.js";

/* 실패 이유에 따라 보여 줄 문구 */
function getLoginErrorMessage(error) {
  // 서버까지 가지도 못한 경우 (인터넷 끊김, 서버 꺼짐)
  if (error.status === undefined) return "서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.";
  // 서버 안에서 난 오류
  if (error.status >= 500) return "일시적인 오류가 생겼어요. 잠시 후 다시 시도해 주세요.";
  // 그 밖(아이디 없음, 비밀번호 틀림 등)은 보안상 어느 쪽이 틀렸는지 구분하지 않음
  return "아이디 또는 비밀번호를 확인해 주세요.";
}

/* 로그인 화면. 아이디와 비밀번호를 모두 입력해야 버튼 눌림 */
export default function Login() {
  const navigate = useNavigate();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = loginId.trim() !== "" && password !== "" && !isLoading;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await login({ loginId: loginId.trim(), password });
      saveTokens(response.data);
      // 로그인 뒤 뒤로가기를 눌러도 로그인 화면이 다시 나오지 않도록 replace
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(getLoginErrorMessage(error));
      setIsLoading(false);
    }
  }

  /* 다시 입력하기 시작하면 실패 문구를 지움 */
  function handleLoginIdChange(event) {
    setLoginId(event.target.value);
    setErrorMessage("");
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    setErrorMessage("");
  }

  return (
    <Screen>
      <BackHeader title="로그인" onBack={() => navigate(-1)} />

      <Form onSubmit={handleSubmit}>
        <Fields>
          <FormField label="아이디" required>
            <TextInput value={loginId} onChange={handleLoginIdChange} autoComplete="username" />
          </FormField>
          <FormField label="비밀번호" required hint={errorMessage} hintTone="error">
            <TextInput
              type="password"
              value={password}
              onChange={handlePasswordChange}
              autoComplete="current-password"
            />
          </FormField>
        </Fields>

        <Actions>
          <PrimaryButton type="submit" disabled={!canSubmit}>
            {isLoading ? "로그인 중..." : "로그인"}
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