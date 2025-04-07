// hooks/useExpPoint.ts
import { useCallback } from "react";
import { useApi } from "./useApi";
import { useUserInfo } from "./useUserInfo";

interface ExpPointPayload {
  exp: number;
  point: number;
}

interface ExpPointResponse {
  userId: number;
  exp: number;
  point: number;
}

export const useExpPoint = () => {
  const { loading, error, execute: updateExpPoint } = useApi<ExpPointResponse, ExpPointPayload>(
    "/api/member/exp-point", 
    "PATCH"
  );
  const { fetchUserInfo } = useUserInfo();

  /**
   * 경험치와 포인트를 서버에 업데이트하는 함수
   * @param exp 추가할 경험치
   * @param point 추가할 포인트
   * @returns API 응답 결과
   */
  const addExpPoint = useCallback(async (exp: number, point: number) => {
    try {
      const response = await updateExpPoint({
        exp,
        point
      });
      
      // 유저 정보 새로고침 (최신 경험치와 포인트를 반영)
      if (response?.isSuccess) {
        await fetchUserInfo();
      }
      
      return response;
    } catch (error) {
      console.error("경험치/포인트 업데이트 중 오류:", error);
      return {
        isSuccess: false,
        code: 500,
        message: "경험치/포인트 업데이트에 실패했습니다.",
        result: null
      };
    }
  }, [updateExpPoint, fetchUserInfo]);

  return {
    loading,
    error, 
    addExpPoint
  };
};

export default useExpPoint;