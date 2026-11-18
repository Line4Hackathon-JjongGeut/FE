/* 관심 동물 */
const ANIMAL_TO_API = {
  dog: ["DOG"],
  cat: ["CAT"],
  any: ["DOG", "CAT"],
};

const DAY_TO_API = { 월: "MON", 화: "TUE", 수: "WED", 목: "THU", 금: "FRI", 토: "SAT", 일: "SUN" };

const TIME_SLOT_TO_API = {
  morning: "MORNING",
  afternoon: "AFTERNOON",
  evening: "EVENING",
  allday: "ALL_DAY",
};

const FREQUENCY_TO_API = {
  monthly: "MONTHLY_1",
  biweekly: "MONTHLY_2_3",
  weekly: "WEEKLY",
};

const EXPERIENCE_LEVEL_TO_API = {
  none: "FIRST",
  few: "ONE_TO_THREE",
  many: "FOUR_PLUS",
};

/* 활동 유형 */
const CATEGORY_TO_API = {
  "산책 봉사": "WALK",
  "견사 청소": "CLEANING",
  "목욕, 미용": "GROOMING",
  "사진 촬영": "PHOTO",
  "급식, 돌봄": "FEEDING_CARE",
  기타: "ETC",
};


function invert(map) {
  return Object.fromEntries(Object.entries(map).map(([key, value]) => [value, key]));
}

const DAY_FROM_API = invert(DAY_TO_API);
const TIME_SLOT_FROM_API = invert(TIME_SLOT_TO_API);
const FREQUENCY_FROM_API = invert(FREQUENCY_TO_API);
const EXPERIENCE_LEVEL_FROM_API = invert(EXPERIENCE_LEVEL_TO_API);
const CATEGORY_FROM_API = invert(CATEGORY_TO_API);

function mapList(list, map) {
  return (list ?? []).map((item) => map[item]).filter(Boolean);
}

export function toRegionRequest(region) {
  if (!region) return undefined;
  const [firstWord, secondWord] = region.road.split(" ");
  const request = {
    sido: region.sido ?? firstWord,
    sigungu: region.sigungu ?? secondWord,
  };
  if (region.latitude != null && region.longitude != null) {
    request.latitude = region.latitude;
    request.longitude = region.longitude;
  }
  return request;
}

export function fromRegionResponse(region) {
  if (!region?.sido || !region?.sigungu) return null;
  const area = `${region.sido} ${region.sigungu}`;
  return {
    id: `saved-${area}`,
    road: area,
    jibun: area,
    sido: region.sido,
    sigungu: region.sigungu,
    latitude: region.latitude ?? null,
    longitude: region.longitude ?? null,
  };
}

export function toProfileRequest(preferences) {
  const request = {
    interestAnimals: ANIMAL_TO_API[preferences.animal] ?? [],
    availableDays: mapList(preferences.days, DAY_TO_API),
    availableTimeSlots: mapList(preferences.timeSlots, TIME_SLOT_TO_API),
    interestCategories: mapList(preferences.activityTypes, CATEGORY_TO_API),
  };
  const region = toRegionRequest(preferences.region);
  if (region) request.region = region;
  if (preferences.frequency) request.activityFrequency = FREQUENCY_TO_API[preferences.frequency];
  if (preferences.experienceLevel) request.experienceLevel = EXPERIENCE_LEVEL_TO_API[preferences.experienceLevel];
  return request;
}

export function fromProfileResponse(profile) {
  const animals = profile?.interestAnimals ?? [];
  let animal = null;
  if (animals.includes("DOG") && animals.includes("CAT")) animal = "any";
  else if (animals.includes("DOG")) animal = "dog";
  else if (animals.includes("CAT")) animal = "cat";

  return {
    animal,
    region: fromRegionResponse(profile?.region),
    days: mapList(profile?.availableDays, DAY_FROM_API),
    timeSlots: mapList(profile?.availableTimeSlots, TIME_SLOT_FROM_API),
    frequency: FREQUENCY_FROM_API[profile?.activityFrequency] ?? null,
    activityTypes: mapList(profile?.interestCategories, CATEGORY_FROM_API),
    experienceLevel: EXPERIENCE_LEVEL_FROM_API[profile?.experienceLevel] ?? null,
    experience: null,
  };
}

export function toExperienceRequest(experience) {
  const request = {
    content: experience.content ?? "",
    activityCategories: mapList(experience.activityTypes, CATEGORY_TO_API),
  };
  if (experience.organization) request.organizationName = experience.organization;
  return request;
}