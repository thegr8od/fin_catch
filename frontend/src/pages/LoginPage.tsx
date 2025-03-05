import { useNavigate } from "react-router-dom";
import Background from "../components/layout/Background";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleSocialLogin = () => {
    // 실제로는 소셜 로그인 API 호출 후 결과에 따라 처리
    // 지금은 DB가 없으므로 바로 회원가입 페이지로 이동
    navigate("/signup");
  };

  return (
    <Background>
      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold mb-10 tracking-wider text-shadow-lg animate-glitch">Fin Catch</h1>

          <div className="w-full max-w-sm px-6 flex flex-col items-center space-y-6">
            <button onClick={handleSocialLogin} className="w-full py-4 bg-kakao text-black text-base flex items-center justify-center rounded-none border border-gray-300 pixel-button">
              <span className="mr-2 text-xl">🗨️</span>
              <span className="font-korean-pixel">카카오 로그인</span>
            </button>

            <button onClick={handleSocialLogin} className="w-full py-4 bg-white text-gray-600 text-base flex items-center justify-center rounded-none border border-gray-300 pixel-button">
              <span className="mr-2 text-xl text-[#4285F4] font-bold">G</span>
              <span className="font-korean-pixel">구글 로그인</span>
            </button>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default LoginPage;
