import { create } from 'zustand';
import { Flashcard, FlashcardsGameState, Module } from '../types';

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

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

    initGame: (module: Module, cards: Flashcard[]) => {
        const { settings } = get();
        const stillLearning = cards.filter(c => c.status === 'still_learning');
        const base = stillLearning.length > 0 && settings.sortByPiles ? stillLearning : cards;
        const activeCards = settings.shuffle ? shuffle(base) : base;
        set({
            currentModule: module,
            activeCards,
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

    revertSwipe: () => {
        const { currentIndex, activeCards, knownPiles, stillLearningPiles } = get();
        if (currentIndex <= 0) return;

        const prevCard = activeCards[currentIndex - 1];
        const wasKnown = knownPiles.length > 0 && knownPiles[knownPiles.length - 1].id === prevCard.id;

        set({
            currentIndex: currentIndex - 1,
            knownPiles: wasKnown ? knownPiles.slice(0, -1) : knownPiles,
            stillLearningPiles: wasKnown ? stillLearningPiles : stillLearningPiles.slice(0, -1),
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
            activeCards: get().settings.shuffle ? shuffle(nextCards) : nextCards,
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