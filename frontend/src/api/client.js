import axios from "axios";
import { LOGIN_PATH } from "../constants/roles";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const client = axios.create({ baseURL });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("salesmakrs_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const stored = localStorage.getItem("salesmakrs_session");
      const role = stored ? JSON.parse(stored).role : "distributor";
      localStorage.removeItem("salesmakrs_token");
      localStorage.removeItem("salesmakrs_session");
      const loginPath = LOGIN_PATH[role] || "/login";
      if (window.location.pathname !== loginPath) {
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

export default client;
