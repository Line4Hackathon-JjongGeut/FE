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
import { SIGNUP_RULES, isValidField } from "../../utils/signupValidation.js";

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

  function isInvalid(key) {
    return form[key] !== "" && !isValidField(key, form[key]);
  }

  /* 칸 아래 안내 문구: 규칙 위반 → 중복 확인 결과 순서로 보여 줌 */
  function getFieldHint(key) {
    if (isInvalid(key)) return { hint: SIGNUP_RULES[key].message, hintTone: "error" };

    const status = checks[key];
    if (!status || status === "idle") return { hint: undefined, hintTone: "default" };
    return {
      hint: CHECK_MESSAGES[key][status],
      hintTone: status === "available" ? "success" : "error",
    };
  }

  const canSubmit =
    isValidField("name", form.name) &&
    isValidField("nickname", form.nickname) &&
    isValidField("userId", form.userId) &&
    isValidField("password", form.password) &&
    checks.nickname === "available" &&
    checks.userId === "available";

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
            <FormField label="이름" required {...getFieldHint("name")}>
              <TextInput
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                autoComplete="name"
              />
            </FormField>

            <FormField label="닉네임" required {...getFieldHint("nickname")}>
              <TextInput
                value={form.nickname}
                onChange={(event) => updateField("nickname", event.target.value)}
                autoComplete="nickname"
              />
              {/* 규칙에 맞게 입력해야 중복 확인을 할 수 있음 */}
              <CheckButton
                disabled={!isValidField("nickname", form.nickname)}
                onClick={() => checkDuplicate("nickname")}
              />
            </FormField>

            <FormField label="아이디" required {...getFieldHint("userId")}>
              <TextInput
                value={form.userId}
                // 아이디는 소문자만 쓸 수 있어서, 대문자로 쳐도 소문자로 바꿔 줌
                onChange={(event) => updateField("userId", event.target.value.toLowerCase())}
                autoComplete="username"
              />
              <CheckButton
                disabled={!isValidField("userId", form.userId)}
                onClick={() => checkDuplicate("userId")}
              />
            </FormField>

            <FormField
              label="비밀번호"
              required
              hint={SIGNUP_RULES.password.message}
              hintTone={isInvalid("password") ? "error" : "default"}
            >
              <TextInput
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                autoComplete="new-password"
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