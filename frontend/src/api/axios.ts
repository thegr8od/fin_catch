import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";

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
        // 토큰 갱신 요청
        const response = await axiosInstance.get(`/api/member/public/reissue`);

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
          window.location.href = "/signin";
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그인 페이지로 이동
        localStorage.removeItem("accessToken");
        window.location.href = "/signin";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
