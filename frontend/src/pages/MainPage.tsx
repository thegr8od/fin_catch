import React, { useState, useEffect, useMemo, useCallback } from "react";
import Background from "../components/layout/Background";
import myPageBg from "../assets/mypage_bg.png";
// import catProfile from "../assets/characters/smoke_cat.png";
import { useUserInfo } from "../hooks/useUserInfo";
import LoadingScreen from "../components/common/LoadingScreen";
import { useNavigate } from "react-router-dom";
import { AccountInfo } from "../components/mypage/AccountLinkModal";
import { CharacterType } from "../components/game/constants/animations";
// 컴포넌트 임포트
// import ProfileSection from "../components/mypage/ProfileSection";
// import CharacterDisplaySection from "../components/mypage/CharacterDisplaySection";
import AccountLinkModal from "../components/mypage/AccountLinkModal";
// import AccountAnalysisModal from "../components/mypage/AccountAnalysisModal";
import NicknameChangeModal from "../components/mypage/NicknameChangeModal";
import CharacterAnimation from "../components/game/CharacterAnimation";
import axiosInstance from "../api/axios";

// 캐릭터 타입 정의
interface Character {
  catId: number;
  catName: CharacterType;
  description: string;
  grade: string;
}

// API 응답의 Cat 타입을 Character 타입으로 변환하는 함수
const convertCatToCharacter = (cat: any): Character => {
  return {
    catId: cat.catId,
    catName: cat.catName as CharacterType,
    description: cat.description,
    grade: cat.grade || "DEFAULT",
  };
};

