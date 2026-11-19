import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import backIcon from "../../assets/icons/volunteer/apply/back.svg";
import pawIcon from "../../assets/icons/volunteer/apply/paw.svg";
import pinIcon from "../../assets/icons/volunteer/apply/pin.svg";
import stepDoneIcon from "../../assets/icons/volunteer/apply/step-done.svg";
import checkIcon from "../../assets/icons/volunteer/apply/check.svg";
import chevronIcon from "../../assets/icons/volunteer/apply/chevron.svg";
import infoCircleIcon from "../../assets/icons/volunteer/apply/info-circle.svg";
import infoMarkIcon from "../../assets/icons/volunteer/apply/info-mark.svg";
import { getPostingDetail, getPostingQuestions, getPostingSchedules } from "../../api/postings.js";
import { getMyProfile, getMyVolunteerExperiences } from "../../api/profile.js";
import { getMyAccount } from "../../api/users.js";
import { postVolunteerApplication } from "../../api/volunteer.js";

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

const EXPERIENCE_LABELS = {
  FIRST: "처음이에요",
  ONE_TO_THREE: "1~3회",
  FOUR_PLUS: "4회 이상",
};

/* 지원하기를 누르면 신청 정보, 추가 질문, 동의 순서로 진행됩니다. */
export default function Apply() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const numericId = /^\d+$/.test(String(postId ?? ""));
  const [post, setPost] = useState(null);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("");
  const [experienceId, setExperienceId] = useState(null);
  const [editingExperience, setEditingExperience] = useState(false);
  const [message, setMessage] = useState("");
  const [checked, setChecked] = useState(() => new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [schedules, setSchedules] = useState(null);
  const [selectedKey, setSelectedKey] = useState("");
  const [questions, setQuestions] = useState(null);
  const [answerMap, setAnswerMap] = useState({});

  /* 공고 제목, 시설명, 사진은 공고 상세에서만 가져옵니다. */
  useEffect(() => {
    if (!numericId) {
      setPost({});
      return undefined;
    }
    let ignore = false;
    getPostingDetail(postId)
      .then((result) => {
        if (ignore) return;
        setPost(result?.isSuccess ? toApplyPost(result.data) : {});
      })
      .catch(() => {
        if (!ignore) setPost({});
      });
    return () => {
      ignore = true;
    };
  }, [numericId, postId]);

  /* 신청 가능한 일정만 보여 줍니다. 실패하면 시간을 비워 둡니다. */
  useEffect(() => {
    if (!numericId) {
      setSchedules([]);
      return undefined;
    }
    let ignore = false;
    getPostingSchedules(postId)
      .then((result) => {
        if (ignore) return;
        const options = result?.isSuccess && Array.isArray(result.data?.items)
          ? result.data.items.map((item, index) => ({
              key: String(item.scheduleId ?? item.activityStartAt ?? item.startAt ?? index),
              scheduleId: item.scheduleId ?? null,
              label: formatScheduleLabel(item),
            }))
          : [];
        setSchedules(options);
        setSelectedKey(options[0]?.key ?? "");
      })
      .catch(() => {
        if (!ignore) setSchedules([]);
      });
    return () => {
      ignore = true;
    };
  }, [numericId, postId]);

  /* 신청서 질문이 있을 때만 추가 질문을 보여 줍니다. */
  useEffect(() => {
    if (!numericId) {
      setQuestions([]);
      return undefined;
    }
    let ignore = false;
    getPostingQuestions(postId)
      .then((result) => {
        if (ignore) return;
        const items = result?.isSuccess && Array.isArray(result.data?.items)
          ? result.data.items.map(toQuestion).filter(Boolean)
          : [];
        setQuestions(items);
      })
      .catch(() => {
        if (!ignore) setQuestions([]);
      });
    return () => {
      ignore = true;
    };
  }, [numericId, postId]);

  /* 봉사 경험은 저장한 경험이나 프로필의 경험 수준만 보여 줍니다. */
  useEffect(() => {
    let ignore = false;
    Promise.all([
      getMyVolunteerExperiences().catch(() => null),
      getMyProfile().catch(() => null),
    ]).then(([experienceResult, profileResult]) => {
      if (ignore) return;
      const items = experienceResult?.isSuccess ? experienceResult.data?.experiences ?? [] : [];
      const latest = [...items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )[0];
      if (latest) {
        setExperienceId(latest.experienceId ?? null);
        setExperience(latest.summary || latest.content || "");
        return;
      }
      const level = profileResult?.isSuccess ? profileResult.data?.experienceLevel : null;
      setExperience(EXPERIENCE_LABELS[level] ?? "");
    });
    return () => {
      ignore = true;
    };
  }, []);

  /* 가입할 때 저장한 이름과 연락처를 입력칸에 넣습니다. */
  async function fillSavedProfile() {
    try {
      const result = await getMyAccount();
      if (!result?.isSuccess) return;
      setName(result.data?.name ?? "");
      setPhone(result.data?.phone ?? "");
    } catch {
      /* 계정을 못 가져오면 입력칸은 그대로 둡니다. */
    }
  }

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
    if (submitting || !CONSENTS.every((label) => checked.has(label))) return;
    const chosen = schedules?.find((item) => item.key === selectedKey);
    if (chosen?.scheduleId == null) {
      setSubmitError("신청할 일정을 선택해 주세요.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const answers = (questions ?? [])
        .filter((item) => item.questionId != null)
        .map((item) => ({
          questionId: item.questionId,
          values: (answerMap[item.key] ?? []).filter((value) => value !== ""),
        }))
        .filter((item) => item.values.length);
      await postVolunteerApplication(chosen.scheduleId, {
        answers,
        message,
        experienceId,
      });
      navigate("/volunteer/complete");
    } catch (error) {
      setSubmitError(error.message || "신청에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  const chosenSchedule = schedules?.find((item) => item.key === selectedKey);
  const allAgreed = CONSENTS.every((label) => checked.has(label));

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
                  <ActivityTitle>{post?.title ?? ""}</ActivityTitle>
                  <ShelterLine>
                    <Pin src={pinIcon} alt="" />
                    {post?.shelterName ?? ""}
                  </ShelterLine>
                </ActivityText>
                {post?.photo ? (
                  <PhotoImage src={post.photo} alt="" />
                ) : (
                  <PhotoBox>
                    <Paw src={pawIcon} alt="" />
                    <PhotoLabel>활동 사진</PhotoLabel>
                  </PhotoBox>
                )}
              </ActivityCard>
            </Section>

            <Section>
              <SectionTitle>활동 시간 선택</SectionTitle>
              <TimeList>
                {/* 일정이 오기 전에도 선택한 것과 같은 네모칸을 먼저 보여 줍니다. */}
                {schedules === null ? (
                  <TimeOption as="div" $selected>
                    <FilledRadio>
                      <RadioDot />
                    </FilledRadio>
                  </TimeOption>
                ) : (
                  schedules.map((option) => {
                    const selected = option.key === selectedKey;
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
                  })
                )}
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
              <ProfileLink type="button" onClick={fillSavedProfile}>
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
                  <ExperienceInput
                    value={experience}
                    rows={1}
                    onChange={(event) => setExperience(event.target.value)}
                    autoFocus
                  />
                ) : (
                  <ExperienceText>{experience}</ExperienceText>
                )}
              </ExperienceBox>
              <ProfileLink type="button" onClick={() => setEditingExperience(true)}>
                수정하기
              </ProfileLink>
            </Section>

            {questions?.length > 0 &&
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
              ))}

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
                <SummaryTitle>{post?.title ?? ""}</SummaryTitle>
              </SummaryTop>
              <SummaryTime>{chosenSchedule?.label ?? ""}</SummaryTime>
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
                <InfoCircle src={infoCircleIcon} alt="" />
                <InfoGlyph src={infoMarkIcon} alt="" />
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
          disabled={submitting || (step === 3 && !allAgreed)}
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
  min-height: 23px;
  margin: 0;
  color: #2f3833;
  font-size: 19px;
  font-weight: 700;
