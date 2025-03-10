import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import battleBackground from "../assets/battlebg.png";
import GameAnimation from "../components/game/GameAnimation";
import SpriteAnimation from "../components/game/SpriteAnimation";
import { getMotionImages } from "../utils/motionLoader";
import { useLoading } from "../contexts/LoadingContext";

/**
 * 채팅 메시지 인터페이스
 * @property {string} sender - 메시지 발신자 이름
 * @property {string} message - 메시지 내용
 * @property {Date} timestamp - 메시지 전송 시간
 * @property {boolean} isVisible - 메시지 표시 여부 (선택적)
 */
interface ChatMessage {
  sender: string;
  message: string;
  timestamp: Date;
  isVisible?: boolean;
}

/**
 * 이미지 사전 로드 함수
 * 이미지를 미리 로드하여 화면에 표시될 때 깜빡임 방지
 * @param {string} src - 이미지 경로
 * @returns {Promise<HTMLImageElement>} - 로드된 이미지 객체를 포함한 Promise
 */
const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

/**
 * 1:1 대결 페이지 컴포넌트
 * 사용자와 상대방 간의 1:1 대결을 진행하는 페이지
 */
const OneToOnePage: React.FC = () => {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const { setLoading, setProgress, completeLoading } = useLoading();
  const [playerHealth, setPlayerHealth] = useState<number>(1);
  const [opponentHealth, setOpponentHealth] = useState<number>(1);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [playerBubble, setPlayerBubble] = useState<ChatMessage | null>(null);
  const [timer, setTimer] = useState<number>(10);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [showAnimation, setShowAnimation] = useState<boolean>(false);
  const [resourcesLoaded, setResourcesLoaded] = useState<boolean>(false);

  const resourcesLoadedRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setProgress(0);

    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      setLoading(false);
    };
  }, [setLoading, setProgress]);

  useEffect(() => {
    if (resourcesLoadedRef.current && isMountedRef.current) {
      console.log("리소스가 이미 로드되어 있음, 로드 건너뜀");
      completeLoading();
      return;
    }

    console.log("OneToOnePage 리소스 로드 시작");

    let isComponentMounted = true;

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const timeoutId = setTimeout(() => {
          reject(new Error(`이미지 로드 타임아웃: ${src}`));
        }, 5000);

        img.onload = () => {
          clearTimeout(timeoutId);
          resolve(img);
        };

        img.onerror = (e) => {
          clearTimeout(timeoutId);
          reject(e);
        };

        img.src = `${src}?t=${new Date().getTime()}`;
      });
    };

    const loadResources = async () => {
      try {
        setProgress(10);

        const fireImages = getMotionImages("fire", 5);
        const imagesToLoad = [battleBackground, "/game/IdleCatt.png", ...fireImages];

        const totalImages = imagesToLoad.length;

        const imagePromises = imagesToLoad.map((src, index) => {
          return loadImage(src)
            .then((img) => {
              if (isComponentMounted) {
                const newProgress = Math.floor(10 + ((index + 1) / totalImages) * 80);
                setProgress(newProgress);
              }
              return img;
            })
            .catch((error) => {
              console.error(`이미지 로드 실패: ${src}`, error);
              if (isComponentMounted) {
                const newProgress = Math.floor(10 + ((index + 1) / totalImages) * 80);
                setProgress(newProgress);
              }
              return null;
            });
        });

        await Promise.all(imagePromises);

        if (!isComponentMounted) return;

        setProgress(100);
        setResourcesLoaded(true);
        resourcesLoadedRef.current = true;

        completeLoading();

        setIsTimerRunning(true);
      } catch (error) {
        console.error("리소스 로드 중 예외 발생:", error);

        if (!isComponentMounted) return;

        setProgress(100);
        setResourcesLoaded(true);
        completeLoading();

        alert("게임 리소스를 로드하는 데 실패했습니다. 페이지를 새로고침하여 다시 시도해주세요.");
      }
    };

    loadResources();

    return () => {
      isComponentMounted = false;
    };
  }, [completeLoading, setProgress]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
      console.log("타이머 종료, 애니메이션 시작");
      const fireImages = getMotionImages("fire", 5);
      console.log("불꽃 이미지 경로:", fireImages);
      setShowAnimation(true);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer, isTimerRunning]);

  useEffect(() => {
    if (playerBubble) {
      const timer = setTimeout(() => {
        setPlayerBubble(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [playerBubble]);

  // 체력 상태 변경 감지 및 콘솔 출력
  useEffect(() => {
    // 중요한 상태 변화만 로그 출력
    if (playerHealth <= 0 || opponentHealth <= 0) {
      console.log("플레이어 체력:", playerHealth);
      console.log("상대방 체력:", opponentHealth);

      // 체력이 0이 되면 중앙 애니메이션 숨김
      setShowAnimation(false);
    }
  }, [playerHealth, opponentHealth]);

  const handleAnimationComplete = () => {
    console.log("애니메이션 완료 핸들러 호출됨");

    // 일반 공격 애니메이션인 경우에만 애니메이션을 숨김
    // 체력이 0인 경우는 별도의 사망 애니메이션 컴포넌트가 처리함
    if (playerHealth > 0 && opponentHealth > 0) {
      setShowAnimation(false);
    }

    if (playerHealth <= 0 || opponentHealth <= 0) {
      if (playerHealth <= 0) {
        console.log("게임 종료: 플레이어 패배 (체력: " + playerHealth + ")");
      } else if (opponentHealth <= 0) {
        console.log("게임 종료: 플레이어 승리 (상대방 체력: " + opponentHealth + ")");
      }
    } else {
      console.log("게임 진행 중 - 플레이어 체력: " + playerHealth + ", 상대방 체력: " + opponentHealth);
    }
  };

  const handleBackClick = () => {
    setLoading(true);
    setTimeout(() => {
      navigate("/main");
    }, 300);
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim() === "") return;

    const newMessage: ChatMessage = {
      sender: "김병년",
      message: chatInput,
      timestamp: new Date(),
    };

    setChatMessages([...chatMessages, newMessage]);
    setPlayerBubble(newMessage);

    setChatInput("");
  };

  const renderHearts = (count: number, total: number = 5) => {
    return Array(total)
      .fill(0)
      .map((_, index) => (
        <span key={index} className="text-2xl mx-1">
          {index < count ? "❤️" : "🖤"}
        </span>
      ));
  };

  const renderBattleScreen = () => {
    if (!resourcesLoaded) {
      return <div className="h-full w-full"></div>;
    }

    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="container mx-auto max-w-[80%] h-[90vh] px-4">
          <div className="flex w-full h-full">
            <div className="w-1/4 flex flex-col items-center justify-center">
              <div className="w-full bg-transparent flex flex-col items-center">
                <div className="h-20 mb-2">
                  {playerBubble && (
                    <div className="w-full flex justify-center">
                      <div className="bg-white bg-opacity-80 rounded-lg p-4 min-w-[10rem] max-w-[11rem] relative">
                        <div className="text-sm whitespace-normal break-words">{playerBubble.message}</div>
                        <div className="absolute w-4 h-4 bg-white bg-opacity-80 rotate-45 bottom-[-8px] left-1/2 transform -translate-x-1/2"></div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-[185px] h-48 flex items-center justify-center mb-3 p-2">
                  <div className="w-full h-full">
                    {playerHealth > 0 ? (
                      <SpriteAnimation
                        isPlaying={true}
                        spriteSheet="/game/IdleCatt.png"
                        frameWidth={32}
                        frameHeight={32}
                        frameCount={7}
                        width={96}
                        height={96}
                        animationSpeed={0.1}
                        horizontal={true}
                        rows={1}
                        columns={7}
                        loop={true}
                        moving={false}
                      />
                    ) : (
                      <SpriteAnimation
                        isPlaying={true}
                        spriteSheet="/game/classicCat/die/DieCatt.png"
                        frameWidth={32}
                        frameHeight={32}
                        frameCount={15}
                        width={96}
                        height={96}
                        animationSpeed={0.1}
                        horizontal={true}
                        rows={1}
                        columns={15}
                        loop={false}
                        moving={false}
                      />
                    )}
                  </div>
                </div>
                <div className="flex mb-2">{renderHearts(playerHealth)}</div>
                <div className="text-center">
                  <span className="text-lg font-bold text-white">공격적인 투자자 김병년</span>
                </div>
              </div>
            </div>

            <div className="w-2/4 flex flex-col items-center justify-center px-4">
              <div className="flex items-center justify-center mb-4">
                <div className="text-4xl font-bold text-white mr-4" style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
                  VS
                </div>
                <div className={`text-4xl font-bold ${timer <= 10 ? "text-red" : "text-white"}`} style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
                  {timer}
                </div>
              </div>

              <div className="w-full bg-white bg-opacity-80 rounded-lg p-4 mb-4">
                <div className="text-sm mb-3">
                  당신이 100만원을 가지고 있고, 연간 5%의 복리로 투자할 수 있다고 가정해보세요. 이 돈을 10년 동안 투자할 때, 최종적으로 얼마의 금액이 될지 계산하고, 이러한 복리 투자가 단리 투자와
                  비교했을 때 어떤 장점이 있는지 설명해보세요.
                </div>
              </div>

              <div className="w-full mt-auto mb-8">
                <form onSubmit={handleChatSubmit} className="flex">
                  <input type="text" value={chatInput} onChange={handleChatInputChange} className="flex-grow p-2 rounded-l-lg border-0" placeholder="메시지를 입력하세요..." />
                  <button type="submit" className="bg-yellow-400 text-black px-4 py-2 rounded-r-lg">
                    전송
                  </button>
                </form>
              </div>
            </div>

            <div className="w-1/4 flex flex-col items-center justify-center">
              <div className="w-full bg-transparent flex flex-col items-center">
                <div className="h-20 mb-2">{/* 상대방 말풍선 제거 */}</div>
                <div className="w-[185px] h-48 flex items-center justify-center mb-3 p-2">
                  <div className="w-full h-full">
                    {opponentHealth > 0 ? (
                      <SpriteAnimation
                        isPlaying={true}
                        spriteSheet="/game/IdleCatt.png"
                        frameWidth={32}
                        frameHeight={32}
                        frameCount={7}
                        width={96}
                        height={96}
                        animationSpeed={0.1}
                        horizontal={true}
                        rows={1}
                        columns={7}
                        loop={true}
                        moving={false}
                        direction={false}
                      />
                    ) : (
                      <SpriteAnimation
                        isPlaying={true}
                        spriteSheet="/game/classicCat/die/DieCatt.png"
                        frameWidth={32}
                        frameHeight={32}
                        frameCount={15}
                        width={96}
                        height={96}
                        animationSpeed={0.1}
                        horizontal={true}
                        rows={1}
                        columns={15}
                        loop={false}
                        moving={false}
                        direction={false}
                      />
                    )}
                  </div>
                </div>
                <div className="flex mb-2">{renderHearts(opponentHealth)}</div>
                <div className="text-center">
                  <span className="text-lg font-bold text-white">악의 세력 김세현</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 w-1/4 h-1/4 bg-white bg-opacity-80 rounded-lg p-2 flex flex-col">
            <div className="text-sm font-bold mb-2 border-b border-gray-300 pb-1">채팅</div>
            <div className="flex-grow overflow-y-auto mb-2 text-sm">
              {chatMessages.map((msg, index) => (
                <div key={index} className="mb-1">
                  <span className="font-bold">{msg.sender}:</span> {msg.message}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] h-[300px] border border-transparent">
            {showAnimation && playerHealth > 0 && opponentHealth > 0 && (
              <GameAnimation
                isPlaying={showAnimation}
                type="imageSequence"
                imagePaths={getMotionImages("fire", 5)}
                width={400}
                height={300}
                animationSpeed={0.1}
                hp={100}
                onAnimationComplete={handleAnimationComplete}
                onHitLeft={() => {
                  setPlayerHealth((prev) => {
                    const newHealth = Math.max(0, prev - 1);
                    console.log(`왼쪽 캐릭터 피격! 이전 체력: ${prev}, 새 체력: ${newHealth}`);
                    return newHealth;
                  });
                }}
                onHitRight={() => {
                  setOpponentHealth((prev) => {
                    const newHealth = Math.max(0, prev - 1);
                    console.log(`오른쪽 캐릭터 피격! 이전 체력: ${prev}, 새 체력: ${newHealth}`);
                    return newHealth;
                  });
                }}
                direction={Math.random() > 0.5}
                moving={true}
                loop={false}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: `url(${battleBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <button className="absolute top-4 left-4 bg-white bg-opacity-70 text-black py-2 px-4 rounded-full font-medium hover:bg-opacity-100 transition-colors" onClick={handleBackClick}>
        ← 뒤로 가기
      </button>

      {/* 테스트 버튼 추가 */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          className="bg-red-500 bg-opacity-70 text-white py-2 px-4 rounded-full font-medium hover:bg-opacity-100 transition-colors"
          onClick={() => {
            // 먼저 공격 애니메이션을 표시한 후 체력을 0으로 설정
            setShowAnimation(true);
            setTimeout(() => {
              setPlayerHealth(0);
            }, 1000); // 애니메이션이 끝나기 전에 체력을 0으로 설정
          }}
        >
          플레이어 체력 0
        </button>
        <button
          className="bg-red-500 bg-opacity-70 text-white py-2 px-4 rounded-full font-medium hover:bg-opacity-100 transition-colors"
          onClick={() => {
            // 먼저 공격 애니메이션을 표시한 후 체력을 0으로 설정
            setShowAnimation(true);
            setTimeout(() => {
              setOpponentHealth(0);
            }, 1000); // 애니메이션이 끝나기 전에 체력을 0으로 설정
          }}
        >
          상대방 체력 0
        </button>
      </div>

      {renderBattleScreen()}
    </div>
  );
};

export default OneToOnePage;
