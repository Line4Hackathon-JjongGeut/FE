import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import backIcon from "../../../assets/icons/fosters/back.svg";
import { getPostingDetail, postFosterInquiry } from "../../../api/postings.js";
import { parseFosterPeriod, saveFosterPeriod } from "../../../utils/fosterPeriods.js";

const HOMES = ["아파트", "단독주택", "빌라", "기타"];
const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a, b) {
  return a && b && a.getTime() === b.getTime();
}

function formatDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}.${month}.${day}`;
}

function formatRange(start, end) {
  if (!start) return "";
  if (!end || sameDay(start, end)) return formatDate(start);
  const [from, to] = start <= end ? [start, end] : [end, start];
  return `${formatDate(from)}~${formatDate(to)}`;
}

function monthCells(cursor) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const lead = new Date(year, month, 1).getDay();
  const count = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= count; day += 1) cells.push(startOfDay(new Date(year, month, day)));
  return cells;
}

/* 임시보호 상세의 지원하기를 누르면 열리는 참여 문의입니다. */
export default function FosterApply() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [period, setPeriod] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [home, setHome] = useState("빌라");
  const [homeNote, setHomeNote] = useState("");
  const [experience, setExperience] = useState("없어요");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  /* 신청하는 공고의 제목과 시설명을 공고 상세에서 가져옵니다. */
  useEffect(() => {
    if (!/^\d+$/.test(String(postId ?? ""))) {
      setPost({});
      return undefined;
    }
    let ignore = false;
    getPostingDetail(postId)
      .then((result) => {
        if (ignore) return;
        const data = result?.isSuccess ? result.data : null;
        setPost(data ? {
          id: data.postingId,
          title: data.title ?? "",
          shelterId: data.shelter?.shelterId,
          shelterName: data.shelter?.name ?? "",
        } : {});
      })
      .catch(() => {
        if (!ignore) setPost({});
      });
    return () => {
      ignore = true;
    };
  }, [postId]);

  /* 지원 완료하기. 입력한 내용을 해당 공고의 시설에 보냅니다. */
  async function finish() {
    if (submitting || post?.id == null) return;
    const homeText = home === "기타" ? homeNote.trim() || "기타" : home;
    const note = [
      name.trim() && `이름: ${name.trim()}`,
      period.trim() && `임시보호 가능 기간: ${period.trim()}`,
      `거주 환경: ${homeText}`,
      `반려동물 양육 경험: ${experience}`,
      message.trim(),
    ].filter(Boolean).join("\n").slice(0, 500);

    setSubmitting(true);
    setSubmitError("");
    try {
      const result = await postFosterInquiry(post.id, {
        message: note,
        contactPhone: phone.trim(),
      });
      const range = parseFosterPeriod(period);
      if (range) {
        saveFosterPeriod({
          id: result?.data?.inquiryId ?? `${post.id}-${range.start}`,
          postingId: post.id,
          title: post.title,
          shelterId: post.shelterId,
          shelterName: post.shelterName,
          start: range.start,
          end: range.end,
        });
      }
      navigate(`/fosters/${post.id}/complete`);
    } catch (error) {
      setSubmitError(error.message || "참여 의사를 전달하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  /* 첫 클릭은 시작일, 다음 클릭은 종료일입니다. 저장하면 칸에 기간이 들어갑니다. */
  function pickDay(day) {
    if (!rangeStart || rangeEnd) {
      setRangeStart(day);
      setRangeEnd(null);
      return;
    }
    if (day < rangeStart) {
      setRangeEnd(rangeStart);
      setRangeStart(day);
      return;
    }
    setRangeEnd(day);
  }

  function savePeriod() {
    if (!rangeStart) return;
    setPeriod(formatRange(rangeStart, rangeEnd));
    setCalendarOpen(false);
  }

  const days = monthCells(cursor);

  return (
    <Screen>
      <Header>
        {/* 아래를 가리키는 꺾쇠를 돌려, 뒤로 가기로 씁니다. */}
        <BackButton type="button" aria-label="뒤로 가기" onClick={() => navigate(-1)}>
          <BackIcon src={backIcon} alt="" />
        </BackButton>
        <HeaderTitle>임시보호 신청</HeaderTitle>
      </Header>

      <PostTitle>{post?.title ?? ""}</PostTitle>
      <ShelterLink
        type="button"
        onClick={() => post?.shelterId && navigate(`/shelters/${post.shelterId}`)}
      >
        <ShelterName>{post?.shelterName ?? ""}</ShelterName>
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
          <PeriodButton
            type="button"
            $empty={!period}
            onClick={() => setCalendarOpen((open) => !open)}
          >
            {period || "기간을 선택해 주세요."}
          </PeriodButton>
          {calendarOpen && (
            <Calendar>
              <CalendarHead>
                <MonthButton
                  type="button"
                  aria-label="이전 달"
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
                >
                  ‹
                </MonthButton>
                <MonthLabel>{cursor.getFullYear()}년 {cursor.getMonth() + 1}월</MonthLabel>
                <MonthButton
                  type="button"
                  aria-label="다음 달"
                  onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
                >
                  ›
                </MonthButton>
              </CalendarHead>
              <WeekRow>
                {WEEKDAYS.map((day) => <WeekName key={day}>{day}</WeekName>)}
              </WeekRow>
              <DayGrid>
                {days.map((day, index) => {
                  if (!day) return <DayCell key={`empty-${index}`} />;
                  const selected = sameDay(day, rangeStart) || sameDay(day, rangeEnd);
                  const inRange = rangeStart && rangeEnd && day > rangeStart && day < rangeEnd;
                  return (
                    <DayCell key={day.getTime()}>
                      <DayButton
                        type="button"
                        $selected={selected}
                        $inRange={inRange}
                        onClick={() => pickDay(day)}
                      >
                        {day.getDate()}
                      </DayButton>
                    </DayCell>
                  );
                })}
              </DayGrid>
              <SavePeriod type="button" disabled={!rangeStart} onClick={savePeriod}>
                저장
              </SavePeriod>
            </Calendar>
          )}
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
      <SubmitButton type="button" disabled={submitting || post?.id == null} onClick={finish}>
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

const PeriodButton = styled.button`
  height: 43px;
  margin-top: 8px;
  padding: 0 12px;
  border: 1.5px solid #d9d9d9;
  border-radius: 10px;
  background-color: transparent;
  color: ${({ $empty }) => ($empty ? "#909090" : "#2f3833")};
  font-size: 13px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
