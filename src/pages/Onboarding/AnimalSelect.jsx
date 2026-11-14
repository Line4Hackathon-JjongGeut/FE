import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import OnboardingStep from "../../components/onboarding/OnboardingStep.jsx";
import AnimalCard from "../../components/onboarding/AnimalCard.jsx";
import {
  getPreferences,
  updatePreferences,
} from "../../dummyData/onboarding/preferences.js";
import dogImage from "../../assets/images/onboarding/animal-dog.svg";
import catImage from "../../assets/images/onboarding/animal-cat.svg";
import bothImage from "../../assets/images/onboarding/animal-both.png";

const ANIMALS = [
  { id: "dog", label: "강아지", image: dogImage, imageWidth: 49 },
  { id: "cat", label: "고양이", image: catImage, imageWidth: 47 },
  {
    id: "any",
    label: "둘 다 상관없어요",
    image: bothImage,
    imageWidth: 66,
    imageOffsetX: -4,
  },
];

/* 관심 동물 선택 화면 */
export default function AnimalSelect() {
  const navigate = useNavigate();
  // 이전 단계에서 돌아왔을 때 골라 둔 값이 유지되도록 저장소 값으로 시작
  const [animal, setAnimal] = useState(() => getPreferences().animal);

  function handleNext() {
    updatePreferences({ animal });
    navigate("/onboarding/region");
  }

  return (
    <OnboardingStep
      step={1}
      title="어떤 동물과 함께하고 싶나요?"
      description="관심 있는 동물을 선택해 주세요."
      onNext={handleNext}
      nextDisabled={!animal}
    >
      <Options role="radiogroup" aria-label="관심 동물">
        {ANIMALS.map((item) => (
          <AnimalCard
            key={item.id}
            image={item.image}
            imageWidth={item.imageWidth}
            imageOffsetX={item.imageOffsetX}
            label={item.label}
            selected={animal === item.id}
            onClick={() => setAnimal(item.id)}
          />
        ))}
      </Options>
    </OnboardingStep>
  );
}

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
