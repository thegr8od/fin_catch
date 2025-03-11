import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../api/axios";

interface AuthResult {
  success: boolean;
  message?: string;
  error?: string;
}

// 디버깅 로그를 localStorage에 저장하는 함수
const saveLog = (message: string) => {
  try {
    const logs = JSON.parse(localStorage.getItem("auth_logs") || "[]");
    logs.push({
      timestamp: new Date().toISOString(),
      message,
    });
    // 최대 100개의 로그만 유지
    if (logs.length > 100) {
      logs.shift();
    }
    localStorage.setItem("auth_logs", JSON.stringify(logs));
  } catch (error) {
    console.error("로그 저장 오류:", error);
  }
};

// 쿠키 관련 유틸리티 함수
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }
  return null;
};

const deleteCookie = (name: string, path = "/") => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax`;
};

// 모든 쿠키 출력 (디버깅용)
const logAllCookies = () => {
  const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
  console.log("모든 쿠키:", cookies);
  saveLog(`모든 쿠키: ${cookies.join(", ")}`);
  return cookies;
};

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 초기화 및 URL 확인
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
      // 카카오 로그인 페이지로 리다이렉트
      window.location.href = "/oauth2/authorization/kakao";
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
      // 구글 로그인 페이지로 리다이렉트
      window.location.href = "/oauth2/authorization/google";
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
    // Axios 인스턴스의 헤더에 토큰 설정
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setIsAuthenticated(true);
  };

  // 로그아웃
  const logout = useCallback(() => {
    // 로컬 스토리지에서 액세스 토큰 삭제
    localStorage.removeItem("accessToken");

    // 쿠키에서 리프레시 토큰 삭제
    deleteCookie("REFRESH");

    try {
      axiosInstance.post("/api/member/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("로그아웃 API 호출 오류:", err);
    }

    delete axiosInstance.defaults.headers.common["Authorization"];
    setIsAuthenticated(false);

    // 로그인 페이지로 리다이렉트
    window.location.href = "/login";
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
    getCookie,
    deleteCookie,
    logAllCookies,
    setAuthState,
  };
};
