import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import backIcon from "../../../assets/icons/fosters/back.svg";
import { postFosterInquiry } from "../../../api/postings.js";
import { findFosterPost } from "../../../dummyData/shelters/fosters/fosterDummy.js";
import { addApplication } from "../../../dummyData/volunteer/applications.js";

const HOMES = ["아파트", "단독주택", "빌라", "기타"];

/* 임시보호 상세의 지원하기를 누르면 열리는 참여 문의입니다. */
export default function FosterApply() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const post = findFosterPost(postId);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [period, setPeriod] = useState("");
  const [home, setHome] = useState("빌라");
  const [homeNote, setHomeNote] = useState("");
  const [experience, setExperience] = useState("없어요");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  /* 지원 완료하기. 연락처와 전할 말을 시설에 보내고, 성공하면 완료 화면으로 이동합니다. */
  async function finish() {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      await postFosterInquiry(post.id, {
        message,
        contactPhone: phone.trim(),
      });
      addApplication({
        title: post.title,
        shelter: post.shelterName,
        schedule: period.trim() || "기간 미입력",
        place: home === "기타" ? homeNote.trim() || "기타" : home,
        applicant: name.trim() || "이름 미입력",
      });
      navigate(`/fosters/${post.id}/complete`);
    } catch (error) {
      setSubmitError(error.message || "참여 의사를 전달하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Header>
        {/* 아래를 가리키는 꺾쇠를 돌려, 뒤로 가기로 씁니다. */}
        <BackButton type="button" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
          <BackIcon src={backIcon} alt="" />
        </BackButton>
        <HeaderTitle>임시보호 신청</HeaderTitle>
      </Header>

      <PostTitle>{post.title}</PostTitle>
      <ShelterLink type="button" onClick={() => navigate(`/shelters/${post.shelterId}`)}>
        <ShelterName>{post.shelterName}</ShelterName>
        <Chevron> &gt;</Chevron>
      </ShelterLink>

      <Form>
        <Field>
          <Label>
            이름<Required>*</Required>
          </Label>
          {/* 모서리를 둥글린 가로로 긴 입력 사각형입니다. */}
          <Input
            value={name}
            placeholder="이름을 입력해 주세요."
            onChange={(event) => setName(event.target.value)}
          />
        </Field>

        <Field>
          <Label>
            연락처<Required>*</Required>
          </Label>
          <Input
            value={phone}
            inputMode="tel"
            placeholder="010-0000-0000"
            onChange={(event) => setPhone(event.target.value)}
          />
        </Field>

        <Field>
          <Label>
            임시보호 가능 기간<Required>*</Required>
          </Label>
          <Input
            value={period}
            placeholder="기간을 선택해 주세요."
            onChange={(event) => setPeriod(event.target.value)}
          />
        </Field>

        <Field>
          <Label>
            거주 환경<Required>*</Required>
          </Label>
          {/* 동그란 선택 점을 두 줄 두 칸으로 둡니다. */}
          <ChoiceGrid role="radiogroup" aria-label="거주 환경">
            {HOMES.map((item) => (
              <Choice
                key={item}
                type="button"
                role="radio"
                aria-checked={home === item}
                onClick={() => setHome(item)}
              >
                <Radio $selected={home === item}>{home === item && <RadioDot />}</Radio>
                {item === "기타" ? (
                  <OtherLabel>
                    기타:
                    <OtherInput
                      value={homeNote}
                      aria-label="기타 거주 환경"
                      onFocus={() => setHome("기타")}
                      onChange={(event) => {
                        setHome("기타");
                        setHomeNote(event.target.value);
                      }}
                    />
                  </OtherLabel>
                ) : (
                  item
                )}
              </Choice>
            ))}
          </ChoiceGrid>
        </Field>

        <Field>
          <Label>
            반려동물 양육 경험<Required>*</Required>
          </Label>
          <ChoiceColumn role="radiogroup" aria-label="반려동물 양육 경험">
            {["있어요", "없어요"].map((item) => (
              <Choice
                key={item}
                type="button"
                role="radio"
                aria-checked={experience === item}
                onClick={() => setExperience(item)}
              >
                <Radio $selected={experience === item}>{experience === item && <RadioDot />}</Radio>
                {item}
              </Choice>
            ))}
          </ChoiceColumn>
        </Field>

        <Field>
          <Label>전달하고 싶은 말</Label>
          {/* 입력 칸보다 세로로 긴 둥근 사각형입니다. */}
          <TextArea
            value={message}
            placeholder="하고 싶은 말이 있다면 자유롭게 남겨 주세요!"
            onChange={(event) => setMessage(event.target.value)}
          />
        </Field>
      </Form>

      {/* 가로로 긴 둥근 사각형 버튼. 속을 살구색으로 채웁니다. */}
      {submitError && <SubmitError>{submitError}</SubmitError>}
      <SubmitButton type="button" disabled={submitting} onClick={finish}>
        지원 완료하기
      </SubmitButton>
    </Screen>
  );
}

