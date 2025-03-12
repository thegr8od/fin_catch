import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../components/common/LoadingScreen";
import axiosInstance from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

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
    // 현재 URL 확인
    console.log("현재 URL:", window.location.href);
    console.log("현재 경로:", location.pathname);
    console.log("현재 검색 파라미터:", location.search);

    // URL 파라미터 확인
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const success = urlParams.get("success") === "true";
    const accessToken = urlParams.get("accessToken");

    console.log("URL 파라미터:", { code, state, success, accessToken });

    // 액세스 토큰이 URL에 있는 경우 처리
    if (accessToken) {
      console.log("URL에서 액세스 토큰 발견:", accessToken);

      // 액세스 토큰을 로컬 스토리지에 저장
      localStorage.setItem("accessToken", accessToken);
      console.log("토큰 저장 완료");

      // 인증 상태 설정
      setAuthState(accessToken);
      console.log("인증 상태 설정 완료");

      // 메인 페이지로 리다이렉트
      console.log("메인 페이지로 리다이렉트");
      navigate("/main", { replace: true });
      return;
    }

    // success=true 파라미터가 있는 경우 직접 메인 페이지로 이동 시도
    if (success && !code) {
      console.log("성공 파라미터 감지, 토큰 요청 시도");

      // 백엔드에서 토큰 가져오기 시도
      const getTokenWithSuccess = async () => {
        try {
          // 직접 axios로 토큰 요청
          const response = await axios.get("http://192.168.100.119:8080/api/member/public/reissue", {
            params: { success: true },
            timeout: 15000,
            headers: {
              "Content-Type": "application/json",
            },
          });

          console.log("성공 파라미터로 토큰 요청 응답:", response.data);

          if (response.data && response.data.isSuccess && response.data.result && response.data.result.accessToken) {
            const accessToken = response.data.result.accessToken;
            console.log("토큰 추출 성공:", accessToken);

            // 액세스 토큰을 로컬 스토리지에 저장
            localStorage.setItem("accessToken", accessToken);
            console.log("토큰 저장 완료");

            // 인증 상태 설정
            setAuthState(accessToken);
            console.log("인증 상태 설정 완료");

            // 메인 페이지로 리다이렉트
            console.log("메인 페이지로 리다이렉트");
            navigate("/main", { replace: true });
          } else {
            console.error("토큰을 찾을 수 없습니다:", response.data);
            setError("토큰을 찾을 수 없습니다. 다시 로그인해주세요.");

            // 3초 후 로그인 페이지로 리다이렉트
            setTimeout(() => {
              navigate("/signin", { replace: true });
            }, 3000);
          }
        } catch (error: any) {
          console.error("성공 파라미터로 토큰 요청 중 오류:", error);
          setError("로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");

          // 3초 후 로그인 페이지로 리다이렉트
          setTimeout(() => {
            navigate("/signin", { replace: true });
          }, 3000);
        }
      };

      getTokenWithSuccess();
      return;
    }

    // 파라미터가 없는 경우 로그인 페이지로 리다이렉트
    if (!code && !success) {
      console.log("리다이렉트 파라미터가 없음, 로그인 페이지로 이동");
      navigate("/signin", { replace: true });
      return;
    }

    // 소셜 로그인 성공 후 토큰 요청
    const fetchToken = async () => {
      try {
        console.log("토큰 요청 시작");
        console.log("현재 코드:", code);
        console.log("현재 상태:", state);
        console.log("성공 여부:", success);

        // 직접 axios 인스턴스로 호출 시도
        console.log("직접 axios 호출 시도");

        // API 요청 URL 및 파라미터 구성
        let apiUrl = "http://192.168.100.119:8080/api/member/public/reissue";
        let params = {};

        if (code) {
          params = { code };
          console.log("코드 파라미터 추가:", params);
        }

        if (state) {
          params = { ...params, state };
          console.log("상태 파라미터 추가:", params);
        }

        console.log("최종 API 요청 URL:", apiUrl);
        console.log("최종 API 요청 파라미터:", params);

        // API 호출하여 토큰 받아오기
        const response = await axios.get(apiUrl, {
          params,
          timeout: 15000,
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("API 응답 상태:", response.status);
        console.log("API 응답 헤더:", response.headers);
        console.log("API 응답 데이터:", response.data);

        const data = response.data;

        if (data && data.isSuccess && data.result && data.result.accessToken) {
          const accessToken = data.result.accessToken;
          console.log("토큰 추출 성공:", accessToken);

          // 액세스 토큰을 로컬 스토리지에 저장
          localStorage.setItem("accessToken", accessToken);
          console.log("토큰 저장 완료");

          // 인증 상태 설정
          setAuthState(accessToken);
          console.log("인증 상태 설정 완료");

          // 메인 페이지로 리다이렉트
          console.log("메인 페이지로 리다이렉트");
          navigate("/main", { replace: true });
        } else {
          console.error("토큰을 찾을 수 없습니다:", data);
          setError("토큰을 찾을 수 없습니다. 다시 로그인해주세요.");

          // 3초 후 로그인 페이지로 리다이렉트
          setTimeout(() => {
            navigate("/signin", { replace: true });
          }, 3000);
        }
      } catch (error: any) {
        console.error("토큰 요청 중 오류 발생:", error);

        // 오류 객체 상세 정보 출력
        if (error.response) {
          // 서버 응답이 있는 경우
          console.error("서버 응답 상태:", error.response.status);
          console.error("서버 응답 헤더:", error.response.headers);
          console.error("서버 응답 데이터:", error.response.data);
        } else if (error.request) {
          // 요청은 보냈지만 응답이 없는 경우
          console.error("응답 없음 (네트워크 문제):", error.request);
        } else {
          // 요청 설정 중 오류 발생
          console.error("요청 설정 오류:", error.message);
        }

        console.error("오류 스택:", error.stack);

        setError("로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");

        // 3초 후 로그인 페이지로 리다이렉트
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
