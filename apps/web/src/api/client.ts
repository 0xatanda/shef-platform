import axios from "axios";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || "http://localhost:8080";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  `${API_ORIGIN.replace(/\/$/, "")}/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("shef_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (
      config.data &&
      !(config.data instanceof FormData)
    ) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("SHEF API Network Error:", {
        message: error.message,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
      });
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("shef_token");
      localStorage.removeItem("shef_user");
    }

    return Promise.reject(error);
  },
);

export { API_ORIGIN, API_BASE_URL };

export default api;