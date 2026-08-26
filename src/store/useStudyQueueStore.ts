import { API_BASE_URL } from "@/src/api/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { protectedFetch } from "../utils/protectedFetch";

export interface StudyEventInput {
  id: string;
  flashcardId: string;
  moduleId: string;
  status: "KNOWN" | "STILL_LEARNING";
  answeredAt: string;
}

interface StudyQueueState {
  events: StudyEventInput[];
  flushing: boolean;
  addEvent: (event: Omit<StudyEventInput, "id">) => void;
  flush: () => Promise<void>;
  clear: () => void;
}

const FLUSH_THRESHOLD = 10;
const MAX_BATCH = 100;

let inFlight: Promise<void> | null = null;

export const useStudyQueueStore = create<StudyQueueState>()(
  persist(
    (set, get) => ({
      events: [],
      flushing: false,

      addEvent: (event) => {
        set((state) => ({
          events: [...state.events, { ...event, id: Crypto.randomUUID() }],
        }));
        if (get().events.length >= FLUSH_THRESHOLD) {
          get().flush();
        }
      },

      flush: async () => {
        if (inFlight) return inFlight;
        if (get().events.length === 0) return;
        const run = async () => {
          set({ flushing: true });
          try {
            while (get().events.length > 0) {
              const batch = get().events.slice(0, MAX_BATCH);
              const res = await protectedFetch(`${API_BASE_URL}/study/events`, {
                method: "POST",
                body: JSON.stringify({ events: batch }),
              });
              if (!res.ok) throw new Error(`Error: ${res.status}`);
              set((state) => ({ events: state.events.slice(batch.length) }));
            }
          } catch (err) {
            console.error("[StudyQueue] flush error:", err);
          } finally {
            set({ flushing: false });
          }
        };
        inFlight = run().finally(() => {
          inFlight = null;
        });
        return inFlight;
      },

      clear: () => set({ events: [] }),
    }),
    {
      name: "study-queue-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ events: state.events }),
      version: 1,
      migrate: (persisted) => {
        const state = persisted as { events?: StudyEventInput[] };
        return {
          events: (state.events ?? []).map((e) =>
            e.id ? e : { ...e, id: Crypto.randomUUID() },
          ),
        };
      },
    },
  ),
);
