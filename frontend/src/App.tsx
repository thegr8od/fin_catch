import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SplashPage from "./pages/SplashPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import MainPage from "./pages/MainPage";
import ShopPage from "./pages/ShopPage";
import SurvivalPage from "./pages/SurvivalPage";
function App() {
  return (
    <div className="w-full h-screen overflow-hidden relative">
      <Router>
        <div className="w-full h-full flex flex-col">
          <Header />
          <div className="flex-grow pt-12">
            <Routes>
              <Route path="/" element={<SplashPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/main" element={<MainPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/game/:mode" element={<SurvivalPage />} />
            </Routes>
          </div>
          <div className="absolute bottom-0 w-full z-20">
            <Footer />
          </div>
        </div>
      </Router>
    </div>
  );
}

export default App;
