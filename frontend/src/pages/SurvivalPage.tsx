import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Background from "../assets/survival.gif";
import CatGray from "../assets/AIcat2.png";
import CatWhite from "../assets/AIcat3.png";

interface Cat {
  id: number;
  name: string;
  image: string;
  points: number;
}

interface Message {
  type: string;
  text: string;
}

// 게임 상태를 관리하는 타입
type GameState = "playing" | "result";

const SurvivalPage = () => {
    const { mode } = useParams<{ mode: string }>();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState<number>(10);
    const [gameState, setGameState] = useState<GameState>("playing");
    const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
    const [cats, setCats] = useState<Cat[]>([
        { id: 1, name: "닉네임1", image: CatGray, points: 100 },
        { id: 2, name: "닉네임2", image: CatGray, points: 100 },
        { id: 3, name: "닉네임3", image: CatGray, points: 100 },
        { id: 4, name: "닉네임4", image: CatWhite, points: 100 },
        { id: 5, name: "닉네임5", image: CatWhite, points: 100 },
        { id: 6, name: "닉네임6", image: CatWhite, points: 100 },
    ]);
    const [messages, setMessages] = useState<Message[]>([
        { type: "system", text: "김땡년: 뭐하노 ㅋㅋ" },
        { type: "system", text: "김세현: 아 개어렵네 ㅋㅋ" }
    ]);
    const [newMessage, setNewMessage] = useState<string>("");

    // 타이머 카운트다운 효과
    useEffect(() => {
        if (timeLeft <= 0) {
            setIsTimeUp(true);
            return;
        }
        
        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);
        
        return () => clearTimeout(timer);
    }, [timeLeft]);

    // 게임 종료 함수 - 결과 확인 버튼을 눌렀을 때 호출됨
    const showResults = () => {
        // 랜덤한 점수 부여 (실제로는 게임 로직에 맞게 조정)
        const updatedCats = cats.map(cat => ({
            ...cat,
            points: Math.floor(Math.random() * 100) + 100
        }));

        // 니네임3에게 좀 더 높은 점수 부여 (예시를 위해)
        updatedCats[2].points = 180;
        
        setCats(updatedCats);
        
        // 결과 화면으로 전환
        setGameState("result");
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        
        setMessages([...messages, { type: "user", text: `김태호(나) : ${newMessage}` }]);
        setNewMessage("");
    };

    // 메인 페이지로 이동
    const goToMainPage = () => {
        navigate('/main');
    };

    // 1. 게임 진행 화면
    const renderGameScreen = () => (
        <div className="w-[95%] md:w-[85%] lg:w-[80%] h-full">
            <div className="w-full py-2 text-center">
                <h1 className="text-2xl">
                    {isTimeUp 
                        ? "시간이 종료되었습니다!" 
                        : `남은시간 : ${String(timeLeft).padStart(2, '0')}초`}
                </h1>
            </div>
            
            {/* 게임 정보 박스 */}
            <div className="w-10/12 mx-auto bg-[#FAD0C4] p-4 rounded min-h-32">
                <p className="text-lg">
                    당신이 100만원을 가지고 있고, 연간 5%의 복리로 투자할 수 있다고 가정해보세요. 이 돈을 10년 동안 투자했을 때, 최종적으로 얼마의 금액이 될지 계산하고, 이러한 복리 투자가 단리 투자와 비교했을 때 어떤 장점이 있는지 설명해보세요.
                </p>
            </div>
            
            {/* 고양이 캐릭터 그리드 */}
            <div className="w-10/12 mx-auto bg-white p-2 grid grid-cols-3 sm:grid-cols-6 gap-2 overflow-visible min-h-[100px] sm:min-h-[130px] relative z-10">
                {cats.map(cat => (
                    <div key={cat.id} className="flex flex-col items-center overflow-visible p-1">
                        <h3 className="text-xs font-medium mb-1">{cat.name}</h3>
                        <div className="w-full h-full max-w-[85px] max-h-[85px] bg-white p-0">
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                        </div>
                        <p className="text-center text-sm mt-1">{cat.points}</p>
                    </div>
                ))}
            </div>
            
            {/* 채팅 섹션 (살구색 배경) */}
            <div className="w-10/12 mx-auto bg-[#FAD0C4] p-4 flex flex-col">
                {/* 채팅 메시지 영역 (흰색 배경) */}
                <div className="bg-white p-3 rounded h-[140px] overflow-y-auto mb-2"> 
                    {messages.map((msg, index) => (
                        <p key={index} className="mb-1">{msg.text}</p>
                    ))}
                </div>
                
                {/* 채팅 입력 */}
                <form onSubmit={isTimeUp ? showResults : handleSendMessage} className="flex items-center gap-2 mt-2">
                    <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        className="flex-grow border border-gray-300 p-2 rounded"
                        disabled={isTimeUp}
                    />
                    {isTimeUp ? (
                        <button 
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center animate-pulse"
                        >
                            결과 확인하기
                        </button>
                    ) : (
                        <button 
                            type="submit"
                            className="bg-yellow-200 px-4 py-2 rounded flex items-center"
                        >
                            전송
                            <span role="img" aria-label="send" className="ml-1">🐤</span>
                        </button>
                    )}
                </form>
            </div>
        </div>
    );

    // 2. 최종 결과 화면 - 게임 화면과 동일한 스타일로 수정
    const renderResultScreen = () => (
        <div className="w-[95%] md:w-[85%] lg:w-[80%] h-full">
            <div className="w-full py-2 text-center">
                <h1 className="text-2xl invisible">빈 공간</h1>
            </div>
            
            {/* 게임 정보 박스 - 최종 결과 표시 */}
            <div className="w-10/12 mx-auto bg-[#FAD0C4] p-4 rounded min-h-32 flex items-center justify-center">
                <h2 className="text-5xl font-bold">최종 결과</h2>
            </div>
            
            {/* 고양이 캐릭터 그리드 - 게임 화면과 동일하게 수정 */}
            <div className="w-10/12 mx-auto bg-white p-2 grid grid-cols-3 sm:grid-cols-6 gap-2 overflow-visible min-h-[100px] sm:min-h-[130px] relative z-10">
                {cats.map(cat => (
                    <div key={cat.id} className="flex flex-col items-center overflow-visible p-1">
                        <h3 className="text-xs font-medium mb-1">{cat.name}</h3>
                        <div className="w-full h-full max-w-[85px] max-h-[85px] bg-white p-0">
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                        </div>
                        <p className="text-center text-sm font-bold mt-1">{cat.points}</p>
                    </div>
                ))}
            </div>
            
            {/* 채팅 기록 섹션 - 입력창 없음 */}
            <div className="w-10/12 mx-auto bg-[#FAD0C4] p-4 flex flex-col">
                {/* 채팅 메시지 영역만 표시 */}
                <div className="bg-white p-3 rounded h-[140px] overflow-y-auto mb-2"> 
                    {messages.map((msg, index) => (
                        <p key={index} className="mb-1">{msg.text}</p>
                    ))}
                </div>
                
                {/* 메인으로 돌아가기 버튼 - 전송 버튼 대신 표시 */}
                <div className="flex justify-end mt-2">
                    <button 
                        onClick={goToMainPage}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded font-medium"
                    >
                        메인으로
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div 
            className="w-full h-full flex flex-col items-center justify-center relative"
            style={{
                backgroundImage: `url(${Background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            {gameState === "playing" && renderGameScreen()}
            {gameState === "result" && renderResultScreen()}
        </div>
    );
};

export default SurvivalPage;