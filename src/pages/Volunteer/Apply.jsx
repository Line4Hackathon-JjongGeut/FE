import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import backIcon from "../../assets/icons/volunteer/apply/back.svg";
import pawIcon from "../../assets/icons/volunteer/apply/paw.svg";
import pinIcon from "../../assets/icons/volunteer/apply/pin.svg";
import stepDoneIcon from "../../assets/icons/volunteer/apply/step-done.svg";
import checkIcon from "../../assets/icons/volunteer/apply/check.svg";
import chevronIcon from "../../assets/icons/volunteer/apply/chevron.svg";
import infoRingIcon from "../../assets/icons/volunteer/apply/info-ring.svg";
import infoStemIcon from "../../assets/icons/volunteer/apply/info-stem.svg";
import { getPostingQuestions, getPostingSchedules } from "../../api/postings.js";
import { postVolunteerApplication } from "../../api/volunteer.js";
import { findVolunteerPost, SHELTER_DETAIL, VOLUNTEER_POSTS } from "../../dummyData/shelters/shelterDummy.js";
import { addApplication } from "../../dummyData/volunteer/applications.js";

const STEPS = [
  { id: 1, label: "신청 정보" },
  { id: 2, label: "추가 질문" },
  { id: 3, label: "동의" },
];

const CONSENTS = [
  "개인정보 수집 및 이용 동의",
  "신청 정보의 보호시설 제공 동의",
  "봉사활동 유의사항 확인",
];

const SAVED_PROFILE = {
  name: "이현승",
  phone: "010-1234-5678",
};

