import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, clearAccessToken, setAccessToken } from "./api";

export interface User {
  id: string;
  email: string;
  name: string | null;
}

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),

      login: async (email, password) => {
        const { data } = await api.post<{ accessToken: string; user: User }>("/api/auth/login", {
          email,
          password,
        });
        setAccessToken(data.accessToken);
        set({ user: data.user });
      },

      register: async (email, password, name) => {
        const { data } = await api.post<{ accessToken: string; user: User }>("/api/auth/register", {
          email,
          password,
          name,
        });
        setAccessToken(data.accessToken);
        set({ user: data.user });
      },

      refresh: async () => {
        const { data } = await api.post<{ accessToken: string; user: User }>("/api/auth/refresh");
        setAccessToken(data.accessToken);
        set({ user: data.user });
      },

      logout: async () => {
        try {
          await api.post("/api/auth/logout");
        } finally {
          clearAccessToken();
          set({ user: null });
        }
      },
    }),
    { name: "dbpilot-auth", partialize: (s) => ({ user: s.user }) }
  )
);
