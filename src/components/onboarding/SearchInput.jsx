import styled from "styled-components";
import searchIcon from "../../assets/icons/onboarding/icon-search.svg";
import clearIcon from "../../assets/icons/onboarding/icon-clear.svg";

/* 돋보기 아이콘 있는 검색창 */
export default function SearchInput({ value, onChange, onClear, placeholder }) {
  return (
    <Box>
            <SearchIcon src={searchIcon} alt="" />
      <Input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {value && (
        <ClearButton type="button" aria-label="검색어 지우기" onClick={onClear}>
          <img src={clearIcon} alt="" />
        </ClearButton>
      )}
    </Box>
  );
}

const Box = styled.label`
  display: flex;
  gap: 9px;
  align-items: center;
  height: 52px;
  padding: 0 15px 0 14px;
  border: 1px solid #e88b7a;
  border-radius: 10px;
`;

const SearchIcon = styled.img`
  flex-shrink: 0;
  width: 21px;
  height: 21px;
`;

const Input = styled.input`
  flex: 1;
  min-width: 0;
  border: 0;
  background: transparent;
  color: #111111;
  font-size: 17px;
  font-weight: 600;
  outline: none;

  &::placeholder {
    color: #696969;
  }

  &::-webkit-search-cancel-button {
    display: none;
  }
`;

const ClearButton = styled.button`
  display: flex;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
`;
