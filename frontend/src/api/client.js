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

// Public auth endpoints (signup/login) return 401 for wrong credentials —
// that's a normal login failure the calling form already handles, not an
// expired session. Only a 401 on an authenticated request should bounce
// the user to a login page.
const PUBLIC_AUTH_PATHS = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/salesperson/login",
  "/api/auth/retailer/login",
];

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) =>
      error.config?.url?.endsWith(path)
    );
    if (error.response?.status === 401 && !isPublicAuthRequest) {
      // A page can fire several requests at once (e.g. Orders.jsx loads
      // orders/products/retailers in parallel). If the token is expired,
      // all of them 401. Only the first should clear storage and redirect
      // — otherwise a later handler reads the already-cleared session,
      // falls back to the "distributor" default, and overwrites the
      // correct destination with the wrong login page.
      const token = localStorage.getItem("salesmakrs_token");
      if (token) {
        const stored = localStorage.getItem("salesmakrs_session");
        const role = stored ? JSON.parse(stored).role : "distributor";
        localStorage.removeItem("salesmakrs_token");
        localStorage.removeItem("salesmakrs_session");
        const loginPath = LOGIN_PATH[role] || "/login";
        if (window.location.pathname !== loginPath) {
          window.location.href = loginPath;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default client;
