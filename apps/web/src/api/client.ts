import axios from "axios";
import type {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  "http://localhost:8080";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  `${API_ORIGIN.replace(/\/$/, "")}/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

let refreshPromise: Promise<string> | null = null;

function clearAuthStorage() {
  localStorage.removeItem("shef_token");
  localStorage.removeItem("shef_refresh_token");
  localStorage.removeItem("shef_user");
}

function redirectToLogin() {
  clearAuthStorage();

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

function getRefreshToken(): string | null {
  return localStorage.getItem(
    "shef_refresh_token",
  );
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    {
      refresh_token: refreshToken,
    },
    {
      timeout: 30000,
    },
  );

  const accessToken =
    response.data?.data?.access_token;

  if (!accessToken) {
    throw new Error(
      "Refresh response did not contain an access token",
    );
  }

  localStorage.setItem(
    "shef_token",
    accessToken,
  );

  /*
   * The current backend refresh implementation
   * returns the same refresh token. Preserve it
   * explicitly if it is returned.
   */
  const returnedRefreshToken =
    response.data?.data?.refresh_token;

  if (returnedRefreshToken) {
    localStorage.setItem(
      "shef_refresh_token",
      returnedRefreshToken,
    );
  }

  const user = response.data?.data?.user;

  if (user) {
    localStorage.setItem(
      "shef_user",
      JSON.stringify(user),
    );
  }

  return accessToken;
}

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("shef_token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    if (
      config.data &&
      !(config.data instanceof FormData)
    ) {
      config.headers["Content-Type"] =
        "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (!error.response) {
      console.error(
        "SHEF API Network Error:",
        {
          message: error.message,
          baseURL: error.config?.baseURL,
          url: error.config?.url,
        },
      );

      return Promise.reject(error);
    }

    const originalRequest =
      error.config as
        | InternalAxiosRequestConfig & {
            _retry?: boolean;
          };

    const status = error.response.status;

    const requestUrl =
      originalRequest?.url || "";

    const isAuthRequest =
      requestUrl.includes("/auth/login") ||
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout");

    if (
      status !== 401 ||
      originalRequest?._retry ||
      isAuthRequest
    ) {
      if (
        status === 401 &&
        !isAuthRequest
      ) {
        clearAuthStorage();
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise =
          refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
      }

      const newAccessToken =
        await refreshPromise;

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api.request(originalRequest);
    } catch (refreshError) {
      redirectToLogin();

      return Promise.reject(
        refreshError,
      );
    }
  },
);

export {
  API_ORIGIN,
  API_BASE_URL,
};

export default api;