import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser, setAccessToken } from "../store/slices/userSlice";
import { RootState, persistor } from "../store";

// 모든 쿠키 출력 (디버깅용)
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state: RootState) => state.user);

  const setAuthState = useCallback(
    (token: string) => {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      dispatch(setAccessToken(token));
      setIsAuthenticated(true);
    },
    [dispatch]
  );

  useEffect(() => {
    console.log("인증 상태 초기화");

    const initializeAuth = async () => {
      if (accessToken) {
        try {
          const response = await axiosInstance.get("/api/member/info");
          if (response.data && response.data.isSuccess) {
            dispatch(setUser(response.data.result));
            setAuthState(accessToken);
          } else {
            dispatch(setAccessToken(null));
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("사용자 정보 가져오기 실패:", error);
          dispatch(setAccessToken(null));
          setIsAuthenticated(false);
        }
      }
    };

    initializeAuth();
  }, [dispatch, accessToken, setAuthState]);

  // 카카오 로그인 함수
  const loginWithKakao = useCallback(() => {
    setLoading(true);

    try {
      // 카카오 로그인 페이지로 리다이렉트 (백엔드 서버 직접 호출)
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/kakao`;
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
      window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
      return { success: true };
    } catch (err) {
      setError("구글 로그인을 시작하는 중 오류가 발생했습니다.");
      return { success: false, error: "구글 로그인을 시작하는 중 오류가 발생했습니다." };
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그아웃
  const logout = useCallback(async () => {
    try {
      // API 호출
      await axiosInstance.post("/api/member/logout");

      // Redux 상태 초기화
      dispatch(setAccessToken(null));

      // Redux persist 상태 초기화
      await persistor.purge();

      // localStorage 완전 정리
      localStorage.clear();

      // axios 헤더 초기화
      delete axiosInstance.defaults.headers.common["Authorization"];
      setIsAuthenticated(false);

      // 모든 정리가 끝난 후 리다이렉트
      window.location.href = "/signin";
    } catch (err) {
      console.error("로그아웃 처리 중 오류 발생:", err);
      // 에러가 발생하더라도 로컬 상태는 정리
      localStorage.clear();
      delete axiosInstance.defaults.headers.common["Authorization"];
      setIsAuthenticated(false);
      window.location.href = "/signin";
    }
  }, [dispatch]);

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
