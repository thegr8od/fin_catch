import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 상태 확인 함수
  const checkLoginStatus = () => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userNickname = localStorage.getItem("userNickname") || "";

    console.log("로그인 상태 확인:", loggedIn, userNickname);

    setIsLoggedIn(loggedIn);
    setNickname(userNickname);
  };

  // 컴포넌트가 마운트될 때와 location이 변경될 때마다 로그인 상태 확인
  useEffect(() => {
    checkLoginStatus();
  }, [location]);

  // 주기적으로 로그인 상태 확인 (1초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      checkLoginStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    // 로그아웃 시 localStorage에서 사용자 정보 삭제
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userNickname");

    setIsLoggedIn(false);
    setNickname("");

    // 로그아웃 후 로그인 페이지로 이동
    navigate("/login");
  };

  const handleShopClick = () => {
    // 상점 페이지로 이동
    navigate("/shop");
  };

  return (
    <header className="bg-gray-800 text-white py-2 px-4 fixed top-0 w-full z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {isLoggedIn && (
            <div className="flex items-center bg-gray-700 px-3 py-1 rounded-md">
              <span className="font-korean-pixel text-sm mr-2">유저:</span>
              <span className="font-korean-pixel text-sm font-bold">{nickname}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {isLoggedIn && (
            <>
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
