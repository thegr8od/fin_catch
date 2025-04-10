import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setUser, setLoading, setError, clearUser } from "../store/slices/userSlice";
import { useApi } from "./useApi";
import { User } from "../types/Auth/User";

export const useUserInfo = (autoFetch: boolean = true) => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state: RootState) => state.user);
  const { execute: fetchUserInfoApi } = useApi<User>("/api/member/myinfo", "GET");

  const fetchUserInfo = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      dispatch(clearUser());
      return;
    }

    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      // 사용자 정보 조회
      const response = await fetchUserInfoApi();

      if (response.isSuccess && response.result) {
        dispatch(setUser(response.result));
      } else {
        console.error("사용자 정보 요청 실패:", response.error);
        dispatch(setError(response?.error || "사용자 정보를 가져오는데 실패했습니다."));
        dispatch(clearUser());
      }
    } catch (err: any) {
      console.error("사용자 정보 요청 오류:", err);
      dispatch(setError(err.message || "사용자 정보를 가져오는데 실패했습니다."));
      dispatch(clearUser());
      if (err.status === 401) {
        localStorage.removeItem("accessToken");
      }
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, fetchUserInfoApi]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (autoFetch && token && !user) {
      fetchUserInfo();
    } else if (!token) {
      dispatch(clearUser());
    }
  }, [autoFetch, fetchUserInfo, user]);

  // localStorage의 accessToken 변경 감지
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken") {
        if (e.newValue) {
          fetchUserInfo();
        } else {
          dispatch(clearUser());
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [fetchUserInfo, dispatch]);

  const clearUserInfo = useCallback(() => {
    dispatch(clearUser());
  }, [dispatch]);

  return {
    user,
    loading,
    error,
    fetchUserInfo,
    clearUserInfo,
  };
};
