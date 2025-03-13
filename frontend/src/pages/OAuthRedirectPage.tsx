import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../components/common/LoadingScreen";
import axiosInstance from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/userSlice";

/**
 * 소셜 로그인 리다이렉트 처리 페이지
 * 백엔드 API를 호출하여 토큰을 받아오고, 저장한 후 메인 페이지로 리다이렉트합니다.
 */
const OAuthRedirectPage = () => {
  const { setAuthState } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        // URL 파라미터 확인 및 로깅
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get("code");
        console.log("인증 코드:", code);

        // API 요청 설정 로깅
        const requestConfig = {
          withCredentials: true,
          params: code ? { code } : undefined,
        };
        console.log("API 요청 설정:", requestConfig);

        // 토큰 요청
        console.log("토큰 요청 시작 - /api/member/public/reissue");
        const response = await axiosInstance.get("/api/member/public/reissue", requestConfig);
        console.log("토큰 응답 전체:", response);

        const data = response.data;
        console.log("토큰 응답 데이터:", data);

        if (data && data.isSuccess && data.result && data.result.accessToken) {
          const accessToken = data.result.accessToken;
          console.log("액세스 토큰 추출 성공:", accessToken);

          // 토큰 저장
          localStorage.setItem("accessToken", accessToken);
          console.log("로컬 스토리지에 토큰 저장 완료");

          // axiosInstance 헤더 설정
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
          console.log("axios 인스턴스 헤더 설정 완료");

          try {
            console.log("사용자 정보 요청 시작 - /api/member/myinfo");
            const userResponse = await axiosInstance.get("/api/member/myinfo");
            console.log("사용자 정보 응답:", userResponse);

            if (userResponse.data && userResponse.data.isSuccess) {
              console.log("사용자 정보 추출 성공:", userResponse.data.result);
              dispatch(setUser(userResponse.data.result));
              setAuthState(accessToken);
              console.log("Redux store에 사용자 정보 저장 완료");

              console.log("메인 페이지로 이동");
              navigate("/main", { replace: true });
            } else {
              throw new Error("사용자 정보 응답이 올바르지 않습니다.");
            }
          } catch (userError) {
            console.error("사용자 정보 요청 실패:", userError);
            localStorage.removeItem("accessToken");
            setError("사용자 정보를 가져오는데 실패했습니다.");
            navigate("/signin", { replace: true });
          }
        } else {
          throw new Error("토큰 응답이 올바르지 않습니다.");
        }
      } catch (error: any) {
        console.error("인증 처리 중 오류 발생:", error);
        console.error("오류 상세:", error.response?.data);
        setError("로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
        navigate("/signin", { replace: true });
      }
    };

    fetchToken();
  }, [setAuthState, navigate, location, dispatch]);

  // 로딩 화면 또는 오류 메시지 표시
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center">
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">오류 발생!</strong>
          <span className="block sm:inline"> {error}</span>
          <p className="mt-2">잠시 후 로그인 페이지로 이동합니다...</p>
        </div>
      ) : (
        <LoadingScreen />
      )}
    </div>
  );
};

export default OAuthRedirectPage;
