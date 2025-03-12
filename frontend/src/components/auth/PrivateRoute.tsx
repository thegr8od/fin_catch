import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { useEffect } from "react";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      // 현재 경로를 state로 전달하여 로그인 후 원래 가려던 페이지로 리다이렉트할 수 있도록 함
      navigate("/signin", { state: { from: location }, replace: true });
    }
  }, [user, navigate, location]);

  // user가 없을 때는 null을 반환하여 깜빡임 방지
  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default PrivateRoute;
