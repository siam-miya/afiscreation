import axios from "axios";

const rawURL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const cleanURL = rawURL.replace(/\/+$/, "");

const baseURL = cleanURL.endsWith("/api/v1")
  ? cleanURL
  : cleanURL.endsWith("/api")
  ? `${cleanURL}/v1`
  : `${cleanURL}/api/v1`;

const API = axios.create({
  baseURL,
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("adminToken") ||
        localStorage.getItem("adminUserToken");

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;