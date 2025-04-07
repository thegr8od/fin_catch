import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";

// 최대 토큰 갱신 시도 횟수
const MAX_REFRESH_ATTEMPTS = 3;
// 토큰 갱신 시도 횟수 추적
let refreshAttempts = 0;
// 토큰 갱신 중인지 추적
let isRefreshing = false;
// 갱신 중 대기 중인 요청들
let refreshSubscribers: Array<(token: string) => void> = [];

// Axios 인스턴스 생성
const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // 백엔드 서버 URL
  timeout: 30000, // 요청 타임아웃 (30초)
  withCredentials: true, // 쿠키를 포함한 요청을 위해 필요
  headers: {
    "Content-Type": "application/json",
  },
});

// 요청 인터셉터
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");

    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // 디버깅용 로그에서 params가 undefined일 때는 제외
    const logObject: any = {
      url: config.url,
      method: config.method,
      headers: config.headers,
      withCredentials: config.withCredentials,
      cookies: document.cookie,
    };

    // params가 있을 때만 로그 객체에 추가
    if (config.params) {
      logObject.params = config.params;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 토큰 갱신 성공 후 대기 중인 요청 처리
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// 토큰 갱신 실패 시 처리
const onRefreshFailed = () => {
  localStorage.removeItem("accessToken");
  refreshAttempts = 0;
  isRefreshing = false;
  refreshSubscribers = [];
  window.location.href = "/signin";
};

// 응답 인터셉터
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 토큰 갱신 API 자체에 대한 오류는 별도 처리
    if (originalRequest.url?.includes("/api/member/public/reissue")) {
      onRefreshFailed();
      return Promise.reject(error);
    }

    // 401 에러 (인증 실패) 처리
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 최대 시도 횟수 체크
      if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
        onRefreshFailed();
        return Promise.reject(new Error("토큰 갱신 최대 시도 횟수 초과"));
      }

      originalRequest._retry = true;

      // 이미 갱신 중이면 현재 요청을 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            if (originalRequest.headers) {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
            }
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;
      refreshAttempts++;

      try {
        // 토큰 갱신 요청
        const response = await axios.get(`/api/member/public/reissue`, {
          baseURL: import.meta.env.VITE_API_BASE_URL,
          withCredentials: true,
        });

        if (response.data && response.data.isSuccess && response.data.result && response.data.result.accessToken) {
          // 새 액세스 토큰 저장
          const newAccessToken = response.data.result.accessToken;
          localStorage.setItem("accessToken", newAccessToken);

          // 갱신 성공 시 카운터 리셋
          refreshAttempts = 0;
          isRefreshing = false;

          // 대기 중인 요청 처리
          onRefreshed(newAccessToken);

          // 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          }
          return axiosInstance(originalRequest);
        } else {
          onRefreshFailed();
          return Promise.reject(new Error("토큰 갱신 응답이 올바르지 않음"));
        }
      } catch (refreshError) {
        onRefreshFailed();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