`;

const ShelterLine = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 16px;
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

const PhotoImage = styled.img`
  width: 69px;
  height: 54px;
  border-radius: 5px;
  object-fit: cover;
`;

function toApplyPost(data) {
  const photo = (Array.isArray(data?.imageUrls) ? data.imageUrls : []).find(Boolean);
  return {
    title: data?.title ?? "",
    shelterName: data?.shelter?.name ?? "",
    photo: photo || "",
  };
}

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

/* 선택된 항목의 분홍색 동그라미입니다. 흰 점은 원의 정가운데에 둡니다. */
const FilledRadio = styled.span`
  position: relative;
  display: block;
  flex-shrink: 0;
  width: ${(props) => (props.$small ? "18px" : "22px")};
  height: ${(props) => (props.$small ? "18px" : "22px")};
  border-radius: 50%;
  background-color: #d4897a;
`;

const RadioDot = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${(props) => (props.$small ? "6px" : "8px")};
  height: ${(props) => (props.$small ? "6px" : "8px")};
  border-radius: 50%;
  background-color: #ffffff;
  transform: translate(-50%, -50%);
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
  align-items: flex-start;
  box-sizing: border-box;
  min-height: 43px;
  height: auto;
  padding: 10px 18px;
  border: 1px solid #908b8a;
  border-radius: 10px;
`;

const ExperienceText = styled.p`
  margin: 0;
  min-width: 0;
  color: #2f3833;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  word-break: break-word;
`;

const ExperienceInput = styled.textarea`
  width: 100%;
  min-height: 22px;
  border: 0;
  padding: 0;
  resize: none;
  overflow: hidden;
  color: #2f3833;
  font-family: inherit;
  font-size: 15px;
  font-weight: 500;
  line-height: 22px;
  field-sizing: content;
  outline: none;
`;

const QuestionBlock = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
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

/* 피그마의 16px 안내 기호. 원과 i 를 각 그림의 원래 크기로 겹칩니다. */
const InfoMark = styled.span`
  position: relative;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 2px;
`;

const InfoCircle = styled.img`
  position: absolute;
  top: 0.75px;
  left: 0.75px;
  max-width: none;
`;

const InfoGlyph = styled.img`
  position: absolute;
  top: 4.05px;
  left: 7.24px;
  max-width: none;
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

  &:disabled {
    background-color: #f4d5ce;
    cursor: default;
  }
`;
