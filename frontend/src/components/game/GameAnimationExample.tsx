import React, { useState, useEffect } from "react";
import GameAnimation from "./GameAnimation";
import { AnimationState } from "../../hooks/useGameAnimation";

const GameAnimationExample: React.FC = () => {
  // 애니메이션 재생 상태
  const [isPlaying, setIsPlaying] = useState(false);
  // HP 상태
  const [hp, setHp] = useState(100);
  // 남은 시간
  const [timeRemaining, setTimeRemaining] = useState(60);
  // 애니메이션 타입 (스프라이트 시트 또는 이미지 시퀀스)
  const [animationType, setAnimationType] = useState<"spriteSheet" | "imageSequence">("spriteSheet");

  // 게임 시작 시 타이머 시작
  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPlaying]);

  // 피격 처리 함수
  const handleHit = () => {
    setHp((prev) => Math.max(0, prev - 20));
  };

  // 게임 종료 처리 함수
  const handleGameOver = () => {
    setIsPlaying(false);
    alert("게임 종료!");
  };

  // 게임 리셋 함수
  const resetGame = () => {
    setHp(100);
    setTimeRemaining(60);
    setIsPlaying(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">게임 애니메이션 예제</h1>

      {/* 컨트롤 패널 */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex flex-wrap gap-4 mb-4">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? "일시정지" : "재생"}
          </button>

          <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" onClick={handleHit}>
            피격 (-20 HP)
          </button>

          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600" onClick={resetGame}>
            리셋
          </button>

          <div className="flex items-center gap-2">
            <span>애니메이션 타입:</span>
            <select className="px-2 py-1 border rounded" value={animationType} onChange={(e) => setAnimationType(e.target.value as "spriteSheet" | "imageSequence")}>
              <option value="spriteSheet">스프라이트 시트</option>
              <option value="imageSequence">이미지 시퀀스</option>
            </select>
          </div>
        </div>

        {/* 상태 표시 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-2">HP: {hp}/100</div>
            <div className="w-full bg-gray-300 h-4 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full" style={{ width: `${hp}%` }} />
            </div>
          </div>

          <div>
            <div className="mb-2">남은 시간: {timeRemaining}초</div>
            <div className="w-full bg-gray-300 h-4 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: `${(timeRemaining / 60) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* 애니메이션 컨테이너 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 스프라이트 시트 애니메이션 */}
        {animationType === "spriteSheet" && (
          <div className="h-96 border rounded-lg overflow-hidden">
            <GameAnimation
              isPlaying={isPlaying}
              type="spriteSheet"
              spriteSheet="/game/character_sprite.png" // 스프라이트 시트 경로
              frameWidth={64}
              frameHeight={64}
              frameCount={8}
              horizontal={true}
              rows={1}
              columns={8}
              animationSpeed={0.2}
              loop={true}
              moving={false}
              hp={hp}
              timeRemaining={timeRemaining}
              onHitLeft={() => console.log("왼쪽 충돌")}
              onHitRight={() => console.log("오른쪽 충돌")}
              onGameOver={handleGameOver}
              initialState={AnimationState.IDLE}
              hitAnimationOptions={{
                type: "spriteSheet",
                spriteSheet: "/game/character_hit.png",
                frameWidth: 64,
                frameHeight: 64,
                frameCount: 4,
                horizontal: true,
              }}
              deadAnimationOptions={{
                type: "spriteSheet",
                spriteSheet: "/game/character_dead.png",
                frameWidth: 64,
                frameHeight: 64,
                frameCount: 6,
                horizontal: true,
              }}
            />
          </div>
        )}

        {/* 이미지 시퀀스 애니메이션 */}
        {animationType === "imageSequence" && (
          <div className="h-96 border rounded-lg overflow-hidden">
            <GameAnimation
              isPlaying={isPlaying}
              type="imageSequence"
              imagePaths={["/game/frame_1.png", "/game/frame_2.png", "/game/frame_3.png", "/game/frame_4.png", "/game/frame_5.png", "/game/frame_6.png", "/game/frame_7.png", "/game/frame_8.png"]}
              animationSpeed={0.2}
              loop={true}
              moving={false}
              hp={hp}
              timeRemaining={timeRemaining}
              onHitLeft={() => console.log("왼쪽 충돌")}
              onHitRight={() => console.log("오른쪽 충돌")}
              onGameOver={handleGameOver}
              initialState={AnimationState.IDLE}
              hitAnimationOptions={{
                type: "imageSequence",
                imagePaths: ["/game/hit_1.png", "/game/hit_2.png", "/game/hit_3.png", "/game/hit_4.png"],
              }}
              deadAnimationOptions={{
                type: "imageSequence",
                imagePaths: ["/game/dead_1.png", "/game/dead_2.png", "/game/dead_3.png", "/game/dead_4.png", "/game/dead_5.png", "/game/dead_6.png"],
              }}
            />
          </div>
        )}

        {/* 설명 */}
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-bold mb-2">사용 방법</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>재생/일시정지</strong>: 애니메이션을 재생하거나 일시정지합니다.
            </li>
            <li>
              <strong>피격</strong>: HP를 20 감소시킵니다. HP가 0이 되면 사망 애니메이션이 재생됩니다.
            </li>
            <li>
              <strong>리셋</strong>: HP와 시간을 초기화합니다.
            </li>
            <li>
              <strong>애니메이션 타입</strong>: 스프라이트 시트와 이미지 시퀀스 중 선택할 수 있습니다.
            </li>
          </ul>

          <h2 className="text-xl font-bold mt-4 mb-2">특징</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>HP가 0이 되면 사망 애니메이션이 재생됩니다.</li>
            <li>시간이 0이 되면 게임 종료 애니메이션이 재생됩니다.</li>
            <li>피격 시 피격 애니메이션이 재생됩니다.</li>
            <li>새로고침 시 캔버스 노출 문제가 해결되었습니다.</li>
            <li>GIF 파일 깨짐 문제가 해결되었습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameAnimationExample;
