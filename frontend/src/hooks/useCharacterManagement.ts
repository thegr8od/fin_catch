import { useState, useEffect, useCallback } from "react";
import { useUserInfo } from "./useUserInfo";
import { useChangeCat } from "./useChangeCat";
import { CharacterType } from "../components/game/constants/animations";

interface Character {
  catId: number;
  catName: CharacterType;
  description: string;
  grade: string;
}

const convertCatToCharacter = (cat: any): Character => {
  return {
    catId: cat.catId,
    catName: cat.catName as CharacterType,
    description: cat.description,
    grade: cat.grade || "DEFAULT",
  };
};

export const useCharacterManagement = () => {
  const { user, fetchUserInfo } = useUserInfo();
  const { changeCat } = useChangeCat();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [currentAnimationState, setCurrentAnimationState] = useState<"idle" | "attack" | "damage" | "dead" | "victory">("attack");
  const [isCharacterLoading, setIsCharacterLoading] = useState(false);
  const [resourcesLoaded, setResourcesLoaded] = useState<Record<string, boolean>>({});

  // 캐릭터 초기화
  useEffect(() => {
    const initializeCharacters = async () => {
      if (user?.cats) {
        const convertedCats = user.cats.map(convertCatToCharacter);
        setCharacters(convertedCats);

        const mainCatName = user.mainCat as unknown as CharacterType;
        const mainCharacter = convertedCats.find((cat) => cat.catName === mainCatName);
        if (mainCharacter) {
          setSelectedCharacter(mainCharacter);
          setCurrentAnimationState("idle");
        } else if (convertedCats.length > 0) {
          setSelectedCharacter(convertedCats[0]);
        }
      }
    };

    initializeCharacters();
  }, [user]);

  // 리소스 프리로딩
  useEffect(() => {
    const loadResources = async () => {
      setIsCharacterLoading(true);
      const states = ["idle", "attack", "damage", "dead", "victory"];
      const loadedResources: Record<string, boolean> = {};

      try {
        await Promise.all(
          characters.flatMap((character) =>
            states.map((state) => {
              const path = `/cats_assets/${character.catName}/${character.catName}_cat_${state}.png`;
              return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                  loadedResources[`${character.catName}_${state}`] = true;
                  resolve(true);
                };
                img.onerror = () => {
                  loadedResources[`${character.catName}_${state}`] = false;
                  resolve(false);
                };
                img.src = path;
              });
            })
          )
        );
      } catch (error) {
        console.error("리소스 로딩 실패:", error);
      }

      setResourcesLoaded(loadedResources);
      setIsCharacterLoading(false);
    };

    if (characters.length > 0) {
      loadResources();
    }
  }, [characters]);

  const handleCharacterSelect = useCallback(
    (character: Character) => {
      if (selectedCharacter?.catId === character.catId) return;
      setSelectedCharacter(character);
      setCurrentAnimationState("idle");
    },
    [selectedCharacter?.catId]
  );

  const changeMyCat = async () => {
    if (!selectedCharacter) {
      console.log("선택된 캐릭터가 없습니다.");
      return;
    }

    try {
      const response = await changeCat(selectedCharacter.catId);
      if (response.success) {
        await fetchUserInfo();
      }
    } catch (error) {
      console.error("대표 캐릭터 변경 실패:", error);
    }
  };

  return {
    characters,
    selectedCharacter,
    currentAnimationState,
    isCharacterLoading,
    resourcesLoaded,
    handleCharacterSelect,
    setCurrentAnimationState,
    changeMyCat,
  };
};
