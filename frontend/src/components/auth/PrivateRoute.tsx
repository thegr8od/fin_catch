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

    const checkAuth = async () => {
      if (!loading) {
        if (!token) {
          navigate("/signin", { state: { from: location }, replace: true });
        } else if (!user) {
          console.log("토큰은 있지만 사용자 정보가 없어서 정보 요청");
          try {
            await fetchUserInfo();
          } catch (error) {
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
    return <LoadingScreen />;
  }

  // 사용자 정보가 있으면 children을 렌더링
  if (user) {
    return <>{children}</>;
  }

  // 사용자 정보가 없으면 null 반환 (useEffect에서 리다이렉트 처리)
  return null;
};

export default PrivateRoute;
