import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import SplashPage from "./pages/SplashPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import LobbyPage from "./pages/LobbyPage";
import ShopPage from "./pages/ShopPage";
import OneToOnePage from "./pages/OneToOnePage";
import SurvivalPage from "./pages/SurvivalPage";
import BotPage from "./pages/BotPage";
import MainPage from "./pages/MainPage";
import AiQuizPage from "./pages/AiQuizPage";
import RoomPreparePage from "./pages/RoomPreparePage";
import { LoadingProvider, useLoading } from "./contexts/LoadingContext";
import LoadingScreen from "./components/common/LoadingScreen";
import OAuthRedirectPage from "./pages/OAuthRedirectPage";
import PrivateRoute from "./components/auth/PrivateRoute";

/**
 * 라우트 변경 감지 및 로딩 상태 초기화 컴포넌트
 * 페이지 이동 시 로딩 상태를 초기화하고 무한 로딩 상태를 방지하는 안전장치 제공
 *
 * @returns {null} - 렌더링하지 않는 컴포넌트
 */
const RouteChangeHandler = () => {
  const location = useLocation(); // 현재 라우트 위치 정보
  const navigate = useNavigate(); // 라우트 네비게이션 함수
  const { setLoading, completeLoading } = useLoading(); // 로딩 상태 관리 훅

  useEffect(() => {
    console.log("라우트 변경 감지:", location.pathname);

    // 라우트가 변경될 때마다 로딩 상태 초기화
    setLoading(false);
    completeLoading();

    // 디버깅용 - 로딩 상태가 해제되지 않으면 강제로 새로고침
    const forceRefreshTimer = setTimeout(() => {
      const loadingElement = document.querySelector(".fixed.inset-0.flex.items-center.justify-center.bg-black");
      if (loadingElement) {
        console.log("로딩 화면이 30초 이상 표시됨, 강제 새로고침");
        window.location.reload();
      }
    }, 30000);

    return () => {
      clearTimeout(forceRefreshTimer);
    };
  }, [location.pathname, setLoading, completeLoading]);

  return null;
};

/**
 * 앱 콘텐츠 컴포넌트
 * 애플리케이션의 주요 레이아웃과 라우팅 구조를 정의
 *
 * @returns {JSX.Element} - 앱 콘텐츠 컴포넌트
 */
function AppContent() {
  return (
    <>
      {/* 전역 로딩 화면 - 최상위에 배치하여 모든 컴포넌트보다 위에 표시 */}
      <LoadingScreen />

      <div className="w-full h-screen overflow-hidden relative">
        <div className="w-full h-full flex flex-col">
          {/* 헤더 컴포넌트 */}
          <Header />

          {/* 라우트 변경 감지 컴포넌트 */}
          <RouteChangeHandler />

          {/* 메인 콘텐츠 영역 */}
          <div className="flex-grow pt-12">
            <Routes>
              {/* 공개 라우트 */}
              <Route path="/" element={<SplashPage />} />
              <Route path="/signin" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/oauth/redirect" element={<OAuthRedirectPage />} />

              {/* 보호된 라우트 */}
              <Route
                path="/lobby"
                element={
                  <PrivateRoute>
                    <LobbyPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/main"
                element={
                  <PrivateRoute>
                    <MainPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/shop"
                element={
                  <PrivateRoute>
                    <ShopPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/room/prepare/:roomId"
                element={
                  <PrivateRoute>
                    <RoomPreparePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/one-to-one"
                element={
                  <PrivateRoute>
                    <OneToOnePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/one-to-one/:category"
                element={
                  <PrivateRoute>
                    <OneToOnePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/game/survival"
                element={
                  <PrivateRoute>
                    <SurvivalPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/game/bot"
                element={
                  <PrivateRoute>
                    <BotPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ai-quiz"
                element={
                  <PrivateRoute>
                    <AiQuizPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </div>

          {/* 푸터 컴포넌트 */}
          <div className="absolute bottom-0 w-full z-20">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * 앱 루트 컴포넌트
 * 전체 애플리케이션의 진입점으로, 로딩 컨텍스트와 라우터를 설정
 *
 * @returns {JSX.Element} - 앱 루트 컴포넌트
 */
function App() {
  return (
    <LoadingProvider>
      <Router>
        <AppContent />
      </Router>
    </LoadingProvider>
  );
}

export default App;
