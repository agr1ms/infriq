import axios, { type AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? getAccessToken() : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as typeof err.config & { _retry?: boolean };
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post<{ token: string }>(
          `${API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        setAccessToken(data.token);
        if (original.headers) original.headers.Authorization = `Bearer ${data.token}`;
        return api(original);
      } catch {
        clearAccessToken();
        if (typeof window !== "undefined") {
          localStorage.removeItem("dbpilot-auth");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

const TOKEN_KEY = "dbpilot_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

type ApiErrorShape = { response?: { data?: { error?: string; message?: string } } };

export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err && typeof err === "object" && "response" in err) {
    const e = err as ApiErrorShape;
    return e.response?.data?.error ?? e.response?.data?.message ?? fallback;
  }
  return fallback;
}
