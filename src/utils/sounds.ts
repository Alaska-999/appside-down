import { AudioPlayer, createAudioPlayer } from "expo-audio";

import { usePreferencesStore } from "@/src/store/usePreferencesStore";

const soundsEnabled = () =>
  usePreferencesStore.getState().soundEffectsEnabled;

let completePlayer: AudioPlayer | null = null;

export const soundComplete = () => {
  if (!soundsEnabled()) return;
  if (!completePlayer) {
    completePlayer = createAudioPlayer(
      require("../../assets/sounds/complete.wav"),
    );
  }
  completePlayer.seekTo(0);
  completePlayer.play();
};
