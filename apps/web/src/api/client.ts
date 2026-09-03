import axios from "axios";

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  "http://localhost:8080";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    `${API_ORIGIN}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("shef_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (
    config.data &&
    !(config.data instanceof FormData)
  ) {
    config.headers["Content-Type"] =
      "application/json";
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("shef_token");
      localStorage.removeItem("shef_user");
    }

    return Promise.reject(error);
  },
);

export { API_ORIGIN };

export default api;