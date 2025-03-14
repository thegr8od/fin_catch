import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import battleBackground from "../assets/battlebg.png"
import BattleScreen from "../components/game/BattleScreen"
import { getMotionImages } from "../utils/motionLoader"
import { useLoading } from "../contexts/LoadingContext"

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
 * 1:1 대결 페이지 컴포넌트
 * 사용자와 상대방 간의 1:1 대결을 진행하는 페이지
 */
const OneToOnePage: React.FC = () => {
  const navigate = useNavigate()
  const { setLoading, setProgress, completeLoading } = useLoading()
  const [playerHealth, setPlayerHealth] = useState<number>(1)
  const [opponentHealth, setOpponentHealth] = useState<number>(1)
  const [chatInput, setChatInput] = useState<string>("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [playerBubble, setPlayerBubble] = useState<ChatMessage | null>(null)
  const [timer, setTimer] = useState<number>(1)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false)
  const [showAnimation, setShowAnimation] = useState<boolean>(false)
  const [resourcesLoaded, setResourcesLoaded] = useState<boolean>(false)
  const [questionText, setQuestionText] = useState<string>(
    "임시 문제 길이 1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111"
  )

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
  }, [playerBubble])

  useEffect(() => {
    if (playerHealth <= 0 || opponentHealth <= 0) {
      console.log("플레이어 체력:", playerHealth);
      console.log("상대방 체력:", opponentHealth);

      // 체력이 0이 되면 중앙 애니메이션 숨김
      setShowAnimation(false);
      console.log("플레이어 체력:", playerHealth)
      console.log("상대방 체력:", opponentHealth)
      setShowAnimation(false)
    }
  }, [playerHealth, opponentHealth]);

  const handleAnimationComplete = () => {
    console.log("애니메이션 완료 핸들러 호출됨");

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

    setChatMessages([...chatMessages, newMessage])
    setPlayerBubble(newMessage)
    setChatInput("")
  }

  const handleHitLeft = () => {
    console.log("왼쪽 플레이어 피격!");
    setPlayerHealth((prev) => {
      const newHealth = Math.max(0, prev - 1);
      console.log("플레이어 체력 변경:", prev, "->", newHealth);
      return newHealth;
    });
  };

  const handleHitRight = () => {
    console.log("오른쪽 플레이어 피격!");
    setOpponentHealth((prev) => {
      const newHealth = Math.max(0, prev - 1)
      console.log("상대방 체력 변경:", prev, "->", newHealth)
      return newHealth
    })
  }

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      {/* 배경 이미지 레이어 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${battleBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* 게임 컨텐츠 레이어 */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {/* 상단 네비게이션 영역 */}
        <div className="absolute top-4 left-4">
          <button className="bg-white bg-opacity-70 text-black py-2 px-4 rounded-full font-medium hover:bg-opacity-100 transition-colors" onClick={handleBackClick}>
            ← 뒤로 가기
          </button>
        </div>

        {/* 메인 게임 영역 - 수직/수평 중앙 정렬 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-full py-8">
            <BattleScreen
              resourcesLoaded={resourcesLoaded}
              playerHealth={playerHealth}
              opponentHealth={opponentHealth}
              playerBubble={playerBubble}
              timer={timer}
              questionText={questionText}
              chatMessages={chatMessages}
              chatInput={chatInput}
              showAnimation={showAnimation}
              onChatSubmit={handleChatSubmit}
              onChatInputChange={handleChatInputChange}
              onAnimationComplete={handleAnimationComplete}
              onHitLeft={handleHitLeft}
              onHitRight={handleHitRight}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneToOnePage;
