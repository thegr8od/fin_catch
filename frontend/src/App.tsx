import "./App.css";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import SplashPage from "./pages/SplashPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import MainPage from "./pages/MainPage";
import ShopPage from "./pages/ShopPage";
import OneToOnePage from "./pages/OneToOnePage";
import SurvivalPage from "./pages/SurvivalPage";
import BotPage from "./pages/BotPage";
import MyPage from "./pages/MyPage";
import RoomPreparePage from "./pages/RoomPreparePage";
import { LoadingProvider, useLoading } from "./contexts/LoadingContext";
import LoadingScreen from "./components/common/LoadingScreen";

// 라우트 변경 시 로딩 상태를 초기화하는 컴포넌트
const RouteChangeHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setLoading, completeLoading } = useLoading();

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

function AppContent() {
  return (
    <>
      {/* 전역 로딩 화면 - 최상위에 배치하여 모든 컴포넌트보다 위에 표시 */}
      <LoadingScreen />

      <div className="w-full h-screen overflow-hidden relative">
        <div className="w-full h-full flex flex-col">
          <Header />
          <RouteChangeHandler />
          <div className="flex-grow pt-12">
            <Routes>
              <Route path="/" element={<SplashPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/main" element={<MainPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/room/prepare/:roomId" element={<RoomPreparePage />} />
              <Route path="/one-to-one" element={<OneToOnePage />} />
              <Route path="/one-to-one/:category" element={<OneToOnePage />} />
              <Route path="/game/survival" element={<SurvivalPage />} />
              <Route path="/game/bot" element={<BotPage />} />
              <Route path="/:nickname" element={<MyPage />} />
            </Routes>
          </div>
          <div className="absolute bottom-0 w-full z-20">
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}

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
