import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../components/common/LoadingScreen";
import axiosInstance from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * 소셜 로그인 리다이렉트 처리 페이지
 * 백엔드 API를 호출하여 토큰을 받아오고, 저장한 후 메인 페이지로 리다이렉트합니다.
 */
const OAuthRedirectPage = () => {
  const { setAuthState } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 현재 URL과 쿠키 확인
    console.log("현재 URL:", window.location.href);
    console.log("현재 경로:", location.pathname);
    console.log("현재 검색 파라미터:", location.search);
    console.log("현재 쿠키:", document.cookie);

    // JSESSIONID 쿠키 확인
    const cookies = document.cookie.split(";");
    const sessionCookie = cookies.find((cookie) => cookie.trim().startsWith("JSESSIONID="));
    console.log("세션 쿠키:", sessionCookie);

    // URL 파라미터 확인
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const success = urlParams.get("success") === "true";

    console.log("URL 파라미터:", { code, state, success });

    // 소셜 로그인 성공 후 토큰 요청
    const fetchToken = async () => {
      try {
        console.log("토큰 요청 시작");

        // API 호출하여 토큰 받아오기 (withCredentials 옵션 추가)
        const response = await axiosInstance.get("/api/member/public/reissue", {
          withCredentials: true,
          params: code ? { code } : undefined,
        });

        const data = response.data;
        console.log("API 응답 받음:", data);

        if (data && data.isSuccess && data.result && data.result.accessToken) {
          const accessToken = data.result.accessToken;
          console.log("토큰 추출 성공:", accessToken);

          // 액세스 토큰을 로컬 스토리지에 저장
          localStorage.setItem("accessToken", accessToken);
          console.log("토큰 저장 완료");

          // tokenChange 이벤트 발생
          window.dispatchEvent(new Event("tokenChange"));

          // 인증 상태 설정
          setAuthState(accessToken);
          console.log("인증 상태 설정 완료");

          // 메인 페이지로 이동
          navigate("/main", { replace: true });
        } else {
          console.error("토큰을 찾을 수 없습니다:", data);
          setError("토큰을 찾을 수 없습니다. 다시 로그인해주세요.");

          // 3초 후 로그인 페이지로 이동
          setTimeout(() => {
            navigate("/signin", { replace: true });
          }, 3000);
        }
      } catch (error) {
        console.error("토큰 요청 중 오류 발생:", error);
        setError("로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");

        // 3초 후 로그인 페이지로 이동
        setTimeout(() => {
          navigate("/signin", { replace: true });
        }, 3000);
      }
    };

    // 토큰 요청 실행
    fetchToken();
  }, [setAuthState, navigate, location]);

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
