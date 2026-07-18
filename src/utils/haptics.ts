import * as Haptics from "expo-haptics";

import { usePreferencesStore } from "@/src/store/usePreferencesStore";

const hapticsEnabled = () =>
  usePreferencesStore.getState().hapticFeedbackEnabled;

export const hapticSwipe = () => {
  if (!hapticsEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

export const hapticComplete = () => {
  if (!hapticsEnabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
};
