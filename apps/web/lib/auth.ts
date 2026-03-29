import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, clearAccessToken, setAccessToken } from "./api";
import { AuthResponse, AuthState } from "@/types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),

      login: async (email, password) => {
        const { data } = await api.post<AuthResponse>("/api/auth/login", {
          email,
          password,
        });
        setAccessToken(data.token);
        set({ user: data.user });
      },

      register: async (email, password, name) => {
        const { data } = await api.post<AuthResponse>("/api/auth/register", {
          email,
          password,
          name,
        });
        setAccessToken(data.token);
        set({ user: data.user });
      },

      refresh: async () => {
        const { data } = await api.post<AuthResponse>("/api/auth/refresh");
        setAccessToken(data.token);
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
