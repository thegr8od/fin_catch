import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SplashPage from "./pages/SplashPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import Footer from "./components/layout/Footer";
import MainPage from "./pages/MainPage";
function App() {
  return (
    <div className="w-full h-screen overflow-hidden relative">
      <Router>
        <div className="w-full h-full flex flex-col">
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<SplashPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/main" element={<MainPage />} />
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
