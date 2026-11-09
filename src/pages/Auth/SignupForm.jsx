import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import BackHeader from "../../components/auth/BackHeader.jsx";
import FormField from "../../components/auth/FormField.jsx";
import TextInput from "../../components/auth/TextInput.jsx";
import CheckButton from "../../components/auth/CheckButton.jsx";
import PrimaryButton from "../../components/auth/PrimaryButton.jsx";
import TextLink from "../../components/auth/TextLink.jsx";
import { isNicknameTaken, isUserIdTaken } from "../../dummyData/auth/authDummy.js";

const PASSWORD_MIN_LENGTH = 8;

/* 중복 확인 결과에 따라 보여 줄 문구 */
const CHECK_MESSAGES = {
  nickname: {
    available: "사용 가능한 닉네임이에요.",
    taken: "이미 사용 중인 닉네임이에요.",
  },
  userId: {
    available: "사용 가능한 아이디예요.",
    taken: "이미 사용 중인 아이디예요.",
  },
};

/* 일반 사용자 회원정보 입력 화면
   닉네임·아이디 중복 확인을 통과하고 비밀번호가 8자 이상이어야 가입 버튼이 눌립니다. */
export default function SignupForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", nickname: "", userId: "", password: "" });
  // 중복 확인 상태: "idle"(아직 안 함), "available"(사용 가능), "taken"(사용 중)
  const [checks, setChecks] = useState({ nickname: "idle", userId: "idle" });

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    // 확인을 받은 뒤 값을 바꾸면 다시 확인받아야 합니다.
    if (key in checks) {
      setChecks((current) => ({ ...current, [key]: "idle" }));
    }
  }

  function checkDuplicate(key) {
    // TODO: 중복 확인 API가 생기면 더미 함수 대신 요청 보내기
    const taken = key === "nickname" ? isNicknameTaken(form.nickname) : isUserIdTaken(form.userId);
    setChecks((current) => ({ ...current, [key]: taken ? "taken" : "available" }));
  }

  function getCheckHint(key) {
    const status = checks[key];
    if (status === "idle") return { hint: undefined, hintTone: "default" };
    return {
      hint: CHECK_MESSAGES[key][status],
      hintTone: status === "available" ? "success" : "error",
    };
  }

  const isPasswordShort = form.password.length > 0 && form.password.length < PASSWORD_MIN_LENGTH;

  const canSubmit =
    form.name.trim() !== "" &&
    checks.nickname === "available" &&
    checks.userId === "available" &&
    form.password.length >= PASSWORD_MIN_LENGTH;

  function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    // TODO: 회원가입 API 생기면 form과 사용자 유형을 함께 보냄.
    navigate("/signup/complete", { replace: true });
  }

  return (
    <Screen>
      <BackHeader title="회원가입" />

      <Form onSubmit={handleSubmit}>
        <Body>
          <Headline>회원정보를 입력해 주세요.</Headline>

          <Fields>
            <FormField label="이름" required>
              <TextInput value={form.name} onChange={(event) => updateField("name", event.target.value)} />
            </FormField>

            <FormField label="닉네임" required {...getCheckHint("nickname")}>
              <TextInput
                value={form.nickname}
                onChange={(event) => updateField("nickname", event.target.value)}
              />
              <CheckButton disabled={form.nickname.trim() === ""} onClick={() => checkDuplicate("nickname")} />
            </FormField>

            <FormField label="아이디" required {...getCheckHint("userId")}>
              <TextInput value={form.userId} onChange={(event) => updateField("userId", event.target.value)} />
              <CheckButton disabled={form.userId.trim() === ""} onClick={() => checkDuplicate("userId")} />
            </FormField>

            <FormField
              label="비밀번호"
              required
              hint="비밀번호는 8자 이상이어야 합니다."
              hintTone={isPasswordShort ? "error" : "default"}
            >
              <TextInput
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
              />
            </FormField>
          </Fields>
        </Body>

        <Actions>
          <PrimaryButton type="submit" disabled={!canSubmit}>
            회원가입
          </PrimaryButton>
          <BottomLink>
            <TextLink onClick={() => navigate("/intro")}>처음으로 돌아가기</TextLink>
          </BottomLink>
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

const Body = styled.div`
  flex: 1;
  padding: 48px 24px 0;
`;

const Headline = styled.h2`
  color: #000000;
  font-size: 30px;
  font-weight: 600;
`;

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 26px;
  margin-top: 27px;
`;

const Actions = styled.div`
  padding: 40px 24px 36px;
`;

const BottomLink = styled.div`
  margin-top: 18px;
`;