`;

const Calendar = styled.div`
  margin-top: 8px;
  padding: 12px;
  border: 1.5px solid #d9d9d9;
  border-radius: 10px;
`;

const CalendarHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MonthButton = styled.button`
  width: 32px;
  height: 32px;
  border: 0;
  background: transparent;
  color: #2f3833;
  font-size: 22px;
  cursor: pointer;
`;

const MonthLabel = styled.p`
  margin: 0;
  color: #2f3833;
  font-size: 15px;
  font-weight: 700;
`;

const WeekRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-top: 8px;
`;

const WeekName = styled.span`
  color: #908b8a;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
`;

const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px 0;
  margin-top: 6px;
`;

const DayCell = styled.div`
  display: flex;
  justify-content: center;
  min-height: 34px;
`;

const DayButton = styled.button`
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background-color: ${({ $selected, $inRange }) => ($selected ? "#e88b7a" : $inRange ? "#f7e6e1" : "transparent")};
  color: ${({ $selected }) => ($selected ? "#ffffff" : "#2f3833")};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`;

const SavePeriod = styled.button`
  width: 100%;
  height: 36px;
  margin-top: 10px;
  border: 0;
  border-radius: 8px;
  background-color: #e88b7a;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    background-color: #f4d5ce;
    cursor: default;
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