/* 지원하기를 누르면 신청 정보, 추가 질문, 동의 순서로 진행됩니다. */
export default function Apply() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const post = findVolunteerPost(postId);
  const source = VOLUNTEER_POSTS.find((item) => item.id === Number(postId)) ?? VOLUNTEER_POSTS[0];
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("1 - 3회 / 온보딩에서 입력한 경험");
  const [editingExperience, setEditingExperience] = useState(false);
  const [joined, setJoined] = useState("없어요");
  const [message, setMessage] = useState("");
  const [checked, setChecked] = useState(() => new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [schedules, setSchedules] = useState(null);
  const [selectedKey, setSelectedKey] = useState("saved");
  const [questions, setQuestions] = useState(null);
  const [answerMap, setAnswerMap] = useState({});

  /* 숫자 공고 번호면 신청 가능한 일정을 가져옵니다. 실패하면 기존 시간 하나를 유지합니다. */
  useEffect(() => {
    if (!/^\d+$/.test(String(postId ?? ""))) return undefined;
    let ignore = false;
    getPostingSchedules(postId)
      .then((result) => {
        if (ignore || !result?.isSuccess || !Array.isArray(result.data?.items)) return;
        const options = result.data.items.map((item, index) => ({
          key: String(item.scheduleId ?? item.activityStartAt ?? item.startAt ?? index),
          scheduleId: item.scheduleId ?? null,
          label: formatScheduleLabel(item),
        }));
        if (!options.length) return;
        setSchedules(options);
        setSelectedKey(options[0].key);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [postId]);

  /* 숫자 공고 번호면 신청서 질문을 가져옵니다. 질문이 아니면 기존 추가 질문을 유지합니다. */
  useEffect(() => {
    if (!/^\d+$/.test(String(postId ?? ""))) return undefined;
    let ignore = false;
    getPostingQuestions(postId)
      .then((result) => {
        if (ignore || !result?.isSuccess || !Array.isArray(result.data?.items)) return;
        const items = result.data.items.map(toQuestion).filter(Boolean);
        if (!items.length) return;
        setQuestions(items);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [postId]);

  function chooseAnswer(question, option) {
    setAnswerMap((current) => {
      const prev = current[question.key] ?? [];
      const next = question.multiple
        ? prev.includes(option)
          ? prev.filter((item) => item !== option)
          : [...prev, option]
        : [option];
      return { ...current, [question.key]: next };
    });
  }

  function toggleConsent(label) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  /* 접수 신청 완료하기. 선택한 일정으로 봉사 신청을 보내고, 성공하면 완료 화면으로 이동합니다. */
  async function finish() {
    if (submitting) return;
    const chosen = schedules?.find((item) => item.key === selectedKey);
    const scheduleId = chosen?.scheduleId ?? post.scheduleId ?? post.id;
    setSubmitting(true);
    setSubmitError("");
    try {
      const answers = questions?.length
        ? questions
            .filter((item) => item.questionId != null)
            .map((item) => ({
              questionId: item.questionId,
              values: (answerMap[item.key] ?? []).filter((value) => value !== ""),
            }))
            .filter((item) => item.values.length)
        : post.questionId != null
          ? [{ questionId: post.questionId, values: [joined] }]
          : [];
      await postVolunteerApplication(scheduleId, {
        answers,
        message,
        experienceId: post.experienceId,
      });
      addApplication({
        title: post.title,
        shelter: SHELTER_DETAIL.name,
        schedule: chosen?.label ?? post.schedule,
        place: "서울 용산구 보호시설",
        applicant: name.trim() || SAVED_PROFILE.name,
        supplies: "편한 복장과 운동화를 착용해 주세요.\n활동 전 보호시설의 안내를 확인해 주세요.",
      });
      navigate("/volunteer/complete");
    } catch (error) {
      setSubmitError(error.message || "신청에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Header>
        <BackButton type="button" aria-label="뒤로 가기" onClick={() => (step === 1 ? navigate(-1) : setStep(step - 1))}>
          {/* 아래를 향하는 꺾쇠를 돌려 왼쪽 화살표로 씁니다. */}
          <BackIcon src={backIcon} alt="" />
        </BackButton>
        <Title>봉사 신청</Title>
      </Header>

      {/* 지난 단계는 초록 원과 체크, 현재 단계는 분홍 원, 남은 단계는 회색 테두리 원입니다. */}
      <Stepper>
        {STEPS.map((item, index) => (
          <StepSlot key={item.id}>
            <StepColumn>
              {step > item.id ? (
                <DoneCircle>
                  <img src={stepDoneIcon} alt="" />
                  <Tick src={checkIcon} alt="" />
                </DoneCircle>
              ) : (
                <NumberCircle $current={step === item.id}>{item.id}</NumberCircle>
              )}
              <StepLabel $current={step === item.id}>{item.label}</StepLabel>
            </StepColumn>
            {index < STEPS.length - 1 && <Connector />}
          </StepSlot>
        ))}
      </Stepper>

      <Body>
        {step === 1 && (
          <>
            <Headline>신청할 활동을 확인해 주세요.</Headline>
            <Guide>선택한 일정과 신청 정보를 확인해 주세요.</Guide>

            <Section>
              <SectionTitle>신청 활동</SectionTitle>
              <ActivityCard>
                <ActivityText>
                  <ActivityTitle>{post.title}</ActivityTitle>
                  <ShelterLine>
                    <Pin src={pinIcon} alt="" />
                    {source.shelterName}
                  </ShelterLine>
                </ActivityText>
                {/* 연두색 둥근 사각형 안에 발바닥과 사진 자리 글자를 둡니다. */}
                <PhotoBox>
                  <Paw src={pawIcon} alt="" />
                  <PhotoLabel>활동 사진</PhotoLabel>
                </PhotoBox>
              </ActivityCard>
            </Section>

            <Section>
              <SectionTitle>활동 시간 선택</SectionTitle>
              <TimeList>
                {(schedules ?? [{ key: "saved", label: post.cardSchedule }]).map((option) => {
                  const selected = option.key === selectedKey || (!schedules && option.key === "saved");
                  return (
                    <TimeOption
                      key={option.key}
                      type="button"
                      $selected={selected}
                      onClick={() => setSelectedKey(option.key)}
                    >
                      {selected ? (
                        <FilledRadio>
                          <RadioDot />
                        </FilledRadio>
                      ) : (
                        <EmptyRadio $large />
                      )}
                      {option.label}
                    </TimeOption>
                  );
                })}
              </TimeList>
            </Section>

            <Section>
              <SectionTitle>신청자 정보</SectionTitle>
              <Field
                value={name}
                placeholder="이름을 입력해 주세요."
                onChange={(event) => setName(event.target.value)}
              />
              <Field
                value={phone}
                placeholder="연락처를 입력해 주세요."
                onChange={(event) => setPhone(event.target.value)}
              />
              <ProfileLink
                type="button"
                onClick={() => {
                  setName(SAVED_PROFILE.name);
                  setPhone(SAVED_PROFILE.phone);
                }}
              >
                가입 시 입력한 정보 가져오기
              </ProfileLink>
            </Section>
          </>
        )}

        {step === 2 && (
          <>
            <Headline>
              보호 시설에 전달할 정보를
              <br />
              입력해 주세요.
            </Headline>

            <Section>
              <SectionTitle>봉사 경험</SectionTitle>
              <ExperienceBox>
                {editingExperience ? (
                  <ExperienceInput value={experience} onChange={(event) => setExperience(event.target.value)} autoFocus />
                ) : (
                  <ExperienceText>{experience}</ExperienceText>
                )}
              </ExperienceBox>
              <ProfileLink type="button" onClick={() => setEditingExperience(true)}>
                수정하기
              </ProfileLink>
            </Section>

            {questions?.length ? (
              questions.map((question) => (
                <QuestionBlock key={question.key}>
                  <SectionTitle>
                    {question.label}
                    {question.required && <Required>*</Required>}
                  </SectionTitle>
                  {question.text ? (
                    <Message
                      value={(answerMap[question.key] ?? [])[0] ?? ""}
                      placeholder="답변을 입력해 주세요."
                      onChange={(event) =>
                        setAnswerMap((current) => ({ ...current, [question.key]: [event.target.value] }))
                      }
                    />
                  ) : (
                    question.choices.map((option) => {
                      const picked = (answerMap[question.key] ?? []).includes(option);
                      return (
                        <Choice key={option} type="button" onClick={() => chooseAnswer(question, option)}>
                          {picked ? (
                            <FilledRadio $small>
                              <RadioDot $small />
                            </FilledRadio>
                          ) : (
                            <EmptyRadio />
                          )}
                          {option}
                        </Choice>
                      );
                    })
                  )}
                </QuestionBlock>
              ))
            ) : (
              <QuestionBlock>
                <SectionTitle>
                  추가 질문<Required>*</Required>
                </SectionTitle>
                <Question>동물과 함께하는 봉사에 참여한 적이 있나요?</Question>
                {["있어요", "없어요"].map((option) => (
                  <Choice key={option} type="button" onClick={() => setJoined(option)}>
                    {joined === option ? (
                      <FilledRadio $small>
                        <RadioDot $small />
                      </FilledRadio>
                    ) : (
                      <EmptyRadio />
                    )}
                    {option}
                  </Choice>
                ))}
              </QuestionBlock>
            )}

            <Section>
              <SectionTitle>보호시설에 전할 말</SectionTitle>
              <Message
                value={message}
                placeholder="참여 전에 전달할 내용을 자유롭게 작성해 주세요."
                onChange={(event) => setMessage(event.target.value)}
              />
            </Section>
          </>
        )}

        {step === 3 && (
          <>
            <Headline>신청 전에 확인해 주세요.</Headline>
            <SummaryCard>
              <SummaryTop>
                <PlanBadge>참여 예정</PlanBadge>
                <SummaryTitle>{post.title}</SummaryTitle>
              </SummaryTop>
              <SummaryTime>{post.schedule}</SummaryTime>
            </SummaryCard>

            <Section>
              <SectionTitle>필수 확인 및 동의</SectionTitle>
              {CONSENTS.map((label) => (
                <ConsentRow key={label} type="button" onClick={() => toggleConsent(label)}>
                  {checked.has(label) ? (
                    <FilledRadio $small>
                      <RadioDot $small />
                    </FilledRadio>
                  ) : (
                    <EmptyRadio />
                  )}
                  <ConsentLabel>{label}</ConsentLabel>
                  {/* 아래를 향하는 꺾쇠를 돌려 오른쪽 화살표로 씁니다. */}
                  <Chevron src={chevronIcon} alt="" />
                </ConsentRow>
              ))}
            </Section>

            <Notice>
              <InfoMark>
                <img src={infoRingIcon} alt="" />
                <InfoStem src={infoStemIcon} alt="" />
              </InfoMark>
              <NoticeText>
                <strong>신청완료 후 보호시설이 검토해요.</strong>
                승인 전에는 참여가 확정되지 않아요.
              </NoticeText>
            </Notice>
          </>
        )}
      </Body>

      <Footer>
        {step === 3 && submitError && <SubmitError>{submitError}</SubmitError>}
        <NextButton
          type="button"
          disabled={submitting}
          onClick={() => (step === 3 ? finish() : setStep(step + 1))}
        >
          {step === 3 ? "접수 신청 완료하기" : "다음"}
        </NextButton>
      </Footer>
    </Screen>
  );
}

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  background-color: #ffffff;
`;

const Header = styled.header`
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  align-items: center;
  height: 56px;
  padding: 0 16px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  background: transparent;
  cursor: pointer;
`;

const BackIcon = styled.img`
  width: 18px;
  height: 10px;
  transform: rotate(90deg);
`;

const Title = styled.h1`
  margin: 0;
  color: #424242;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
`;

const Stepper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 4px;
`;

const StepSlot = styled.div`
  display: flex;
  align-items: flex-start;
`;

const StepColumn = styled.div`
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  align-items: center;
  width: 72px;
`;

/* 현재 단계는 분홍 원, 아직 오지 않은 단계는 회색 테두리 원입니다. */
const NumberCircle = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 27px;
  height: 27px;
  border-radius: 50%;
  background-color: ${(props) => (props.$current ? "#e88b7a" : "#ffffff")};
  border: 1.5px solid ${(props) => (props.$current ? "#e88b7a" : "#d9d9d9")};
  color: ${(props) => (props.$current ? "#ffffff" : "#908b8a")};
  font-size: 13px;
  font-weight: 600;
`;

const DoneCircle = styled.span`
  position: relative;
  width: 27px;
  height: 27px;

  img:first-child {
    width: 27px;
    height: 27px;
  }
`;

const Tick = styled.img`
  position: absolute;
  top: 8px;
  left: 7px;
  width: 12px;
  height: 9px;
`;

const StepLabel = styled.span`
  margin-top: 8px;
  color: ${(props) => (props.$current ? "#e88b7a" : "#4a524d")};
  font-size: 13px;
  font-weight: ${(props) => (props.$current ? 600 : 500)};
  white-space: nowrap;
`;

/* 단계 원과 원 사이의 짧은 가로선입니다. */
const Connector = styled.span`
  flex-shrink: 0;
  width: 28px;
  height: 1px;
  margin-top: 13px;
  background-color: #d9d9d9;
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 26px;
  padding: 28px 24px 12px;
`;

const Headline = styled.h2`
  margin: 0;
  color: #000000;
  font-size: 26px;
  font-weight: 600;
  line-height: 34px;
`;

const Guide = styled.p`
  margin: -14px 0 0;
  color: #535353;
  font-size: 16px;
  font-weight: 500;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  margin: 0;
  color: #4f7a5f;
  font-size: 15px;
  font-weight: 600;
`;

const Required = styled.span`
  color: #e28777;
`;

/* 회색 테두리의 가로로 긴 둥근 사각형입니다. */
const ActivityCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 79px;
  padding: 0 12px 0 20px;
  border: 1px solid #908b8a;
  border-radius: 10px;
`;

const ActivityText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
`;

const ActivityTitle = styled.p`
  margin: 0;
  color: #2f3833;
  font-size: 19px;
  font-weight: 700;
`;

const ShelterLine = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: #4f5a54;
  font-size: 12px;
  font-weight: 600;
`;

const Pin = styled.img`
  width: 9px;
  height: 13px;
`;

/* 활동 사진이 들어갈 연두색 둥근 사각형입니다. */
const PhotoBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  width: 69px;
  height: 54px;
  border-radius: 5px;
  background-color: #bdd9c4;
`;

const Paw = styled.img`
  width: 17px;
  height: 16px;
`;

const PhotoLabel = styled.span`
  color: #1f1e1c;
  font-size: 7px;
  font-weight: 600;
`;

function toQuestion(item, index) {
  const questionId = item.questionId ?? item.id ?? null;
  const label = item.label ?? item.content ?? item.question ?? item.title ?? item.text ?? "";
  const rawChoices = item.choices ?? item.options ?? item.selectOptions ?? [];
  const choices = (Array.isArray(rawChoices) ? rawChoices : [])
    .map((choice) => (typeof choice === "string" ? choice : choice?.label ?? choice?.value ?? choice?.text ?? ""))
    .filter(Boolean);
  const typeName = String(item.type ?? item.questionType ?? item.inputType ?? "").toUpperCase();
  const multiple = item.multiple === true || typeName.includes("MULTI");
  const text = choices.length === 0 || typeName.includes("TEXT");
  if (questionId == null && !label) return null;
  return {
    key: String(questionId ?? index),
    questionId,
    label: label || "추가 질문",
    required: item.required === true || item.isRequired === true,
    multiple,
    text,
    choices: text ? [] : choices,
  };
}

function formatScheduleLabel(item) {
  const start = item.startAt ?? item.activityStartAt;
  const end = item.endAt ?? item.activityEndAt;
  const startDate = new Date(start);
  if (Number.isNaN(startDate.getTime())) return item.postingTitle || "일정";
  const week = ["일", "월", "화", "수", "목", "금", "토"][startDate.getDay()];
  const clock = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const endDate = new Date(end);
  const range = Number.isNaN(endDate.getTime()) ? clock(startDate) : `${clock(startDate)}-${clock(endDate)}`;
  const remain = item.remainingCount != null ? ` · 잔여 ${item.remainingCount}명` : "";
  return `${startDate.getMonth() + 1}월 ${startDate.getDate()}일 (${week}) ${range}${remain}`;
}

const TimeList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

/* 시간 선택. 고른 칸만 연분홍 배경입니다. */
const TimeOption = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 43px;
  padding: 0 13px;
  border: 1px solid ${(props) => (props.$selected ? "#d4897a" : "#d9d9d9")};
  border-radius: 10px;
  background-color: ${(props) => (props.$selected ? "#f7e6e1" : "#ffffff")};
  color: #2f3833;
  font-size: 15px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
`;

/* 선택된 항목의 분홍색 동그라미입니다. */
const FilledRadio = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: ${(props) => (props.$small ? "18px" : "22px")};
  height: ${(props) => (props.$small ? "18px" : "22px")};
  border-radius: 50%;
  background-color: #d4897a;
`;

const RadioDot = styled.span`
  width: ${(props) => (props.$small ? "7px" : "8px")};
  height: ${(props) => (props.$small ? "7px" : "8px")};
  border-radius: 50%;
  background-color: #ffffff;
`;

/* 아직 고르지 않은 회색 테두리 동그라미입니다. */
const EmptyRadio = styled.span`
  flex-shrink: 0;
  width: ${(props) => (props.$large ? "22px" : "18px")};
  height: ${(props) => (props.$large ? "22px" : "18px")};
  border: 2px solid #d9d9d9;
  border-radius: 50%;
  box-sizing: border-box;
`;

const Field = styled.input`
  width: 100%;
  height: 43px;
  padding: 0 17px;
  border: 1px solid #908b8a;
  border-radius: 10px;
  color: #2f3833;
  font-size: 15px;
  font-weight: 500;

  &::placeholder {
    color: #909090;
    font-size: 13px;
    font-weight: 500;
  }
`;

const ProfileLink = styled.button`
  align-self: flex-end;
  margin-top: -4px;
  border: 0;
  background: transparent;
  color: #908b8a;
  font-size: 10px;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
`;

const ExperienceBox = styled.div`
  display: flex;
  align-items: center;
  height: 43px;
  padding: 0 18px;
  border: 1px solid #908b8a;
  border-radius: 10px;
`;

const ExperienceText = styled.p`
  margin: 0;
  color: #2f3833;
  font-size: 15px;
  font-weight: 500;
`;

const ExperienceInput = styled.input`
  width: 100%;
  border: 0;
  color: #2f3833;
  font-size: 15px;
  font-weight: 500;
  outline: none;
`;

const QuestionBlock = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Question = styled.p`
  margin: 0 0 4px;
  color: #282828;
  font-size: 14px;
  font-weight: 600;
`;

const Choice = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  border: 0;
  background: transparent;
  color: #4e4e4e;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
`;

const Message = styled.textarea`
  width: 100%;
  height: 124px;
  padding: 12px 15px;
  border: 1px solid #908b8a;
  border-radius: 10px;
  resize: none;
  color: #2f3833;
  font-size: 13px;
  font-weight: 500;
  line-height: 19px;

  &::placeholder {
    color: #909090;
  }
`;

const SummaryCard = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-height: 64px;
  padding: 12px;
  border: 1px solid #908b8a;
  border-radius: 10px;
`;

const SummaryTop = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

/* 연초록 알약 모양 배지입니다. */
const PlanBadge = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 11px;
  background-color: #e3f0e6;
  color: #2f5e43;
  font-size: 12px;
  font-weight: 700;
`;

const SummaryTitle = styled.p`
  margin: 0;
  color: #000000;
  font-size: 17px;
  font-weight: 600;
`;

const SummaryTime = styled.p`
  margin: 0;
  color: #2f3833;
  font-size: 10px;
  font-weight: 500;
  text-align: right;
`;

const ConsentRow = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  height: 43px;
  padding: 0 14px;
  border: 1px solid #908b8a;
  border-radius: 10px;
  background-color: #ffffff;
  cursor: pointer;
`;

const ConsentLabel = styled.span`
  flex: 1;
  color: #312d2d;
  font-size: 14px;
  font-weight: 600;
  text-align: left;
`;

const Chevron = styled.img`
  width: 13px;
  height: 7px;
  transform: rotate(-90deg);
`;

/* 안내 글이 들어가는 베이지색 둥근 사각형입니다. */
const Notice = styled.div`
  display: flex;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  background-color: #f7f4ef;
`;

const InfoMark = styled.span`
  position: relative;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 2px;

  img:first-child {
    width: 14.5px;
    height: 14.5px;
  }
`;

const InfoStem = styled.img`
  position: absolute;
  top: 3px;
  left: 6.5px;
  width: 1.5px;
  height: 8px;
`;

const NoticeText = styled.p`
  margin: 0;
  color: #5e5a55;
  font-size: 13px;
  font-weight: 400;
  line-height: 19.5px;

  strong {
    display: block;
    font-weight: 600;
  }
`;

const Footer = styled.div`
  margin-top: auto;
  padding: 16px 19px 28px;
`;

const SubmitError = styled.p`
  margin: 0 0 8px;
  color: #c4513b;
  font-size: 13px;
  font-weight: 500;
`;

/* 화면 아래쪽의 가로로 긴 분홍색 둥근 사각형 버튼입니다. */
const NextButton = styled.button`
  width: 100%;
  height: 44px;
  border: 0;
  border-radius: 10px;
  background-color: #e88b7a;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;
