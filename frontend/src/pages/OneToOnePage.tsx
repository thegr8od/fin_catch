import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import battleBackground from "../assets/battlebg.png"
import Animation from "../game/Animations"
import SpriteAnimation from "../game/SpriteAnimation"
import { getMotionImages } from "../utils/motionLoader"

interface ChatMessage {
  sender: string
  message: string
  timestamp: Date
  isVisible?: boolean
}

const OneToOnePage: React.FC = () => {
  const navigate = useNavigate()
  const { category } = useParams<{ category: string }>()
  const [playerHealth, setPlayerHealth] = useState<number>(5)
  const [opponentHealth, setOpponentHealth] = useState<number>(5)
  const [chatInput, setChatInput] = useState<string>("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [playerBubble, setPlayerBubble] = useState<ChatMessage | null>(null)
  const [timer, setTimer] = useState<number>(1)
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true)
  const [showAnimation, setShowAnimation] = useState<boolean>(false)

  // URL 파라미터에 따라 초기 상태 설정
  useEffect(() => {
    // 필요한 초기화 로직만 유지
  }, [category])

  // 타이머 효과
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1)
      }, 1000)
    } else if (timer === 0) {
      setIsTimerRunning(false)
      // 타이머가 0이 되면 불꽃 애니메이션 시작
      console.log("타이머 종료, 애니메이션 시작")
      // 이미지 경로 확인
      const fireImages = getMotionImages("fire", 5)
      console.log("불꽃 이미지 경로:", fireImages)
      setShowAnimation(true)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer, isTimerRunning])

  // 말풍선 타이머 효과
  useEffect(() => {
    if (playerBubble) {
      const timer = setTimeout(() => {
        setPlayerBubble(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [playerBubble])

  // 애니메이션 완료 핸들러
  const handleAnimationComplete = () => {
    console.log("애니메이션 완료 핸들러 호출됨")
    // 애니메이션 완료 후 처리할 로직
    setShowAnimation(false)

    // 다음 라운드를 위해 타이머 재설정 (필요한 경우)
    // setTimer(60);
    // setIsTimerRunning(true);

    // 게임 종료 체크
    if (playerHealth <= 1 || opponentHealth <= 1) {
      // 게임 종료 처리 (승패 결정 등)
      console.log("게임 종료:", playerHealth <= 1 ? "패배" : "승리")
      // 여기에 게임 종료 후 처리 로직 추가
    }
  }

  const handleBackClick = () => {
    navigate("/main")
  }

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value)
  }

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatInput.trim() === "") return

    const newMessage: ChatMessage = {
      sender: "김병년", // 현재 사용자 이름
      message: chatInput,
      timestamp: new Date(),
    }

    setChatMessages([...chatMessages, newMessage])
    setPlayerBubble(newMessage)

    setChatInput("")
  }

  // 하트 아이콘 렌더링 함수
  const renderHearts = (count: number, total: number = 5) => {
    return Array(total)
      .fill(0)
      .map((_, index) => (
        <span key={index} className="text-2xl mx-1">
          {index < count ? "❤️" : "🖤"}
        </span>
      ))
  }

  // 대결 화면 렌더링
  const renderBattleScreen = () => {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center">
        <div className="container mx-auto max-w-[80%] h-[90vh] px-4">
          <div className="flex w-full h-full">
            {/* 왼쪽 플레이어 영역 */}
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
                  </div>
                </div>
                <div className="flex mb-2">{renderHearts(playerHealth)}</div>
                <div className="text-center">
                  <span className="text-lg font-bold text-white">공격적인 투자자 김병년</span>
                </div>
              </div>
            </div>

            {/* 중앙 대결 영역 */}
            <div className="w-2/4 flex flex-col items-center justify-center px-4">
              {/* VS 표시와 타이머 */}
              <div className="flex items-center justify-center mb-4">
                <div className="text-4xl font-bold text-white mr-4" style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
                  VS
                </div>
                <div className={`text-4xl font-bold ${timer <= 10 ? "text-red" : "text-white"}`} style={{ textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
                  {timer}
                </div>
              </div>

              {/* 문제 영역 */}
              <div className="w-full bg-white bg-opacity-80 rounded-lg p-4 mb-4">
                <div className="text-sm mb-3">
                  당신이 100만원을 가지고 있고, 연간 5%의 복리로 투자할 수 있다고 가정해보세요. 이 돈을 10년 동안 투자할 때, 최종적으로 얼마의 금액이 될지 계산하고, 이러한 복리 투자가 단리 투자와
                  비교했을 때 어떤 장점이 있는지 설명해보세요.
                </div>
              </div>

              {/* 채팅 입력 영역 */}
              <div className="w-full mt-auto mb-8">
                <form onSubmit={handleChatSubmit} className="flex">
                  <input type="text" value={chatInput} onChange={handleChatInputChange} className="flex-grow p-2 rounded-l-lg border-0" placeholder="메시지를 입력하세요..." />
                  <button type="submit" className="bg-yellow-400 text-black px-4 py-2 rounded-r-lg">
                    전송
                  </button>
                </form>
              </div>
            </div>

            {/* 오른쪽 상대 영역 */}
            <div className="w-1/4 flex flex-col items-center justify-center">
              <div className="w-full bg-transparent flex flex-col items-center">
                <div className="h-20 mb-2">{/* 상대방 말풍선 제거 */}</div>
                <div className="w-[185px] h-48 flex items-center justify-center mb-3 p-2">
                  <div className="w-full h-full">
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
                  </div>
                </div>
                <div className="flex mb-2">{renderHearts(opponentHealth)}</div>
                <div className="text-center">
                  <span className="text-lg font-bold text-white">악의 세력 김세현</span>
                </div>
              </div>
            </div>
          </div>

          {/* 좌하단 종합 채팅창 */}
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

          {/* 불꽃 애니메이션 - 캐릭터 수평선상에 위치 */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] h-[300px] border border-transparent">
            {showAnimation && (
              <Animation
                isPlaying={showAnimation}
                imagePaths={getMotionImages("fire", 5)}
                width={400}
                height={300}
                animationSpeed={0.1} // 애니메이션 속도를 느리게 설정
                onAnimationComplete={handleAnimationComplete}
                onHitLeft={() => {
                  // 왼쪽 캐릭터(플레이어)가 맞았을 때 처리
                  setPlayerHealth((prev) => Math.max(0, prev - 1))
                  console.log("왼쪽 캐릭터 피격!")
                }}
                onHitRight={() => {
                  // 오른쪽 캐릭터(상대)가 맞았을 때 처리
                  setOpponentHealth((prev) => Math.max(0, prev - 1))
                  console.log("오른쪽 캐릭터 피격!")
                }}
                direction={Math.random() > 0.5} // 50% 확률로 방향 결정
              />
            )}
          </div>
        </div>
      </div>
    )
  }

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
      {/* 뒤로 가기 버튼 */}
      <button className="absolute top-4 left-4 bg-white bg-opacity-70 text-black py-2 px-4 rounded-full font-medium hover:bg-opacity-100 transition-colors" onClick={handleBackClick}>
        ← 뒤로 가기
      </button>

      {renderBattleScreen()}
    </div>
  )
}

export default OneToOnePage
