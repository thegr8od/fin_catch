import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../api/axios";

// 모든 쿠키 출력 (디버깅용)
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 초기화 및 토큰 확인
  useEffect(() => {
    console.log("인증 상태 초기화");

    // 로컬 스토리지에서 토큰 확인
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      setAuthState(accessToken);
    }
  }, []);

  // 카카오 로그인 함수
  const loginWithKakao = useCallback(() => {
    setLoading(true);

    try {
      // 카카오 로그인 페이지로 리다이렉트 (백엔드 서버 직접 호출)
      // 백엔드에서 설정한 기본 리다이렉트 URL 사용
      const redirectUri = encodeURIComponent(window.location.origin + "/login");
      console.log("카카오 로그인 리다이렉트 URL:", redirectUri);
      window.location.href = `http://192.168.100.119:8080/oauth2/authorization/kakao?redirect_uri=${redirectUri}`;
      return { success: true };
    } catch (err) {
      setError("카카오 로그인을 시작하는 중 오류가 발생했습니다.");
      return { success: false, error: "카카오 로그인을 시작하는 중 오류가 발생했습니다." };
    } finally {
      setLoading(false);
    }
  }, []);

  // 구글 로그인 함수
  const loginWithGoogle = useCallback(() => {
    setLoading(true);

    try {
      // 구글 로그인 페이지로 리다이렉트 (백엔드 서버 직접 호출)
      // 백엔드에서 설정한 기본 리다이렉트 URL 사용
      const redirectUri = encodeURIComponent(window.location.origin + "/login");
      console.log("구글 로그인 리다이렉트 URL:", redirectUri);
      window.location.href = `http://192.168.100.119:8080/oauth2/authorization/google?redirect_uri=${redirectUri}`;
      return { success: true };
    } catch (err) {
      setError("구글 로그인을 시작하는 중 오류가 발생했습니다.");
      return { success: false, error: "구글 로그인을 시작하는 중 오류가 발생했습니다." };
    } finally {
      setLoading(false);
    }
  }, []);

  // 인증 상태 설정 함수
  const setAuthState = (token: string) => {
    console.log("인증 상태 설정 시작, 토큰:", token.substring(0, 10) + "...");

    // Axios 인스턴스의 헤더에 토큰 설정
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log("Axios 헤더에 토큰 설정 완료");

    // 인증 상태 변경
    setIsAuthenticated(true);
    console.log("인증 상태 변경 완료: true");

    // 디버깅용 로그
    console.log("현재 인증 상태:", isAuthenticated);
  };

  // 로그아웃
  const logout = useCallback(() => {
    // 로컬 스토리지에서 액세스 토큰 삭제
    localStorage.removeItem("accessToken");

    try {
      // 로그아웃 API 호출
      axiosInstance.post("/api/member/logout");
    } catch (err) {
      console.error("로그아웃 API 호출 오류:", err);
    }

    // 헤더에서 인증 정보 제거
    delete axiosInstance.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);

    // 로그인 페이지로 리다이렉트
    window.location.href = "/signin";
  }, []);

  // 디버깅 로그 가져오기
  const getAuthLogs = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem("auth_logs") || "[]");
    } catch (error) {
      console.error("로그 가져오기 오류:", error);
      return [];
    }
  }, []);

  // 디버깅 모드 설정
  const setDebugMode = useCallback((enabled: boolean) => {
    localStorage.setItem("auth_debug_mode", enabled ? "true" : "false");
  }, []);

  // 로그 지우기
  const clearAuthLogs = useCallback(() => {
    localStorage.removeItem("auth_logs");
  }, []);

  return {
    isAuthenticated,
    loading,
    error,
    loginWithKakao,
    loginWithGoogle,
    logout,
    getAuthLogs,
    setDebugMode,
    clearAuthLogs,
    setAuthState,
  };
};
