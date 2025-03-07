import { useNavigate } from "react-router-dom";
import Background from "../components/layout/Background";
import mainBg from "../assets/main.gif";

const LoginPage = () => {
  const navigate = useNavigate();

  const handleSocialLogin = (provider: string) => {
    // 실제로는 소셜 로그인 API 호출 후 결과에 따라 처리
    console.log(`${provider} 로그인 시도`);

    // 테스트를 위해 임시 사용자 정보 설정 (실제로는 API 응답으로 처리)
    const tempNickname = `${provider}사용자`;
    localStorage.setItem("userNickname", tempNickname);
    localStorage.setItem("isLoggedIn", "true");

    // 메인 페이지로 이동
    navigate("/main");
  };

  return (
    <Background backgroundImage={mainBg}>
      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold mb-10 tracking-wider text-shadow-lg animate-glitch">Fin Catch</h1>

          <div className="w-full max-w-sm px-6 flex flex-col items-center space-y-6">
            <button onClick={() => handleSocialLogin("카카오")} className="w-full py-4 bg-kakao text-black text-base flex items-center justify-center rounded-none border border-gray-300 pixel-button">
              <span className="mr-2 text-xl">🗨️</span>
              <span className="font-korean-pixel">카카오 로그인</span>
            </button>

            <button
              onClick={() => handleSocialLogin("구글")}
              className="w-full py-4 bg-white text-gray-600 text-base flex items-center justify-center rounded-none border border-gray-300 pixel-button"
            >
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
