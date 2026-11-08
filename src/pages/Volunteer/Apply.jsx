import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import backIcon from "../../assets/icons/shelters/back.svg";
import stepActiveIcon from "../../assets/icons/volunteer/step-active.svg";
import stepIdleIcon from "../../assets/icons/volunteer/step-idle.svg";
import stepCheckIcon from "../../assets/icons/volunteer/step-check.svg";
import miniPawIcon from "../../assets/icons/volunteer/mini-paw.svg";
import miniPinIcon from "../../assets/icons/volunteer/mini-pin.svg";
import consentCircleIcon from "../../assets/icons/volunteer/consent-circle.svg";
import infoRingIcon from "../../assets/icons/shelters/info-ring.svg";
import infoStemIcon from "../../assets/icons/shelters/info-stem.svg";
import { findVolunteerPost, SHELTER_DETAIL } from "../../dummyData/shelters/shelterDummy.js";
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

/* 지원하기를 누르면 신청 정보, 추가 질문, 동의 순서로 진행됩니다. */
export default function Apply() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const post = findVolunteerPost(postId);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("이현승");
  const [phone, setPhone] = useState("010-1234-5678");
  const [experience, setExperience] = useState("1 - 3회/ 온보딩에서 입력한 경험");
  const [editingExperience, setEditingExperience] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [message, setMessage] = useState("");
  const [checked, setChecked] = useState(() => new Set());

  function toggleConsent(label) {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function finish() {
    addApplication({
      title: post.title,
      shelter: SHELTER_DETAIL.name,
      schedule: post.schedule,
      place: "서울 용산구 보호시설",
      applicant: name.trim() || "이현승",
      supplies: "편한 복장과 운동화를 착용해 주세요.\n활동 전 보호시설의 안내를 확인해 주세요.",
    });
    navigate("/volunteer/complete");
  }

  return (
    <Screen>
      <Header>
        <BackButton type="button" aria-label="뒤로 가기" onClick={() => (step === 1 ? navigate(-1) : setStep(step - 1))}>
          <BackIcon src={backIcon} alt="" />
        </BackButton>
        <Title>봉사 신청</Title>
      </Header>

      {/* 1 신청 정보, 2 추가 질문, 3 동의. 지난 단계는 체크, 현재 단계는 분홍색입니다. */}
      <Stepper>
        {STEPS.map((item, index) => (
          <Step key={item.id}>
            <StepMark>
              {step > item.id ? (
                <img src={stepCheckIcon} alt="" />
              ) : (
                <Dot>
                  <img src={step === item.id ? stepActiveIcon : stepIdleIcon} alt="" />
                  <StepNumber $current={step === item.id}>{item.id}</StepNumber>
                </Dot>
              )}
              {index < STEPS.length - 1 && <Line />}
            </StepMark>
            <StepLabel $current={step === item.id}>{item.label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {step === 1 && (
        <Body>
          <Headline>신청할 활동을 확인해 주세요</Headline>
          <Guide>선택한 일정과 신청 정보를 확인해 주세요.</Guide>
          <SectionTitle>신청 활동</SectionTitle>
          <ActivityCard>
            <Thumb>
              <img src={miniPawIcon} alt="" />
              <ThumbLabel>활동 사진</ThumbLabel>
            </Thumb>
            <ActivityText>
              <ActivityTitle>{post.title}</ActivityTitle>
              <ShelterLine>
                <img src={miniPinIcon} alt="" />
                {post.shelterName}
              </ShelterLine>
            </ActivityText>
          </ActivityCard>

          <SectionTitle>신청 활동</SectionTitle>
          <Schedule>
            <Radio />
            {post.schedule}
          </Schedule>

          <SectionTitle>신청자 정보</SectionTitle>
          <Field>
            <FieldLabel>이름</FieldLabel>
            <FieldInput value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
          <Field>
            <FieldLabel>연락처</FieldLabel>
            <FieldInput value={phone} onChange={(event) => setPhone(event.target.value)} />
          </Field>
          <Hint>가입 시 입력한 정보가 자동으로 채워져요.</Hint>
          <Grow />
          <NextButton type="button" onClick={() => setStep(2)}>
            다음
          </NextButton>
        </Body>
      )}

      {step === 2 && (
        <Body>
          <Headline>
            보호시설에서 몇가지를
            <br />
            확인하고 싶어 해요
          </Headline>
          <Guide>공고에 따라 질문이 달라질 수 있어요.</Guide>

          <SectionTitle>봉사 경험</SectionTitle>
          <ExperienceRow>
            {editingExperience ? (
              <ExperienceInput value={experience} onChange={(event) => setExperience(event.target.value)} />
            ) : (
              <ExperienceText>{experience}</ExperienceText>
            )}
            <EditButton type="button" onClick={() => setEditingExperience((current) => !current)}>
              수정
            </EditButton>
          </ExperienceRow>

          <SectionTitle>추가 질문 1</SectionTitle>
          <Question>동물과 함께하는 봉사에 참여한 적 있나요?</Question>
          {/* 선택한 답만 분홍색으로 채워집니다. */}
          <Answers>
            {["네", "아니요"].map((choice) => (
              <Answer
                key={choice}
                type="button"
                $selected={answer === choice}
                onClick={() => setAnswer(choice)}
              >
                {choice}
              </Answer>
            ))}
          </Answers>

          <SectionTitle>보호시설에 전할 말</SectionTitle>
          <Message
            value={message}
            placeholder="참여 전에 전달할 내용을 적어주세요"
            onChange={(event) => setMessage(event.target.value)}
          />
          <Grow />
          <NextButton type="button" onClick={() => setStep(3)}>
            다음
          </NextButton>
        </Body>
      )}

      {step === 3 && (
        <Body>
          <Headline>신청 전에 확인해 주세요</Headline>
          <Guide>동의 후 신청이 접수되며, 참여는 승인 후 확정돼요.</Guide>
          <Summary>
            <Badge>참여 예정</Badge>
            <SummaryTitle>{post.title}</SummaryTitle>
            <SummaryTime>{post.schedule}</SummaryTime>
          </Summary>

          <SectionTitle>필수 확인 및 동의</SectionTitle>
          {CONSENTS.map((label) => (
            <Consent key={label} type="button" onClick={() => toggleConsent(label)}>
              {checked.has(label) ? (
                <img src={stepCheckIcon} alt="" />
              ) : (
                <img src={consentCircleIcon} alt="" />
              )}
              <ConsentText>{label}</ConsentText>
              <Chevron src={backIcon} alt="" />
            </Consent>
          ))}

          <Notice>
            <InfoIcon aria-hidden="true">
              <img src={infoRingIcon} alt="" />
              <InfoStem src={infoStemIcon} alt="" />
            </InfoIcon>
            <span>
              신청완료 후 보호시설이 검토해요.
              <br />
              승인 전에는 참여가 확정되지 않아요.
            </span>
          </Notice>
          <Grow />
          <NextButton type="button" onClick={finish}>
            접수 신청 완료하기
          </NextButton>
        </Body>
      )}
    </Screen>
  );
}

const Screen = styled.div`
  min-height: 100dvh;
  background-color: #ffffff;
  color: #2f3833;
`;

const Header = styled.header`
  position: relative;
  display: flex;
  align-items: center;
  height: 72px;
  padding: 20px 24px 0;
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

const Title = styled.h1`
  position: absolute;
  left: 50%;
  margin: 0;
  transform: translateX(-50%);
  color: #424242;
  font-size: 20px;
  font-weight: 600;
`;

const Stepper = styled.ol`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
`;

const Step = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 92px;
`;

const StepMark = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Dot = styled.span`
  position: relative;
  display: inline-flex;
`;

const StepNumber = styled.span`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $current }) => ($current ? "#ffffff" : "#908b8a")};
  font-size: 16px;
  font-weight: 600;
`;

const Line = styled.span`
  position: absolute;
  top: 16px;
  left: 34px;
  width: 58px;
  height: 2px;
  background-color: #d9d9d9;
`;

const StepLabel = styled.span`
  margin-top: 8px;
  color: ${({ $current }) => ($current ? "#4f7a5f" : "#4a524d")};
  font-size: 13px;
  font-weight: 500;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - 168px);
  padding: 28px 24px 28px;
`;

const Headline = styled.h2`
  margin: 0;
  color: #000000;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.35;
`;

const Guide = styled.p`
  margin: 12px 0 0;
  color: #535353;
  font-size: 16px;
  font-weight: 500;
`;

const SectionTitle = styled.h3`
  margin: 22px 0 0;
  color: #4f7a5f;
  font-size: 15px;
  font-weight: 600;
`;

const ActivityCard = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  height: 79px;
  margin-top: 10px;
  padding: 12px;
  border: 1px solid #908b8a;
  border-radius: 10px;
`;

const Thumb = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 69px;
  height: 54px;
  border-radius: 5px;
  background-color: #bdd9c4;
`;

const ThumbLabel = styled.span`
  color: #1f1e1c;
  font-size: 7px;
  font-weight: 600;
`;

const ActivityText = styled.div`
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
  gap: 4px;
  margin: 6px 0 0;
  color: #4f5a54;
  font-size: 12px;
  font-weight: 600;
`;

const Schedule = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  height: 56px;
  margin-top: 10px;
  padding: 0 16px;
  border: 1px solid #d4897a;
  border-radius: 10px;
  background-color: #f7e6e1;
  color: #2f3833;
  font-size: 15px;
  font-weight: 600;
`;

const Radio = styled.span`
  width: 22px;
  height: 22px;
  border: 6px solid #d4897a;
  border-radius: 50%;
  background-color: #ffffff;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 63px;
  margin-top: 10px;
  padding: 0 12px;
  border: 1px solid #908b8a;
  border-radius: 10px;
`;

const FieldLabel = styled.span`
  color: #908b8a;
  font-size: 12px;
  font-weight: 600;
`;

const FieldInput = styled.input`
  border: 0;
  padding: 0;
  background: transparent;
  color: #2f3833;
  font-size: 15px;
  font-weight: 600;
  outline: none;
`;

const Hint = styled.p`
  margin: 8px 0 0;
  color: #908b8a;
  font-size: 10px;
  font-weight: 600;
`;

const ExperienceRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 10px;
`;

const ExperienceText = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  height: 51px;
  padding: 0 16px;
  border: 1px solid #908b8a;
  border-radius: 10px;
  color: #2f3833;
  font-size: 15px;
  font-weight: 500;
`;

const ExperienceInput = styled.input`
  flex: 1;
  height: 51px;
  padding: 0 16px;
  border: 1px solid #908b8a;
  border-radius: 10px;
  color: #2f3833;
  font-size: 15px;
  font-weight: 500;
  outline: none;
`;

const EditButton = styled.button`
  flex-shrink: 0;
  width: 71px;
  height: 51px;
  border: 1.5px solid #e88b7a;
  border-radius: 10px;
  background-color: #fbe3dc;
  color: #a9563f;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

const Question = styled.p`
  margin: 8px 0 0;
  color: #000000;
  font-size: 15px;
  font-weight: 600;
`;

const Answers = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
`;

const Answer = styled.button`
  flex: 1;
  height: 45px;
  border: 1px solid ${({ $selected }) => ($selected ? "#d4897a" : "#908b8a")};
  border-radius: 10px;
  background-color: ${({ $selected }) => ($selected ? "#f7e6e1" : "#ffffff")};
  color: #2f3833;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;

const Message = styled.textarea`
  height: 124px;
  margin-top: 10px;
  padding: 16px;
  border: 1px solid #908b8a;
  border-radius: 10px;
  color: #2f3833;
  font-size: 15px;
  font-weight: 600;
  resize: none;
  outline: none;

  &::placeholder {
    color: #bebebe;
  }
`;

const Summary = styled.div`
  position: relative;
  min-height: 71px;
  margin-top: 16px;
  padding: 12px 14px;
  border: 1px solid #908b8a;
  border-radius: 10px;
`;

const Badge = styled.span`
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 8px;
  background-color: #e3f0e6;
  color: #2f5e43;
  font-size: 12px;
  font-weight: 700;
`;

const SummaryTitle = styled.p`
  margin: 8px 0 0;
  color: #000000;
  font-size: 17px;
  font-weight: 600;
`;

const SummaryTime = styled.span`
  position: absolute;
  top: 36px;
  right: 14px;
  color: #2f3833;
  font-size: 10px;
  font-weight: 500;
`;

const Consent = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 63px;
  margin-top: 10px;
  padding: 0 14px;
  border: 1px solid #908b8a;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  cursor: pointer;
`;

const ConsentText = styled.span`
  flex: 1;
  color: #000000;
  font-size: 15px;
  font-weight: 600;
`;

const Chevron = styled.img`
  display: block;
  transform: rotate(-90deg);
`;

const Notice = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  background-color: #f7f4ef;
  color: #5e5a55;
  font-size: 13px;
  font-weight: 600;
  line-height: 19.5px;
`;

const InfoIcon = styled.span`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  margin-top: 2px;
`;

const InfoStem = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const Grow = styled.div`
  flex: 1;
  min-height: 24px;
`;

const NextButton = styled.button`
  width: 100%;
  height: 44px;
  margin-top: 16px;
  border: 0;
  border-radius: 10px;
  background-color: #e88b7a;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
`;
