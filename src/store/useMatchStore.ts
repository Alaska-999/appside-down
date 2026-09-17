import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Flashcard, MatchGameState, Module } from '../types';
import { buildTiles, isPair, pickRoundCards } from '../utils/match';

export const useMatchStore = create<MatchGameState>()(
    persist(
        (set, get) => ({
            currentModule: null,
            roundPool: [],
            tiles: [],
            totalPairs: 0,
            selectedTileId: null,
            locked: false,
            matchedPairs: 0,
            mistakes: 0,
            combo: 0,
            startedAt: null,
            finishedAt: null,
            coldFinish: false,
            bestTimes: {},

            initMatch: (module: Module, cards: Flashcard[]) => {
                const roundCards = pickRoundCards(cards);
                set({
                    currentModule: module,
                    roundPool: cards,
                    tiles: buildTiles(roundCards),
                    totalPairs: roundCards.length,
                    selectedTileId: null,
                    locked: false,
                    matchedPairs: 0,
                    mistakes: 0,
                    combo: 0,
                    startedAt: null,
                    finishedAt: null,
                    coldFinish: false,
                });
            },

            startTimer: () => {
                if (get().startedAt !== null) return;
                set({ startedAt: Date.now() });
            },

            selectTile: (tileId: string) => {
                const { tiles, selectedTileId, locked } = get();
                if (locked) return;

                const tile = tiles.find((t) => t.tileId === tileId);
                if (!tile || tile.state === 'matched') return;

                if (selectedTileId === null) {
                    set({
                        selectedTileId: tileId,
                        tiles: tiles.map((t) =>
                            t.tileId === tileId ? { ...t, state: 'selected' } : t,
                        ),
                    });
                    return;
                }

                if (selectedTileId === tileId) {
                    set({
                        selectedTileId: null,
                        tiles: tiles.map((t) =>
                            t.tileId === tileId ? { ...t, state: 'idle' } : t,
                        ),
                    });
                    return;
                }

                const previous = tiles.find((t) => t.tileId === selectedTileId);
                if (!previous) return;

                const pair = isPair(previous, tile);
                const touched = (id: string) => id === tileId || id === selectedTileId;

                set({
                    selectedTileId: null,
                    locked: !pair,
                    matchedPairs: pair ? get().matchedPairs + 1 : get().matchedPairs,
                    mistakes: pair ? get().mistakes : get().mistakes + 1,
                    combo: pair ? get().combo + 1 : 0,
                    tiles: tiles.map((t) =>
                        touched(t.tileId) ? { ...t, state: pair ? 'matched' : 'wrong' } : t,
                    ),
                });
            },

            resolveWrong: () => {
                set((state) => ({
                    locked: false,
                    tiles: state.tiles.map((t) =>
                        t.state === 'wrong' ? { ...t, state: 'idle' } : t,
                    ),
                }));
            },

            finish: (elapsedMs: number) => {
                const { currentModule, bestTimes } = get();
                const moduleId = currentModule?.id;
                const previous = moduleId ? bestTimes[moduleId] : undefined;
                const isRecord = !!moduleId && (previous === undefined || elapsedMs < previous);

                set({
                    finishedAt: Date.now(),
                    coldFinish: Math.random() < 0.5,
                    bestTimes: isRecord
                        ? { ...bestTimes, [moduleId as string]: elapsedMs }
                        : bestTimes,
                });

                return isRecord;
            },

            restart: () => {
                const { currentModule, roundPool } = get();
                if (currentModule) get().initMatch(currentModule, roundPool);
            },
        }),
        {
            name: 'match-store',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({ bestTimes: state.bestTimes }),
        },
    ),
);
