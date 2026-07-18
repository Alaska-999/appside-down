import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { protectedFetch } from "../utils/protectedFetch";

export interface StudyEventInput {
  flashcardId: string;
  moduleId: string;
  status: "KNOWN" | "STILL_LEARNING";
  answeredAt: string;
}

interface StudyQueueState {
  events: StudyEventInput[];
  flushing: boolean;
  addEvent: (event: StudyEventInput) => void;
  flush: () => Promise<void>;
}

const FLUSH_THRESHOLD = 10;
const MAX_BATCH = 100;

export const useStudyQueueStore = create<StudyQueueState>()(
  persist(
    (set, get) => ({
      events: [],
      flushing: false,

      addEvent: (event) => {
        set((state) => ({ events: [...state.events, event] }));
        if (get().events.length >= FLUSH_THRESHOLD) {
          get().flush();
        }
      },

      flush: async () => {
        if (get().flushing || get().events.length === 0) return;
        set({ flushing: true });
        try {
          while (get().events.length > 0) {
            const batch = get().events.slice(0, MAX_BATCH);
            const res = await protectedFetch(
              `${process.env.EXPO_PUBLIC_API_URL}/study/events`,
              { method: "POST", body: JSON.stringify({ events: batch }) },
            );
            if (!res.ok) throw new Error(`Error: ${res.status}`);
            set((state) => ({ events: state.events.slice(batch.length) }));
          }
        } catch (err) {
          console.error("[StudyQueue] flush error:", err);
        } finally {
          set({ flushing: false });
        }
      },
    }),
    {
      name: "study-queue-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ events: state.events }),
    },
  ),
);
