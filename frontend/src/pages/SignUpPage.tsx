import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Background from "../components/layout/Background";
import mainBg from "../assets/main.gif";
// 회원가입 페이지용 배경 이미지 import (예시)

const SignUpPage = () => {
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 닉네임 제출 로직 구현
    console.log("닉네임 제출:", nickname);

    // 닉네임을 localStorage에 저장
    localStorage.setItem("userNickname", nickname);
    localStorage.setItem("isLoggedIn", "true");

    // 실제로는 여기서 API 호출하여 닉네임 저장
    // 지금은 DB가 없으므로 바로 메인 페이지로 이동
    alert(`${nickname}님, 환영합니다!`);
    navigate("/main");
  };

  return (
    <Background backgroundImage={mainBg}>
      <div className="w-full h-full flex flex-col items-center justify-center relative z-10">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl text-white font-bold mb-10 tracking-wider text-shadow-lg animate-glitch">Fin Catch</h1>

          <div className="w-full max-w-sm px-6 flex flex-col items-center">
            <div className="bg-form-color rounded-lg p-8">
              <h2 className="text-2xl text-center text-black mb-6">Sign Up</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="nickname" className="block text-gray-600 mb-2 font-korean-pixel">
                    닉네임을 입력해주세요.
                  </label>
                  <input
                    type="text"
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full p-3 bg-gray-700 text-white border-2 border-gray-600 rounded font-korean-pixel"
                    placeholder="닉네임"
                    required
                    minLength={2}
                    maxLength={10}
                  />
                  <p className="text-gray-400 text-xs mt-1 font-korean-pixel">2~10자 이내로 입력해주세요</p>
                </div>
                <div>
                  <button type="submit" className="w-full py-4 bg-signup-color text-black text-base flex items-center justify-center rounded-md border border-gray-300 pixel-button mt-10">
                    <span>START</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default SignUpPage;
