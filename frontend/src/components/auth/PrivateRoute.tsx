import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useEffect } from "react";
import { useUserInfo } from "../../hooks/useUserInfo";
import LoadingScreen from "../common/LoadingScreen";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, fetchUserInfo } = useUserInfo(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    console.log("PrivateRoute - 현재 상태:", { user, loading, token });

    const checkAuth = async () => {
      if (!loading) {
        if (!token) {
          console.log("토큰이 없어서 로그인 페이지로 이동");
          navigate("/signin", { state: { from: location }, replace: true });
        } else if (!user) {
          console.log("토큰은 있지만 사용자 정보가 없어서 정보 요청");
          try {
            await fetchUserInfo();
          } catch (error) {
            console.error("사용자 정보 요청 실패:", error);
            localStorage.removeItem("accessToken");
            navigate("/signin", { state: { from: location }, replace: true });
          }
        }
      }
    };

    checkAuth();
  }, [navigate, location, loading, user, fetchUserInfo]);

  // 로딩 중일 때는 로딩 화면을 보여줌
  if (loading) {
    console.log("PrivateRoute - 로딩 중");
    return <LoadingScreen />;
  }

  // 사용자 정보가 있으면 children을 렌더링
  if (user) {
    console.log("PrivateRoute - 사용자 인증됨, 컨텐츠 표시");
    return <>{children}</>;
  }

  // 사용자 정보가 없으면 null 반환 (useEffect에서 리다이렉트 처리)
  console.log("PrivateRoute - 사용자 정보 없음");
  return null;
};

export default PrivateRoute;
