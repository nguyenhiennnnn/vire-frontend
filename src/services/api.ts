import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../stores/auth-store";
import type { RefreshResponse, ApiError } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL as string;

// ─── Main API instance ────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ─── Request: attach accessToken ─────────────────────────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response: auto-refresh on 401 ───────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (original.url?.includes("/auth/")) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<RefreshResponse>(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const newToken = data.accessToken;
      useAuthStore.getState().setAccessToken(newToken);
      processQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      useAuthStore.getState().logout();
      window.location.href = "/login";
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
