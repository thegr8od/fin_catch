import { Link } from "react-router-dom";
import Background from "../components/layout/Background";
import mainBg from "../assets/main.gif";

const SplashPage = () => {
  return (
    <Background backgroundImage={mainBg}>
      {/* 콘텐츠 컨테이너 */}
      <div className="w-full h-full flex flex-col items-center justify-between relative z-10 py-20">
        <h1 className="text-4xl md:text-5xl text-white font-bold mt-20 tracking-wider text-shadow-lg animate-glitch">Fin Catch</h1>

        <div className="w-full max-w-xs px-6 flex flex-col items-center mb-20">
          <Link to="/login" className="w-full py-3 bg-yellow-400 text-black text-sm flex items-center justify-center rounded-none border border-gray-300 pixel-button">
            <span className="mr-2">▶</span>
            <span>START</span>
          </Link>
        </div>
      </div>
    </Background>
  );
};

export default SplashPage;
