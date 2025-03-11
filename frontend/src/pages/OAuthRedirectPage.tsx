import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../components/common/LoadingScreen";
import axiosInstance from "../api/axios";

/**
 * 소셜 로그인 리다이렉트 처리 페이지
 * 백엔드 API를 호출하여 토큰을 받아오고, 저장한 후 메인 페이지로 리다이렉트합니다.
 */
const OAuthRedirectPage = () => {
  const { setAuthState } = useAuth();

  useEffect(() => {
    const fetchToken = async () => {
      try {
        console.log("토큰 요청 시작");

        // API 호출하여 토큰 받아오기
        const response = await axiosInstance.get("/api/member/public/reissue", {
          withCredentials: true, // 쿠키 포함
        });

        const data = response.data;
        console.log("API 응답 받음");

        if (data && data.isSuccess && data.result && data.result.accessToken) {
          const accessToken = data.result.accessToken;
          console.log("토큰 추출 성공");

          // 액세스 토큰을 로컬 스토리지에 저장
          localStorage.setItem("accessToken", accessToken);

          // 인증 상태 설정
          setAuthState(accessToken);

          // 메인 페이지로 리다이렉트
          window.location.href = "/main";
        } else {
          console.error("토큰을 찾을 수 없습니다:", data);
          // 로그인 페이지로 리다이렉트
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("토큰 요청 중 오류 발생:", error);
        // 로그인 페이지로 리다이렉트
        window.location.href = "/login";
      }
    };

    fetchToken();
  }, [setAuthState]);

  // 로딩 화면만 표시하고 실제 콘텐츠는 없음
  return <LoadingScreen />;
};

export default OAuthRedirectPage;
