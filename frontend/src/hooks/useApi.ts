import { useCallback, useState } from "react";
import axiosInstance from "../api/axios";
import { Response } from "../types/response/Response";

export const useApi = <T, P = void>(endpoint: string, method: "GET" | "POST" | "PATCH" | "DELETE" = "GET") => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (payload?: P, customHeaders?: Record<string, string>) => {
      setLoading(true);
      setError(null);

      try {
        let response;
        const headers = customHeaders ? { ...customHeaders } : {};

        switch (method) {
          case "GET":
            response = await axiosInstance.get<Response<T>>(endpoint, { headers });
            break;
          case "POST":
            response = await axiosInstance.post<Response<T>>(endpoint, payload, { headers });
            break;
          case "PATCH":
            response = await axiosInstance.put<Response<T>>(endpoint, payload, { headers });
            break;
          case "DELETE":
            response = await axiosInstance.delete<Response<T>>(endpoint, {
              headers,
              data: payload,
            });
            break;
        }

        const responseData = response.data;

        if (responseData.isSuccess) {
          setData(responseData.result);
          return { success: true, data: responseData.result, message: responseData.message };
        } else {
          setError(responseData.message);
          return {
            success: false,
            error: responseData.message,
            code: responseData.code,
          };
        }
      } catch (err: any) {
        // 401 에러 (인증 실패) 처리

        // 기타 오류 처리
        const errorMessage = err.response?.data?.message || err.message || "알 수 없는 오류 발생";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method]
  );

  return { data, loading, error, execute };
};
