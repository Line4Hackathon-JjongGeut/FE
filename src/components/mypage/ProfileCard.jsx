import styled from "styled-components";
import chevronIcon from "../../assets/icons/search/chevron.svg";

/* 마이페이지 맨 위 프로필 카드 */
export default function ProfileCard({ name, type, onEdit }) {
  return (
    <Card>
      <Avatar aria-hidden />
      <Text>
        <Name>{name} 님</Name>
        <Type>{type}</Type>
      </Text>
      <EditButton type="button" onClick={onEdit}>
        프로필 수정
        <Chevron src={chevronIcon} alt="" />
      </EditButton>
    </Card>
  );
}

const Card = styled.div`
  position: relative;
  display: flex;
  gap: 15px;
  align-items: center;
  height: 105px;
  padding: 0 16px;
  border-radius: 10px;
  background-color: #deebde;
`;

const Avatar = styled.span`
  flex-shrink: 0;
  width: 65px;
  height: 65px;
  border: 4px solid #ffffff;
  border-radius: 50%;
  background-color: #e5ede3;
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Name = styled.p`
  color: #000000;
  font-size: 22px;
  font-weight: 700;
`;

const Type = styled.p`
  color: #858585;
  font-size: 14px;
  font-weight: 600;
`;

const EditButton = styled.button`
  position: absolute;
  top: 17px;
  right: 17px;
  display: flex;
  gap: 6px;
  align-items: center;
  height: 26px;
  padding: 0 11px 0 13px;
  border: 0;
  border-radius: 21px;
  background-color: #fefefe;
  color: #525252;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`;

const Chevron = styled.img`
  width: 8px;
  height: 4px;
  transform: rotate(-90deg);
`;