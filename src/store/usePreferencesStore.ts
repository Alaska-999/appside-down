import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PreferencesState {
    soundEffectsEnabled: boolean;
    hapticFeedbackEnabled: boolean;
    pushNotificationsEnabled: boolean;
    toggleSoundEffects: () => void;
    toggleHapticFeedback: () => void;
    togglePushNotifications: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set) => ({
            soundEffectsEnabled: true,
            hapticFeedbackEnabled: true,
            pushNotificationsEnabled: false,

            toggleSoundEffects: () =>
                set((state) => ({ soundEffectsEnabled: !state.soundEffectsEnabled })),

            toggleHapticFeedback: () =>
                set((state) => ({ hapticFeedbackEnabled: !state.hapticFeedbackEnabled })),

            togglePushNotifications: () =>
                set((state) => ({ pushNotificationsEnabled: !state.pushNotificationsEnabled })),
        }),
        {
            name: 'preferences-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
