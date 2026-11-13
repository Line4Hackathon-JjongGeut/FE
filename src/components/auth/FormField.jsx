import styled from "styled-components";

const HINT_COLORS = {
  default: "#7a7a7a",
  success: "#4f7a5f",
  error: "#d9534f",
};

/* 라벨 + 입력 줄 + 안내 문구 묶음  */
export default function FormField({ label, required = false, hint, hintTone = "default", children }) {
  return (
    <Field>
      <Label>
        {label}
        {required && <Required>*</Required>}
      </Label>
      <Row>{children}</Row>
      {hint && <Hint $tone={hintTone}>{hint}</Hint>}
    </Field>
  );
}

const Field = styled.label`
  display: flex;
  flex-direction: column;
`;

const Label = styled.span`
  color: #4f7a5f;
  font-size: 15px;
  font-weight: 600;
`;

const Required = styled.span`
  color: #e28777;
`;

const Row = styled.div`
  display: flex;
  gap: 7px;
  margin-top: 10px;
`;

const Hint = styled.p`
  margin-top: 7px;
  color: ${({ $tone }) => HINT_COLORS[$tone]};
  font-size: 11px;
  font-weight: 600;
`;