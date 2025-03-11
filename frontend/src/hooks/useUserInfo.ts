import { useEffect } from "react";
import { User } from "../types/Auth/User";
import { useApi } from "./useApi";

export const useUserInfo = (authoFetch: boolean = true) => {
  const { data: user, loading, error, execute: fetchUserInfo } = useApi<User>("api/member/myinfo", "GET");

  useEffect(() => {
    if (authoFetch && localStorage.getItem("accessToken")) {
      fetchUserInfo();
    }
  }, [authoFetch, fetchUserInfo]);

  return {
    user,
    loading,
    error,
    fetchUserInfo,
  };
};
