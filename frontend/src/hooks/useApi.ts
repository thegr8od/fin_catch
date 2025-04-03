import { useCallback, useState } from "react";
import axiosInstance from "../api/axios";
import { Response } from "../types/response/Response";

interface CustomConfig {
  url?: string;
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
}

export const useApi = <T, P = void>(endpoint: string, method: "GET" | "PATCH" | "POST" | "DELETE" | "PUT" = "GET") => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(
    async (payload?: P, config?: CustomConfig) => {
      console.log(`API 호출 시작: ${config?.url || endpoint}, 메서드: ${method}`);
      console.log("요청 데이터:", payload);
      setLoading(true);
      setError(null);

      try {
        let response;
        const url = config?.url || endpoint;
        const headers = config?.headers || {};
        const params = config?.params;

        console.log(`최종 URL: ${url}, 헤더:`, headers);

        switch (method) {
          case "GET":
            response = await axiosInstance.get<Response<T>>(url, { headers, params });
            break;
          case "PATCH":
            response = await axiosInstance.patch<Response<T>>(url, payload, { headers, params });
            break;
          case "DELETE":
            response = await axiosInstance.delete<Response<T>>(url, {
              headers,
              data: payload,
            });
            break;

          case "POST":
            console.log(`POST 요청 수행: ${url}`, payload);
            response = await axiosInstance.post<Response<T>>(url, payload, {
              headers,
            });
            console.log("POST 응답 수신:", response);
            break;
          case "PUT":
            response = await axiosInstance.put<Response<T>>(url, payload, { headers, params });
            break;
        }

        const responseData = response.data;
        console.log(`API 응답 데이터:`, responseData);

        // 기존 API 응답 처리
        if (responseData.isSuccess) {
          setData(responseData.result);
          return responseData;
        } else {
          console.warn(`API 오류 응답:`, responseData);
          setError(responseData.message);
          return {
            isSuccess: false,
            code: responseData.code || 500,
            message: responseData.message,
            result: null,
          };
        }
      } catch (err: unknown) {
        console.error(`API 호출 중 예외 발생:`, err);
        // 401 에러 (인증 실패) 처리

        // 기타 오류 처리
        let errorMessage = "알 수 없는 오류 발생";

        if (err && typeof err === "object" && "message" in err) {
          errorMessage = (err as Error).message;
        }

        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as { response?: { data?: { message?: string } } };
          errorMessage = axiosError.response?.data?.message || errorMessage;
          console.error("응답 오류 데이터:", axiosError.response?.data);
        }

        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
        console.log(`API 호출 완료: ${config?.url || endpoint}`);
      }
    },
    [endpoint, method]
  );

  return { data, loading, error, execute, setData };
};