import Background from "../components/layout/Background";
import { Link } from "react-router-dom";

const MainPage = () => {
  return (
    <Background>
      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
        <div className="w-full max-w-xs px-6 flex flex-col items-center">
          <div className="bg-form-color backdrop-blur-sm p-8 rounded-lg border-4 border-gray-600 w-full pixel-border">
            <h2 className="text-2xl text-center text-white mb-6 font-korean-pixel">메인 페이지</h2>
            <p className="text-white text-center mb-4 font-korean-pixel">로그인에 성공하셨습니다!</p>
            <Link to="/" className="w-full py-3 bg-blue-600 text-white text-sm flex items-center justify-center rounded-none border border-gray-300 pixel-button mt-4">
              <span className="font-korean-pixel">로그아웃</span>
            </Link>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default MainPage;
