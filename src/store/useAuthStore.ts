import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { UserProfile } from "../types";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isHydrated: boolean;
  sessionExpired: boolean;
  setAuth: (user: UserProfile, token: string) => void;
  setToken: (token: string) => void;
  logout: (opts?: { expired?: boolean }) => Promise<void>;
  updateAvatar: (avatarUrl: string | null) => void;
  _setHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isHydrated: false,
      sessionExpired: false,

      setAuth: (user, token) => {
        set({ user, token, sessionExpired: false });
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
      },

      setToken: (token) => {
        set({ token });
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
      },

      logout: async (opts) => {
        set({ user: null, token: null, sessionExpired: opts?.expired ?? false });
        const { useStudyQueueStore } = await import("./useStudyQueueStore");
        useStudyQueueStore.getState().clear();
        await Promise.all([
          SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
          SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        ]);
      },

      updateAvatar: (avatarUrl) =>
        set((state) => ({
          user: state.user ? { ...state.user, avatarUrl } : null,
        })),

      _setHydrated: (val) => set({ isHydrated: val }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        SecureStore.getItemAsync(ACCESS_TOKEN_KEY).then((token) => {
          if (token) state?.setToken(token);
          state?._setHydrated(true);
        });
      },
    },
  ),
);
