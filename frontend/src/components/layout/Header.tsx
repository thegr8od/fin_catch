import { useNavigate } from "react-router-dom";
import { useUserInfo } from "../../hooks/useUserInfo";

const Header: React.FC = () => {
  const { user, loading } = useUserInfo();
  const navigate = useNavigate();
  const isLoggedIn = !!user;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");

    window.dispatchEvent(new CustomEvent("beforePageChange"));

    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 10);

    window.location.reload();
  };

  const handleShopClick = () => {
    window.dispatchEvent(new CustomEvent("beforePageChange"));

    setTimeout(() => {
      navigate("/shop", { replace: true });
    }, 10);
  };

  const handleMyPageClick = () => {
    if (!user) return;
    // 페이지 이동 전에 이벤트 발생시켜 다른 컴포넌트들이 정리될 수 있도록 함
    window.dispatchEvent(new CustomEvent("beforePageChange"));

    // 약간의 지연 후 페이지 이동
    setTimeout(() => {
      navigate(`/${user.nickname}`, { replace: true });
    }, 10);
  };

  const handleMainClick = () => {
    // 페이지 이동 전에 이벤트 발생시켜 다른 컴포넌트들이 정리될 수 있도록 함
    window.dispatchEvent(new CustomEvent("beforePageChange"));

    // 약간의 지연 후 페이지 이동
    setTimeout(() => {
      navigate("/main", { replace: true });
    }, 10);
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
