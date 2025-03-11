import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://192.168.100.119:8080",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: {
          "*": "",
        },
        configure: (proxy, _options) => {
          proxy.on("proxyRes", (proxyRes, req, res) => {
            // 쿠키 헤더 처리
            const cookies = proxyRes.headers["set-cookie"];
            if (cookies) {
              const newCookies = cookies.map((cookie) => cookie.replace(/Domain=[^;]+;/, "Domain=localhost;"));
              proxyRes.headers["set-cookie"] = newCookies;
            }
          });
        },
      },
      "/oauth2": {
        target: "http://192.168.100.119:8080",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: {
          "*": "",
        },
        configure: (proxy, _options) => {
          proxy.on("proxyRes", (proxyRes, req, res) => {
            // 쿠키 헤더 처리
            const cookies = proxyRes.headers["set-cookie"];
            if (cookies) {
              const newCookies = cookies.map((cookie) => cookie.replace(/Domain=[^;]+;/, "Domain=localhost;"));
              proxyRes.headers["set-cookie"] = newCookies;
            }
          });
        },
      },
    },
  },
});
