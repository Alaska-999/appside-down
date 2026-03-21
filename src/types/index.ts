/**
 * 1. ENUMS & LITERAL TYPES
 */
export type LearningStatus = 'unstudied' | 'known' | 'still_learning';
export type CardOrientation = 'term_first' | 'definition_first';
export type SortOption = 'date' | 'alphabetical' | 'favorites';
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * 2. USER & AUTH ENTITIES
 */
export interface User {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string | null;
    createdAt: string;
}

export interface UserSettings {
    userId: string;
    theme: ThemeMode;
    defaultCardOrientation: CardOrientation;
    isTtsEnabled: boolean;
    dailyStreakGoal: number;
}

export interface StreakData {
    userId: string;
    currentStreak: number;
    lastActiveDate: string | null;
}

export interface UserProfile extends User {
    settings: UserSettings;
    streak: StreakData;
}

/**
 * 3. CORE CONTENT ENTITIES
 */
export interface Tag {
    id: string;
    folderId: string;
    name: string;
}

export interface Folder {
    id: string;
    userId: string;
    name: string;
    icon: string;
    createdAt: string;
    updatedAt: string;
    tags?: Tag[];
    moduleIds?: string[];
}

export interface Module {
    id: string;
    userId: string;
    name: string;
    description?: string | null;
    isFavorite: boolean;
    itemsCount: number;
    createdAt: string;
    updatedAt: string;
    folderIds?: string[];
    items?: Flashcard[]; // Завантажується окремо для гри або перегляду
}

export interface Flashcard {
    id: string;
    moduleId: string;
    term: string;
    definition: string;
    isStarred: boolean;
    status: LearningStatus;
    createdAt: string;
    updatedAt: string;
}

/**
 * 4. API & STATE TYPES
 */
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: UserProfile;
}

export interface FlashcardsGameState {
    currentModule: Module | null;
    activeCards: Flashcard[];
    currentIndex: number;

    // Piles (Стопки для розрахунку статистики на Finish Screen)
    knownPiles: Flashcard[];
    stillLearningPiles: Flashcard[];

    settings: {
        shuffle: boolean;
        ttsEnabled: boolean;
        sortByPiles: boolean;
        cardOrientation: CardOrientation;
    };

    // Actions (Методи стору)
    initGame: (module: Module, cards: Flashcard[]) => void;
    swipeLeft: () => void;
    swipeRight: () => void;
    flipCard: () => void;
    restart: (onlyStillLearning?: boolean) => void;
    updateSettings: (newSettings: Partial<FlashcardsGameState['settings']>) => void;
}