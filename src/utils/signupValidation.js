/* 회원가입 입력 규칙 */
export const SIGNUP_RULES = {
  name: {
    pattern: /^[가-힣a-zA-Z]{2,20}$/,
    message: "한글 또는 영문 2~20자로 입력해 주세요.",
  },
  nickname: {
    pattern: /^[가-힣a-zA-Z0-9]{2,10}$/,
    message: "한글, 영문, 숫자 2~10자로 입력해 주세요.",
  },
  userId: {
    pattern: /^[a-z0-9]{4,20}$/,
    message: "영문 소문자와 숫자 4~20자로 입력해 주세요.",
  },
  password: {
    // 영문과 숫자가 하나 이상씩 있고, 공백 없이 8~20자
    pattern: /^(?=.*[A-Za-z])(?=.*\d)\S{8,20}$/,
    message: "영문과 숫자를 섞어 8~20자로 입력해 주세요.",
  },
};

export function isValidField(key, value) {
  return SIGNUP_RULES[key].pattern.test(value);
}