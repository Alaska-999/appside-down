import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { UserProfile } from '../types';

interface AuthState {
    user: UserProfile | null;
    token: string | null;
    isHydrated: boolean;
    setAuth: (user: UserProfile, token: string) => void;
    logout: () => void;
    updateStreak: (newStreak: number) => void;
    _setHydrated: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isHydrated: false,

            setAuth: (user, token) => set({ user, token }),

            logout: () => set({ user: null, token: null }),

            updateStreak: (newStreak) => set((state) => ({
                user: state.user
                    ? { ...state.user, streak: { ...state.user.streak, currentStreak: newStreak } }
                    : null
            })),

            _setHydrated: (val) => set({ isHydrated: val }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => AsyncStorage),
            onRehydrateStorage: () => (state) => {
                state?._setHydrated(true);
            },
        }
    )
);