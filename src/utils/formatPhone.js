/* 숫자만 남기고 하이픈 넣어 줌. "01012345678" → "010-1234-5678" */
export function formatPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

/* 백엔드 phone 형식과 같은 규칙: 01X-XXX(X)-XXXX */
export function isValidPhone(value) {
  return /^01[0-9]-?\d{3,4}-?\d{4}$/.test(value);
}