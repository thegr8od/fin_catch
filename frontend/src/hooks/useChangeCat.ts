import { useApi } from "./useApi";
import { User } from "../types/Auth/User";

export const useChangeCat = () => {
  const { loading, error, execute: changeCatApi } = useApi<User>("/api/member/maincat", "PATCH");

  const changeCat = async (catId: number) => {
    return await changeCatApi(undefined, {
      params: { catId },
    });
  };

  return {
    changeCat,
    loading,
    error,
  };
};
