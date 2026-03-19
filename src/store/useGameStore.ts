import { create } from 'zustand';
import { Flashcard, FlashcardsGameState, Module } from '../types';

export const useGameStore = create<FlashcardsGameState>((set, get) => ({
    currentModule: null,
    activeCards: [],
    currentIndex: 0,
    knownPiles: [],
    stillLearningPiles: [],

    settings: {
        shuffle: false,
        ttsEnabled: false,
        sortByPiles: false,
        cardOrientation: 'term_first',
    },

    // Підготовка масиву карток перед грою
    initGame: (module: Module, cards: Flashcard[]) => {
        let preparedCards = [...cards];

        if (get().settings.shuffle) {
            preparedCards = preparedCards.sort(() => Math.random() - 0.5);
        }

        set({
            currentModule: module,
            activeCards: preparedCards,
            currentIndex: 0,
            knownPiles: [],
            stillLearningPiles: [],
        });
    },

    swipeRight: () => {
        const { currentIndex, activeCards, knownPiles } = get();
        if (currentIndex >= activeCards.length) return;

        const currentCard = activeCards[currentIndex];
        set({
            knownPiles: [...knownPiles, { ...currentCard, status: 'known' }],
            currentIndex: currentIndex + 1,
        });
    },

    swipeLeft: () => {
        const { currentIndex, activeCards, stillLearningPiles } = get();
        if (currentIndex >= activeCards.length) return;

        const currentCard = activeCards[currentIndex];
        set({
            stillLearningPiles: [...stillLearningPiles, { ...currentCard, status: 'still_learning' }],
            currentIndex: currentIndex + 1,
        });
    },

    flipCard: () => {
        // В основному обробляється в UI (Reanimated), 
        // але метод зарезервований для логіки "Flip All"
    },

    restart: (onlyStillLearning = false) => {
        const { activeCards, stillLearningPiles } = get();
        const nextCards = onlyStillLearning ? [...stillLearningPiles] : [...activeCards];

        // Скидаємо прогрес і встановлюємо нову чергу
        set({
            activeCards: get().settings.shuffle ? nextCards.sort(() => Math.random() - 0.5) : nextCards,
            currentIndex: 0,
            knownPiles: [],
            stillLearningPiles: [],
        });
    },

    updateSettings: (newSettings) => {
        set((state) => ({
            settings: { ...state.settings, ...newSettings }
        }));
    },
}));