// 캐릭터 정보 모달 컴포넌트
const CharacterInfoModal = ({ character, onClose }: { character: Character | null; onClose: () => void }) => {
  if (!character) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-korean-pixel">{character.catName}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-6">
            <div className="space-y-4">
              <div className="bg-white/50 rounded-lg p-4">
                <h5 className="font-korean-pixel text-lg font-bold text-amber-900 mb-2">캐릭터 설명</h5>
                <p className="font-korean-pixel text-amber-800">{character.description}</p>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <h5 className="font-korean-pixel text-lg font-bold text-amber-900 mb-2">등급</h5>
                <p className="font-korean-pixel text-amber-800">{character.grade}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MainPage = () => {
  const { user, loading, fetchUserInfo } = useUserInfo();
  const navigate = useNavigate();
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [showAccountLinkModal, setShowAccountLinkModal] = useState(false);
  const [showCharacterInfoModal, setShowCharacterInfoModal] = useState(false);
  const [featureMessage, setFeatureMessage] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [currentAnimationState, setCurrentAnimationState] = useState<"idle" | "attack" | "damage" | "dead" | "victory">("attack");
  const [characterPage, setCharacterPage] = useState(0);
  const charactersPerPage = 4;
  const [isCharacterLoading, setIsCharacterLoading] = useState(false);
  const [resourcesLoaded, setResourcesLoaded] = useState<Record<string, boolean>>({});
  const [characters, setCharacters] = useState<Character[]>([]);

  // 사용자 정보 로깅 및 캐릭터 초기화
  useEffect(() => {
    const initializeCharacters = async () => {
      console.log("현재 사용자 정보:", user);
      if (user?.cats) {
        console.log("사용자가 보유한 캐릭터 목록:", user.cats);
        const convertedCats = user.cats.map(convertCatToCharacter);
        await setCharacters(convertedCats);

        // 대표 캐릭터를 찾아서 선택
        const mainCatName = user.mainCat as unknown as CharacterType;
        const mainCharacter = convertedCats.find((cat) => cat.catName === mainCatName);
        if (mainCharacter) {
          console.log("대표 캐릭터 찾음:", mainCharacter);
          setSelectedCharacter(mainCharacter);
          setCurrentAnimationState("idle");
        } else if (convertedCats.length > 0) {
          console.log("대표 캐릭터 없음, 첫 번째 캐릭터 선택:", convertedCats[0]);
          setSelectedCharacter(convertedCats[0]);
        }
      }
    };

    initializeCharacters();
  }, [user]);

  // 캐릭터 리소스 프리로딩
  useEffect(() => {
    const loadResources = async () => {
      setIsCharacterLoading(true);
      const states = ["idle", "attack", "damage", "dead", "victory"];
      const loadedResources: Record<string, boolean> = {};

      // [수정 필요] Promise.all을 사용하여 병렬로 로딩하도록 변경
      // for (const character of characters) {
      //   for (const state of states) {
      //     const path = `/cats_assets/${character.catName}/${character.catName}_cat_${state}.png`;
      //     try {
      //       await new Promise((resolve, reject) => {
      //         const img = new Image();
      //         img.onload = resolve;
      //         img.onerror = reject;
      //         img.src = path;
      //       });
      //       loadedResources[`${character.catName}_${state}`] = true;
      //     } catch (error) {
      //       console.error(`리소스 로딩 실패: ${path}`, error);
      //       loadedResources[`${character.catName}_${state}`] = false;
      //     }
      //   }
      // }

      try {
        // [새로운 코드] 모든 리소스를 병렬로 로딩
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
      // [추가] 캐릭터가 있을 때만 로딩 시작
      loadResources();
    }
  }, [characters]);

  // 애니메이션 상태 배열 정의
  const animationStates: (typeof currentAnimationState)[] = ["attack", "damage", "victory"];

  // 애니메이션 상태 변경 핸들러
  const handlePrevAnimation = () => {
    setCurrentAnimationState((prev) => {
      const currentIndex = animationStates.indexOf(prev);
      return animationStates[currentIndex === 0 ? animationStates.length - 1 : currentIndex - 1];
    });
  };

  const handleNextAnimation = () => {
    setCurrentAnimationState((prev) => {
      const currentIndex = animationStates.indexOf(prev);
      return animationStates[currentIndex === animationStates.length - 1 ? 0 : currentIndex + 1];
    });
  };

  const changeMyCat = async () => {
    if (!selectedCharacter) {
      console.log("선택된 캐릭터가 없습니다.");
      return;
    }

    try {
      console.log("대표 캐릭터 변경 시도:", selectedCharacter);
      const response = await axiosInstance.patch(`/api/member/maincat?catId=${selectedCharacter.catId}`);

      if (response.status === 200) {
        console.log("대표 캐릭터 변경 성공:", response.data);
        await fetchUserInfo(); // 사용자 정보 갱신
      }
    } catch (error) {
      console.error("대표 캐릭터 변경 실패:", error);
    }
  };

  // 캐릭터 페이지네이션 계산
  const totalPages = Math.ceil(characters.length / charactersPerPage);
  const currentCharacters = useMemo(() => {
    console.log("현재 캐릭터 목록 계산:", {
      characters: characters,
      page: characterPage,
      start: characterPage * charactersPerPage,
      end: (characterPage + 1) * charactersPerPage,
    });
    return characters.slice(characterPage * charactersPerPage, (characterPage + 1) * charactersPerPage);
  }, [characters, characterPage, charactersPerPage]);

  // 캐릭터 페이지네이션 변경 시 로깅
  useEffect(() => {
    console.log("현재 페이지의 캐릭터 목록:", currentCharacters);
    console.log("전체 캐릭터 목록:", characters);
  }, [currentCharacters]);

  // 캐릭터 변경 핸들러 최적화
  const handleCharacterSelect = useCallback(
    (character: Character) => {
      console.log("선택된 캐릭터 정보:", character);
      if (selectedCharacter?.catId === character.catId) return;
      setSelectedCharacter(character);
      setCurrentAnimationState("idle");
    },
    [selectedCharacter?.catId]
  );

  // 캐릭터 컴포넌트 메모이제이션 최적화 (애니메이션용)
  const AnimatedCharacterDisplay = React.memo(
    ({ character, state, scale = 2 }: { character: Character; state: typeof currentAnimationState; scale?: number }) => {
      // [추가] 리소스 로딩 상태 확인
      const isResourceLoaded = resourcesLoaded[`${character.catName}_${state}`];

      // [추가] 로딩 중일 때 표시할 컴포넌트
      if (!isResourceLoaded) {
        return (
          <div className="flex items-center justify-center w-full h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        );
      }

      return (
        <div
          style={{
            position: "relative",
            width: "150px",
            height: "60px",
            transform: `scale(${scale})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
            // className="mb-2"
          >
            <CharacterAnimation
              // key={`${character.catName}_${state}`}
              key={character.catName}
              state={state}
              direction={true}
              scale={2}
              className="w-full h-full"
              characterType={character.catName}
              isPlaying={true}
              loop={true}
              size={"small"}
            />
          </div>
        </div>
      );
    },
    (prevProps, nextProps) => prevProps.character.catName === nextProps.character.catName && prevProps.state === nextProps.state && prevProps.scale === nextProps.scale
  );

  // 캐릭터 목록 컴포넌트 수정
  const CharacterList = React.memo(
    ({ characters }: { characters: Character[] }) => {
      // 대표 캐릭터를 최상단으로 정렬
      const sortedCharacters = [...characters].sort((a, b) => {
        const mainCatName = user?.mainCat as unknown as CharacterType;
        if (a.catName === mainCatName) return -1;
        if (b.catName === mainCatName) return 1;
        return 0;
      });

      return (
        <div className="grid grid-cols-4 gap-4 overflow-y-auto max-h-[320px] pr-2 hover:overflow-auto">
          {sortedCharacters.map((character) => (
            <div
              key={character.catId}
              onClick={() => handleCharacterSelect(character)}
              className={`p-2 rounded-xl cursor-pointer transition-all duration-300 ${
                selectedCharacter?.catId === character.catId ? "bg-blue-100 border-2 border-blue-500" : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 flex items-center justify-center relative overflow-hidden">
                  <img
                    src={`/cats_assets/${character.catName}/${character.catName}_cat_static.png`}
                    alt={character.catName}
                    className="object-contain max-w-full max-h-full"
                    style={{ imageRendering: "pixelated", position: "relative", zIndex: 10 }}
                  />
                </div>
                <div className="flex flex-col items-center gap-1 mt-1 w-full">
                  <span className="font-korean-pixel text-xs text-center truncate w-full">{character.catName}</span>
                  <div className="flex flex-wrap gap-1 justify-center">
                    <span
                      className={`font-korean-pixel text-[10px] px-1 py-0.5 rounded-full ${
                        character.grade === "RARE"
                          ? "bg-blue-100 text-blue-800"
                          : character.grade === "EPIC"
                          ? "bg-purple-100 text-purple-800"
                          : character.grade === "LEGENDARY"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {character.grade}
                    </span>
                    {character.catName === (user?.mainCat as unknown as CharacterType) && (
                      <span className="font-korean-pixel text-[10px] px-1 py-0.5 rounded-full bg-green-100 text-green-800">주인공</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    },
    (prevProps, nextProps) => prevProps.characters.length === nextProps.characters.length && prevProps.characters.every((char, idx) => char.catId === nextProps.characters[idx].catId)
  );

  // 페이지네이션 버튼 핸들러
  const handlePrevPage = useCallback(() => {
    setCharacterPage((prev) => {
      const newPage = Math.max(0, prev - 1);
      console.log("이전 페이지로 이동:", newPage);
      return newPage;
    });
  }, []);

  const handleNextPage = useCallback(() => {
    setCharacterPage((prev) => {
      const newPage = Math.min(totalPages - 1, prev + 1);
      console.log("다음 페이지로 이동:", newPage);
      return newPage;
    });
  }, [totalPages]);

  // 캐릭터 목록 섹션 렌더링
  const renderCharacterList = useMemo(
    () => (
      <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.02] transition-transform duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">🎨 보유 캐릭터</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={characterPage === 0}
              className={`px-3 py-1 rounded-lg font-korean-pixel ${
                characterPage === 0 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
              } transition-colors`}
            >
              ◀
            </button>
            <span className="font-korean-pixel px-2">
              {characterPage + 1} / {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={characterPage === totalPages - 1}
              className={`px-3 py-1 rounded-lg font-korean-pixel ${
                characterPage === totalPages - 1 ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
              } transition-colors`}
            >
              ▶
            </button>
          </div>
        </div>
        <CharacterList characters={currentCharacters} />
      </div>
    ),
    [characterPage, totalPages, currentCharacters, handlePrevPage, handleNextPage]
  );

  useEffect(() => {
    // 로컬 스토리지에서 계좌 연동 여부 확인
    const hasShownAccountModal = localStorage.getItem("hasShownAccountModal");
    if (!hasShownAccountModal && user) {
      setShowAccountLinkModal(true);
      localStorage.setItem("hasShownAccountModal", "true");
    }
  }, [user]);

  // 계좌 연동 처리
  const handleAccountLink = (accountInfo: AccountInfo) => {
    console.log("계좌 연동 완료:", accountInfo);
    setShowAccountLinkModal(false);
  };

  // 미구현 기능 접근 시 모달 표시 함수
  // const handleFeatureClick = (message: string) => {
  //   setFeatureMessage(message);
  //   setShowFeatureModal(true);
  // };

  // 닉네임 변경 처리
  const handleUpdateNickname = async (newNickname: string) => {
    console.log("닉네임 변경 시작:", newNickname);
    try {
      await fetchUserInfo();
      console.log("사용자 정보 갱신 완료");
      setShowNicknameModal(false);
    } catch (error) {
      console.error("닉네임 변경 후 사용자 정보 갱신 실패:", error);
    }
  };

  const handleLobbyClick = () => {
    navigate("/lobby");
  };

  // 페이지 포커스 시 사용자 정보 갱신
  useEffect(() => {
    const handleFocus = () => {
      console.log("페이지 포커스 감지: 사용자 정보 갱신");
      fetchUserInfo();
    };

    window.addEventListener("focus", handleFocus);

    // 컴포넌트가 처음 마운트될 때도 정보 갱신
    handleFocus();

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchUserInfo]);

  if (loading || !user) {
    return <LoadingScreen />;
  }

  const profileData = {
    nickname: user.nickname,
    level: Math.floor(user.exp / 1000) + 1,
    exp: user.exp,
    maxExp: 1000,
    coins: user.point,
    cats: user.cats,
    mainCat: user.mainCat,
  };

  console.log("프로필 데이터:", profileData);

  // 캐릭터 디스플레이 섹션 수정
  const renderCharacterDisplay = () => (
    <div className="bg-white/95 rounded-2xl shadow-2xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">🎭 나의 캐릭터</h3>
          {selectedCharacter && (
            <button onClick={() => setShowCharacterInfoModal(true)} className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-korean-pixel transition-colors">
              ℹ️ 정보
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-xl p-6 mb-6 relative min-h-[300px]">
        <div className="relative w-[192px] h-[96px] mb-6" style={{ zIndex: 5 }}>
          {isCharacterLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : selectedCharacter ? (
            <div className="flex items-center justify-center">
              <AnimatedCharacterDisplay character={selectedCharacter} state={currentAnimationState} scale={1} />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <p className="text-gray-500 font-korean-pixel">선택된 캐릭터가 없습니다</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4 z-50">
          <button
            onClick={() => setCurrentAnimationState("attack")}
            className={`px-3 py-2 rounded-lg font-korean-pixel transition-colors ${currentAnimationState === "attack" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
          >
            공격
          </button>
          <button
            onClick={() => setCurrentAnimationState("damage")}
            className={`px-3 py-2 rounded-lg font-korean-pixel transition-colors ${currentAnimationState === "damage" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
          >
            피격
          </button>
          <button
            onClick={() => setCurrentAnimationState("victory")}
            className={`px-3 py-2 rounded-lg font-korean-pixel transition-colors ${currentAnimationState === "victory" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-700"}`}
          >
            승리
          </button>
        </div>

        {selectedCharacter && (
          <div className="mt-4 z-50">
            {selectedCharacter.catName === (user?.mainCat as unknown as CharacterType) ? (
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-korean-pixel">현재 주인공 고양이입니다</div>
            ) : (
              <button onClick={changeMyCat} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-korean-pixel hover:opacity-90 transition-all duration-300">
                대표 캐릭터로 설정
              </button>
            )}
          </div>
        )}
      </div>

      <CharacterList characters={characters} />
    </div>
  );

  return (
    <Background backgroundImage={myPageBg}>
      <div className="w-full h-screen overflow-y-auto">
        <div className="w-full py-8 px-4">
          <div className="max-w-[1800px] mx-auto pb-24">
            {/* 상단 프로필 섹션 */}
            <div className="bg-white/95 rounded-2xl shadow-2xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <img
                    src={`/cats_assets/${user.mainCat}/${user.mainCat}_cat_static.png`}
                    alt="프로필"
                    className="w-24 h-24 rounded-full border-4 border-yellow-400"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold font-korean-pixel">{user.nickname}님, 환영합니다!</h2>
                      <button onClick={() => setShowNicknameModal(true)} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-korean-pixel text-gray-600 transition-colors">
                        ✏️ 닉네임 변경
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-korean-pixel">Lv. {profileData.level}</span>
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-korean-pixel">🪙 {profileData.coins}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLobbyClick}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-korean-pixel text-xl hover:opacity-90 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🎮 게임 시작하기
                </button>
              </div>
            </div>

            {/* 캐릭터 디스플레이 섹션 */}
            {renderCharacterDisplay()}

            {/* 계좌 연동 카드 */}
            <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.02] transition-transform duration-300 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 font-korean-pixel">💳 계좌 연동</h3>
                <button
                  onClick={() => setShowAccountLinkModal(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-korean-pixel hover:opacity-90 transition-all duration-300"
                >
                  연동하기
                </button>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl text-center">
                <p className="text-gray-600 font-korean-pixel text-lg mb-2">계좌를 연동하고</p>
                <p className="text-gray-800 font-korean-pixel text-xl font-bold">더 많은 기능을 사용해보세요!</p>
              </div>
            </div>

            {/* 소비패턴 분석 및 문제 풀이 결과 섹션 */}
            <div className="mt-6 mb-24">
              <div className="grid grid-cols-2 gap-8">
                {/* 소비패턴 분석 */}
                <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 font-korean-pixel">📊 소비패턴 분석</h3>
                    <button
                      onClick={() => setShowAccountLinkModal(true)}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl font-korean-pixel hover:opacity-90 transition-all duration-300"
                    >
                      자세히 보기
                    </button>
                  </div>
                  <div className="space-y-6">
                    {/* 소비 카테고리 차트 */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="font-korean-pixel text-lg font-bold mb-4">주요 소비 카테고리</h4>
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <div className="w-32 font-korean-pixel">식비</div>
                          <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: "65%" }}></div>
                          </div>
                          <div className="w-16 text-right font-korean-pixel">65%</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-32 font-korean-pixel">쇼핑</div>
                          <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: "20%" }}></div>
                          </div>
                          <div className="w-16 text-right font-korean-pixel">20%</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-32 font-korean-pixel">교통</div>
                          <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: "15%" }}></div>
                          </div>
                          <div className="w-16 text-right font-korean-pixel">15%</div>
                        </div>
                      </div>
                    </div>
                    {/* 소비 트렌드 */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="font-korean-pixel text-lg font-bold mb-4">이번 달 소비 트렌드</h4>
                      <p className="text-gray-700 font-korean-pixel mb-2">
                        전월 대비 식비가 <span className="text-red font-bold">15% 증가</span>했어요.
                      </p>
                      <p className="text-gray-700 font-korean-pixel">배달음식 주문이 잦아진 것이 주요 원인으로 보여요.</p>
                    </div>
                  </div>
                </div>

                {/* 소비패턴 기반 문제 풀이 결과 */}
                <div className="bg-white/95 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 font-korean-pixel">📝 AI 문제 풀이 결과</h3>
                    <button
                      onClick={() => navigate("/ai-quiz-lobby")}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-korean-pixel hover:opacity-90 transition-all duration-300"
                    >
                      다시 풀기
                    </button>
                  </div>
                  <div className="space-y-6">
                    {/* 최근 퀴즈 결과 */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="font-korean-pixel text-lg font-bold mb-4">최근 퀴즈 성적</h4>
                      <div className="flex items-center justify-center gap-8">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 font-korean-pixel">85점</div>
                          <div className="text-gray-600 font-korean-pixel">평균 점수</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-600 font-korean-pixel">12회</div>
                          <div className="text-gray-600 font-korean-pixel">총 응시 횟수</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-600 font-korean-pixel">3일</div>
                          <div className="text-gray-600 font-korean-pixel">연속 학습</div>
                        </div>
                      </div>
                    </div>
                    {/* 취약 분야 */}
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="font-korean-pixel text-lg font-bold mb-4">집중 학습이 필요한 분야</h4>
                      <div className="space-y-3">
                        <div className="flex items-center bg-red-50 p-3 rounded-lg">
                          <span className="text-red font-bold font-korean-pixel mr-2">1</span>
                          <span className="font-korean-pixel">투자 위험 관리</span>
                        </div>
                        <div className="flex items-center bg-orange-50 p-3 rounded-lg">
                          <span className="text-orange-500 font-bold font-korean-pixel mr-2">2</span>
                          <span className="font-korean-pixel">세금 계산</span>
                        </div>
                        <div className="flex items-center bg-yellow-50 p-3 rounded-lg">
                          <span className="text-yellow-600 font-bold font-korean-pixel mr-2">3</span>
                          <span className="font-korean-pixel">금융 상품 이해</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      {showFeatureModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md">
            <h2 className="text-xl font-bold mb-3 font-korean-pixel">안내</h2>
            <p className="mb-4 font-korean-pixel">{featureMessage}</p>
            <button onClick={() => setShowFeatureModal(false)} className="w-full py-2 bg-blue-500 text-white rounded-lg font-korean-pixel hover:bg-blue-600 transition-colors">
              확인
            </button>
          </div>
        </div>
      )}

      {showNicknameModal && <NicknameChangeModal onClose={() => setShowNicknameModal(false)} currentNickname={user.nickname} onUpdateNickname={handleUpdateNickname} />}
      {showAccountLinkModal && <AccountLinkModal onClose={() => setShowAccountLinkModal(false)} onLinkAccount={handleAccountLink} />}

      {showCharacterInfoModal && <CharacterInfoModal character={selectedCharacter} onClose={() => setShowCharacterInfoModal(false)} />}
    </Background>
  );
};

export default MainPage;
