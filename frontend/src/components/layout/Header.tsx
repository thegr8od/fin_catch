import { useNavigate } from "react-router-dom";
import { useUserInfo } from "../../hooks/useUserInfo";
import { useAuth } from "../../hooks/useAuth";
import { useGameExit, getCurrentGameState } from "../../hooks/useGameExit";

const Header: React.FC = () => {
  const { user, loading, clearUserInfo } = useUserInfo();
  const navigate = useNavigate();
  const isLoggedIn = !!user;
  const { logout } = useAuth();
  const { showExitWarning } = useGameExit();

  const checkAndNavigate = async (path: string) => {
    const gameState = getCurrentGameState();
    if (gameState.isInGame) {
      const shouldExit = await showExitWarning();
      if (!shouldExit) return;
    }
    window.dispatchEvent(new CustomEvent("beforePageChange"));
    setTimeout(() => {
      navigate(path, { replace: true });
    }, 10);
  };

  const handleLogout = async () => {
    const gameState = getCurrentGameState();
    if (gameState.isInGame) {
      const shouldExit = await showExitWarning();
      if (!shouldExit) return;
    }
    clearUserInfo();
    logout();
    window.dispatchEvent(new CustomEvent("beforePageChange"));
    navigate("/signin", { replace: true });
  };

  const handleShopClick = () => {
    checkAndNavigate("/shop");
  };

  const handleMyPageClick = () => {
    if (!user) return;
    checkAndNavigate("/main");
  };

  const handleMainClick = () => {
    checkAndNavigate("/main");
  };

  // 로그인 상태 확인 함수
  // 컴포넌트가 마운트될 때 로그인 상태 확인
  return (
    <header className="bg-gray-800 text-white py-2 px-4 fixed top-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {isLoggedIn && (
            <div className="flex items-center bg-gray-700 px-3 py-1 rounded-md">
              <span className="font-korean-pixel text-sm mr-2">유저:</span>
              <button onClick={handleMyPageClick} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-korean-pixel flex items-center">
                <span className="font-korean-pixel text-sm font-bold">{loading ? "로딩 중..." : user?.nickname}</span>
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {isLoggedIn && (
            <>
              <button onClick={handleMainClick} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-korean-pixel flex items-center">
                <span>메인</span>
              </button>
              <button onClick={handleShopClick} className="text-sm bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded font-korean-pixel flex items-center">
                <span>상점</span>
              </button>
              <button onClick={handleLogout} className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-korean-pixel">
                로그아웃
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