const Screen = styled.div`
  min-height: 100dvh;
  padding: 8px 21px 28px;
  background-color: #ffffff;
  color: #2f3833;
`;

const Header = styled.header`
  position: relative;
  display: flex;
  align-items: center;
  height: 48px;
`;

const BackButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
`;

const BackIcon = styled.img`
  display: block;
  transform: rotate(90deg);
`;

const HeaderTitle = styled.h1`
  position: absolute;
  left: 50%;
  margin: 0;
  color: #424242;
  font-size: 20px;
  font-weight: 600;
  transform: translateX(-50%);
`;

const PostTitle = styled.h2`
  margin: 12px 0 0;
  color: #2f3833;
  font-size: 26px;
  font-weight: 700;
  line-height: 33px;
`;

const ShelterLink = styled.button`
  display: flex;
  align-items: center;
  margin-top: 8px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #454545;
  cursor: pointer;
`;

const ShelterName = styled.span`
  font-size: 15px;
  font-weight: 500;
  line-height: 18px;
  text-decoration: underline;
  text-underline-offset: 2px;
`;

const Chevron = styled.span`
  color: inherit;
  font-size: 15px;
  font-weight: 500;
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 26px;
  margin-top: 28px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.span`
  color: #4f7a5f;
  font-size: 15px;
  font-weight: 600;
`;

/* 필수 표시로 붙는 살구색 별입니다. */
const Required = styled.span`
  color: #e28777;
`;

const Input = styled.input`
  height: 43px;
  margin-top: 8px;
  padding: 0 12px;
  border: 1.5px solid #d9d9d9;
  border-radius: 10px;
  background-color: transparent;
  color: #2f3833;
  font-size: 13px;
  font-weight: 500;

  &::placeholder {
    color: #909090;
  }
`;

const TextArea = styled.textarea`
  height: 120px;
  margin-top: 8px;
  padding: 12px;
  border: 1.5px solid #d9d9d9;
  border-radius: 10px;
  background-color: transparent;
  color: #2f3833;
  font-size: 13px;
  font-weight: 500;
  resize: none;

  &::placeholder {
    color: #909090;
  }
`;

const ChoiceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px 8px;
  margin-top: 14px;
`;

const ChoiceColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin-top: 14px;
`;

const Choice = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  border: 0;
  padding: 0;
  background: transparent;
  color: #4e4e4e;
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
`;

/* 속이 비거나, 살구색으로 채워지는 동그란 선택 점입니다. */
const Radio = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 2px solid ${({ $selected }) => ($selected ? "#d4897a" : "#d9d9d9")};
  border-radius: 9px;
  background-color: ${({ $selected }) => ($selected ? "#d4897a" : "transparent")};
`;

/* 선택된 점 한가운데의 작은 흰색 사각형입니다. */
const RadioDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 5px;
  background-color: #ffffff;
`;

const OtherLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

/* 기타 뒤에 놓는 밑줄 입력 칸입니다. 네모 테두리는 없습니다. */
const OtherInput = styled.input`
  width: 90px;
  border: 0;
  border-bottom: 1px solid #4e4e4e;
  background: transparent;
  color: #4e4e4e;
  font-size: 14px;
  font-weight: 500;
`;

const SubmitError = styled.p`
  margin: 24px 0 0;
  color: #c4513b;
  font-size: 13px;
  font-weight: 500;
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 44px;
  margin-top: 32px;
  border: 0;
  border-radius: 10px;
  background-color: #e88b7a;
  color: #ffffff;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
`;
