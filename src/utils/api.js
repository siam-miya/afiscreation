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

const api = axios.create({
  baseURL,
  withCredentials: true,
});

const orderApi = axios.create({
  baseURL: `${cleanURL}/api`,
  withCredentials: true,
});

/* =========================
   REFRESH CLIENT
========================= */

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const notifyRefreshSubscribers = (
  success
) => {
  refreshSubscribers.forEach((callback) => {
    callback(success);
  });

  refreshSubscribers = [];
};

const clearStoredUser = () => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem("user");
  localStorage.removeItem("adminUser");

  // Old token cleanup
  localStorage.removeItem("token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

/* =========================
   REFRESH SESSION
========================= */

const refreshSession = async () => {
  await refreshClient.post("/auth/refresh");
};

/* =========================
   REQUEST INTERCEPTOR
========================= */

const requestInterceptor = (config) => {
  config.withCredentials = true;

  return config;
};

api.interceptors.request.use(
  requestInterceptor,
  (error) => Promise.reject(error)
);

orderApi.interceptors.request.use(
  requestInterceptor,
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE HANDLER
========================= */

const setupResponseInterceptor = (
  client
) => {
  client.interceptors.response.use(
    (response) => response,

    async (error) => {
      const originalRequest =
        error.config;

      if (!error.response) {
        return Promise.reject(error);
      }

      if (
        error.response.status !== 401 ||
        originalRequest?._retry
      ) {
        return Promise.reject(error);
      }

      if (
        originalRequest?.url?.includes(
          "/auth/refresh"
        )
      ) {
        clearStoredUser();

        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise(
          (resolve, reject) => {
            subscribeTokenRefresh(
              (success) => {
                if (!success) {
                  reject(error);
                  return;
                }

                resolve(
                  client(originalRequest)
                );
              }
            );
          }
        );
      }

      isRefreshing = true;

      try {
        await refreshSession();

        notifyRefreshSubscribers(true);

        return client(originalRequest);
      } catch (refreshError) {
        notifyRefreshSubscribers(false);

        clearStoredUser();

        return Promise.reject(
          refreshError
        );
      } finally {
        isRefreshing = false;
      }
    }
  );
};

setupResponseInterceptor(api);
setupResponseInterceptor(orderApi);

export const API = api;
export const ORDER_API = orderApi;

export default api;