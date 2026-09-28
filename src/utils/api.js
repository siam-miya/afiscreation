import axios from "axios";

/* =========================
   BASE URL
========================= */

const rawURL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

const cleanURL = rawURL
  .trim()
  .replace(/\/+$/, "");

const baseURL = cleanURL.endsWith(
  "/api/v1"
)
  ? cleanURL
  : cleanURL.endsWith("/api")
  ? `${cleanURL}/v1`
  : `${cleanURL}/api/v1`;

const orderBaseURL =
  cleanURL.endsWith("/api")
    ? cleanURL
    : `${cleanURL}/api`;

/* =========================
   API CLIENTS
========================= */

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type":
      "application/json",
  },
});

const orderApi = axios.create({
  baseURL: orderBaseURL,
  withCredentials: true,
});

const refreshClient =
  axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      "Content-Type":
        "application/json",
    },
  });

/* =========================
   REFRESH STATE
========================= */

let isRefreshing = false;

let refreshSubscribers = [];

const subscribeTokenRefresh = (
  callback
) => {
  refreshSubscribers.push(
    callback
  );
};

const notifyRefreshSubscribers = (
  success
) => {
  refreshSubscribers.forEach(
    (callback) => {
      callback(success);
    }
  );

  refreshSubscribers = [];
};

/* =========================
   STORAGE
========================= */

const clearStoredUser = () => {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  localStorage.removeItem(
    "user"
  );

  localStorage.removeItem(
    "adminUser"
  );

  // Remove old token-based auth
  localStorage.removeItem(
    "token"
  );

  localStorage.removeItem(
    "accessToken"
  );

  localStorage.removeItem(
    "refreshToken"
  );
};

/* =========================
   AUTH ENDPOINT CHECK
========================= */

const isAuthEndpoint = (
  url = ""
) => {
  return (
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/verify-otp") ||
    url.includes("/auth/google") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/logout") ||
    url.includes("/auth/forgot-password") ||
    url.includes("/auth/reset-password")
  );
};

/* =========================
   REFRESH SESSION
========================= */

const refreshSession = async () => {
  return refreshClient.post(
    "/auth/refresh"
  );
};

/* =========================
   REQUEST INTERCEPTOR
========================= */

const requestInterceptor = (
  config
) => {
  config.withCredentials = true;

  return config;
};

api.interceptors.request.use(
  requestInterceptor,
  (error) =>
    Promise.reject(error)
);

orderApi.interceptors.request.use(
  requestInterceptor,
  (error) =>
    Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
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
        return Promise.reject(
          error
        );
      }

      const status =
        error.response.status;

      if (
        status !== 401 ||
        !originalRequest ||
        originalRequest._retry
      ) {
        return Promise.reject(
          error
        );
      }

      const requestURL =
        originalRequest.url || "";

      /*
       * Never refresh for authentication
       * endpoints themselves.
       */
      if (
        isAuthEndpoint(
          requestURL
        )
      ) {
        if (
          requestURL.includes(
            "/auth/refresh"
          )
        ) {
          clearStoredUser();
        }

        return Promise.reject(
          error
        );
      }

      originalRequest._retry = true;

      /* =========================
         ANOTHER REQUEST REFRESHING
      ========================= */

      if (isRefreshing) {
        return new Promise(
          (
            resolve,
            reject
          ) => {
            subscribeTokenRefresh(
              (success) => {
                if (!success) {
                  reject(error);
                  return;
                }

                resolve(
                  client(
                    originalRequest
                  )
                );
              }
            );
          }
        );
      }

      /* =========================
         START REFRESH
      ========================= */

      isRefreshing = true;

      try {
        await refreshSession();

        notifyRefreshSubscribers(
          true
        );

        return client(
          originalRequest
        );
      } catch (
        refreshError
      ) {
        notifyRefreshSubscribers(
          false
        );

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

setupResponseInterceptor(
  orderApi
);

export const API = api;

export const ORDER_API =
  orderApi;

export default api;