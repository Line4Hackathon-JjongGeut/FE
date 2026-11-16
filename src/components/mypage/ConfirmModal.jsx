import styled from "styled-components";
import closeIcon from "../../assets/icons/activities/close.svg";
import dogImage from "../../assets/images/auth/complete-dog.svg";

/* 화면 가운데 뜨는 확인 창 */
export default function ConfirmModal({ title, description, confirmLabel = "네", cancelLabel = "아니요", onConfirm, onCancel }) {
  return (
    <Overlay onClick={onCancel}>
      <Box role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title" onClick={(event) => event.stopPropagation()}>
        <CloseButton type="button" aria-label="닫기" onClick={onCancel}>
          <img src={closeIcon} alt="" />
        </CloseButton>
        <Dog src={dogImage} alt="" />
        <Title id="confirm-modal-title">{title}</Title>
        <Description>{description}</Description>
        <Actions>
          <ConfirmButton type="button" onClick={onConfirm}>
            {confirmLabel}
          </ConfirmButton>
          <CancelButton type="button" onClick={onCancel}>
            {cancelLabel}
          </CancelButton>
        </Actions>
      </Box>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(42, 42, 42, 0.5);
`;

const Box = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: calc(100% - 60px);
  max-width: 330px;
  padding: 31px 18px 23px;
  border-radius: 11px;
  background-color: #ffffff;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 13px;
  right: 8px;
  display: flex;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
`;

const Dog = styled.img`
  width: 58px;
`;

const Title = styled.h2`
  margin-top: 8px;
  color: #2f3833;
  font-size: 21px;
  font-weight: 700;
`;

const Description = styled.p`
  margin-top: 13px;
  color: #616161;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  white-space: pre-line;
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 11px;
  width: 100%;
  margin-top: 23px;
`;

const ConfirmButton = styled.button`
  height: 42px;
  border: 0;
  border-radius: 11px;
  background-color: #e3e0df;
  color: #2f3833;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

const CancelButton = styled(ConfirmButton)`
  background-color: #e88b7a;
  color: #ffffff;
`;