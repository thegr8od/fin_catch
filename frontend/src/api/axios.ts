import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";

// 기본 API URL 설정
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";

// Axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    // 401 에러 (인증 실패) 처리
    if (error.response?.status === 401) {
      // 토큰 갱신 로직 (필요한 경우)
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken && originalRequest) {
        try {
          // 토큰 갱신 요청
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          // 새 토큰 저장
          const { token } = response.data;
          localStorage.setItem("token", token);

          // 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        // 리프레시 토큰이 없으면 로그인 페이지로 이동
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
