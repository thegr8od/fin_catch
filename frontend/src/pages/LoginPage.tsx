import { useNavigate } from "react-router-dom";
import Background from "../components/layout/Background";
import mainBg from "../assets/main.gif";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const navigate = useNavigate();

  const [showNicknameAlert, setShowNicknameAlert] = useState(false);

  const { loginWithKakao, loginWithGoogle, isAuthenticated, loading, error } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // 로컬 스토리지에서 이전에 로그인한 적이 있는지 확인
      const hasLoggedInBefore = localStorage.getItem("hasLoggedInBefore");

      if (!hasLoggedInBefore) {
        // 처음 로그인하는 경우에만 모달 표시
        setShowNicknameAlert(true);
        // 로그인 이력 저장
        localStorage.setItem("hasLoggedInBefore", "true");

        // 일정 시간 후 메인 페이지로 이동
        const timer = setTimeout(() => {
          navigate("/main");
        }, 2000);

        return () => clearTimeout(timer);
      } else {
        // 이전에 로그인한 적이 있으면 바로 메인 페이지로 이동
        navigate("/main");
      }
    }
  }, [isAuthenticated, navigate]);

  const handleKakaoLogin = () => {
    try {
      loginWithKakao();
    } catch (err) {
      console.error("로그인 중 에러 발생: ", err);
    }
  };

  const handleGoogleLogin = () => {
    try {
      loginWithGoogle();
    } catch (err) {
      console.error("로그인 중 오류 발생: ", err);
    }
  };

  return (
    <Background backgroundImage={mainBg}>
      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold mb-10 tracking-wider text-shadow-lg animate-glitch">Fin Catch</h1>
          {error && <div className="bg-red text-white p-3 mb-4 rounded-none pixel-border font-korean-pixel">로그인 중 오류가 발생 했습니다: {error}</div>}
          <div className="w-full max-w-sm px-6 flex flex-col items-center space-y-6">
            <button
              onClick={handleKakaoLogin}
              disabled={loading}
              className="w-full py-4 bg-kakao text-black text-base flex items-center justify-center rounded-none border border-gray-300 pixel-button"
            >
              <span className="mr-2 text-xl">🗨️</span>
              <span className="font-korean-pixel">{loading ? "처리 중..." : "카카오 로그인"}</span>
            </button>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 bg-white text-gray-600 text-base flex items-center justify-center rounded-none border border-gray-300 pixel-button"
            >
              <span className="mr-2 text-xl text-[#4285F4] font-bold">G</span>
              <span className="font-korean-pixel">{loading ? "처리 중..." : "구글 로그인"}</span>
            </button>
          </div>
        </div>
      </div>

      {showNicknameAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-none max-w-md pixel-border">
            <h2 className="text-xl font-bold mb-3 font-korean-pixel">환영합니다!</h2>
            <p className="mb-4 font-korean-pixel">랜덤 닉네임이 생성되었습니다. 필요하시면 프로필에서 변경해주세요.</p>
            <button
              onClick={() => {
                setShowNicknameAlert(false);
                navigate("/main");
              }}
              className="w-full py-2 bg-blue-500 text-white font-korean-pixel pixel-button"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </Background>
  );
};

export default LoginPage;
