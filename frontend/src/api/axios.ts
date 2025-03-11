import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";

// 쿠키에서 토큰 가져오기
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    return cookieValue ? decodeURIComponent(cookieValue) : null;
  }
  return null;
};

// Axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
  baseURL: "/", // 프록시 설정으로 인해 상대 경로 사용
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키 포함
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 로컬 스토리지에서 액세스 토큰 가져오기
    const token = localStorage.getItem("accessToken");
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
      try {
        // 토큰 갱신 요청 (리프레시 토큰은 쿠키에 있음)
        const response = await axios.get(`/api/member/public/reissue`, {
          withCredentials: true, // 쿠키 포함
        });

        if (response.data && response.data.isSuccess && response.data.result && response.data.result.accessToken) {
          // 새 액세스 토큰 저장
          const newAccessToken = response.data.result.accessToken;
          localStorage.setItem("accessToken", newAccessToken);

          // 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          }
          return axiosInstance(originalRequest);
        } else {
          // 토큰 갱신 실패 시 로그인 페이지로 이동
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그인 페이지로 이동
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
