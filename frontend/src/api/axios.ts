import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";

// Axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
  baseURL: "http://192.168.100.119:8080", // 백엔드 서버 URL
  timeout: 30000, // 요청 타임아웃 (30초)
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 로컬 스토리지에서 액세스 토큰 가져오기
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // 디버깅용 로그
    console.log("API 요청:", {
      url: config.url,
      method: config.method,
      params: config.params,
      headers: config.headers,
      data: config.data,
    });

    return config;
  },
  (error: AxiosError) => {
    // 요청 오류 처리
    console.error("API 요청 오류:", error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 디버깅용 로그
    console.log("API 응답 성공:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig;

    // 응답 오류 처리
    console.error("API 응답 오류:", {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // 401 Unauthorized 오류 처리 (토큰 만료 등)
    if (error.response && error.response.status === 401) {
      // 로컬 스토리지에서 토큰 제거
      localStorage.removeItem("accessToken");

      // 로그인 페이지로 리다이렉트
      window.location.href = "/signin";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
