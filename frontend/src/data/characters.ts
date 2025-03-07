// 캐릭터 타입 정의
export interface Character {
  id: number;
  name: string;
  description: string;
  imagePath: string;
  animationPath: string;
  category: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  stats: {
    intelligence: number;
    charm: number;
    luck: number;
    strength: number;
  };
}

// 캐릭터 더미 데이터
export const characters: Character[] = [
  {
    id: 1,
    name: "담배냥이",
    description: "모든 플레이어에게 주어지는 기본 고양이입니다. 담배나 뻑뻑피지 뭐 시팔",
    imagePath: "../../assets/characters/smoke_cat.png",
    animationPath: "../../assets/characters/smoke_cat.gif",
    category: "기본",
    rarity: "common",
    unlocked: true,
    stats: {
      intelligence: 2,
      charm: 10,
      luck: 10,
      strength: 10,
    },
  },
  {
    id: 2,
    name: "투자 고양이",
    description: "주식과 투자에 관심이 많은 고양이입니다. 차트를 분석하는 능력이 뛰어나요.",
    imagePath: "../../assets/finance_cat.png",
    animationPath: "../../assets/characters/smoke_cat.gif",
    category: "투자",
    rarity: "rare",
    unlocked: true,
    stats: {
      intelligence: 8,
      charm: 4,
      luck: 7,
      strength: 3,
    },
  },
  {
    id: 3,
    name: "금융 전문가 고양이",
    description: "금융 분야에서 오랜 경력을 가진 전문가 고양이입니다. 복잡한 금융 상품도 쉽게 이해해요.",
    imagePath: "../../assets/smoke_cat.png",
    animationPath: "../../assets/characters/smoke_cat.gif",
    category: "금융",
    rarity: "epic",
    unlocked: true,
    stats: {
      intelligence: 10,
      charm: 6,
      luck: 5,
      strength: 4,
    },
  },
  {
    id: 4,
    name: "정책 고양이",
    description: "금융 정책에 밝은 고양이입니다. 최신 금융 정책 트렌드를 항상 파악하고 있어요.",
    imagePath: "../../assets/policy_cat.png",
    animationPath: "../../assets/characters/smoke_cat.gif",
    category: "정책",
    rarity: "rare",
    unlocked: true,
    stats: {
      intelligence: 9,
      charm: 5,
      luck: 4,
      strength: 6,
    },
  },
  {
    id: 5,
    name: "범죄 수사 고양이",
    description: "금융 범죄를 수사하는 고양이입니다. 날카로운 눈빛으로 금융 사기를 잘 알아봐요.",
    imagePath: "../../assets/crime_cat.png",
    animationPath: "../../assets/characters/smoke_cat.gif",
    category: "범죄",
    rarity: "epic",
    unlocked: true,
    stats: {
      intelligence: 8,
      charm: 4,
      luck: 6,
      strength: 8,
    },
  },
  {
    id: 6,
    name: "상품 고양이",
    description: "다양한 금융 상품에 대해 잘 아는 고양이입니다. 최적의 금융 상품을 추천해줘요.",
    imagePath: "../../assets/product_cat.png",
    animationPath: "../../assets/characters/smoke_cat.gif",
    category: "상품",
    rarity: "rare",
    unlocked: true,
    stats: {
      intelligence: 7,
      charm: 8,
      luck: 6,
      strength: 4,
    },
  },
  {
    id: 7,
    name: "부자 고양이",
    description: "엄청난 부를 쌓은 고양이입니다. 황금빛 털과 다이아몬드 목걸이가 특징이에요.",
    imagePath: "../../assets/smoke_cat.png",
    animationPath: "../../assets/characters/smoke_cat.gif",
    category: "특별",
    rarity: "legendary",
    unlocked: false,
    stats: {
      intelligence: 7,
      charm: 10,
      luck: 10,
      strength: 5,
    },
  },
  {
    id: 8,
    name: "해커 고양이",
    description: "금융 시스템을 해킹하는 고양이입니다. 물론 좋은 목적으로만 사용한다고 하네요.",
    imagePath: "../../assets/smoke_cat.png",
    animationPath: "../../assets/characters/smoke_cat.gif",
    category: "특별",
    rarity: "epic",
    unlocked: false,
    stats: {
      intelligence: 10,
      charm: 3,
      luck: 7,
      strength: 6,
    },
  },
  {
    id: 9,
    name: "은행원 고양이",
    description: "은행에서 일하는 친절한 고양이입니다. 금융 서비스에 대한 지식이 풍부해요.",
    imagePath: "/assets/smoke_cat.png",
    animationPath: "/assets/characters/smoke_cat.gif",
    category: "금융",
    rarity: "common",
    unlocked: false,
    stats: {
      intelligence: 6,
      charm: 9,
      luck: 4,
      strength: 3,
    },
  },
  {
    id: 10,
    name: "보안 고양이",
    description: "금융 보안을 담당하는 고양이입니다. 어떤 위협도 막아내는 강인한 의지를 가졌어요.",
    imagePath: "/assets/smoke_cat.png",
    animationPath: "/assets/characters/smoke_cat.gif",
    category: "범죄",
    rarity: "rare",
    unlocked: false,
    stats: {
      intelligence: 7,
      charm: 5,
      luck: 5,
      strength: 9,
    },
  },
  {
    id: 11,
    name: "경제학자 고양이",
    description: "경제 이론에 정통한 학자 고양이입니다. 복잡한 경제 현상을 쉽게 설명해줘요.",
    imagePath: "/assets/smoke_cat.png",
    animationPath: "/assets/characters/smoke_cat.gif",
    category: "정책",
    rarity: "epic",
    unlocked: false,
    stats: {
      intelligence: 10,
      charm: 6,
      luck: 4,
      strength: 3,
    },
  },
  {
    id: 12,
    name: "마법사 고양이",
    description: "금융의 마법을 부리는 고양이입니다. 불가능해 보이는 투자도 성공시키는 마법 같은 능력이 있어요.",
    imagePath: "/assets/smoke_cat.png",
    animationPath: "/assets/characters/smoke_cat.gif",
    category: "특별",
    rarity: "legendary",
    unlocked: false,
    stats: {
      intelligence: 9,
      charm: 7,
      luck: 10,
      strength: 6,
    },
  },
];

// 캐릭터 ID로 캐릭터 정보 가져오기
export const getCharacterById = (id: number): Character | undefined => {
  return characters.find((character) => character.id === id);
};

// 카테고리별 캐릭터 가져오기
export const getCharactersByCategory = (category: string): Character[] => {
  return characters.filter((character) => character.category === category);
};

// 잠금 해제된 캐릭터만 가져오기
export const getUnlockedCharacters = (): Character[] => {
  return characters.filter((character) => character.unlocked);
};

// 희귀도별 캐릭터 가져오기
export const getCharactersByRarity = (rarity: Character["rarity"]): Character[] => {
  return characters.filter((character) => character.rarity === rarity);
};
