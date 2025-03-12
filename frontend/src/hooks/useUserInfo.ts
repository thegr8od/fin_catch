import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { setUser, setLoading, setError, clearUser } from "../store/slices/userSlice";
import axiosInstance from "../api/axios";

export const useUserInfo = (autoFetch: boolean = true) => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state: RootState) => state.user);

  const fetchUserInfo = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await axiosInstance.get("/api/member/myinfo");

      if (response.data.isSuccess) {
        dispatch(setUser(response.data.result));
      } else {
        dispatch(setError(response.data.message));
      }
    } catch (err: any) {
      dispatch(setError(err.response?.data?.message || "사용자 정보를 가져오는데 실패했습니다."));
    }
  }, [dispatch]);

  useEffect(() => {
    if (autoFetch && localStorage.getItem("accessToken")) {
      fetchUserInfo();
    }
  }, [autoFetch, fetchUserInfo]);

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

    // 현재 창에서의 변경 감지
    const handleTokenChange = () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        fetchUserInfo();
      } else {
        dispatch(clearUser());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("tokenChange", handleTokenChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("tokenChange", handleTokenChange);
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
