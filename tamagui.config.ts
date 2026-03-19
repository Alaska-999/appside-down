import { config } from '@tamagui/config/v3'
import { createTamagui, createTokens } from 'tamagui'

// 1. ТОКЕНИ (Палітра)
// Тут ми визначаємо фізичні кольори. Змінюючи колір тут, він зміниться всюди.
const tokens = createTokens({
    ...config.tokens,
    color: {
        // Grayscale (Нейтральні)
        white: '#FFFFFF',
        pureBlack: '#000000',
        slate1: '#F8FAFC', // Майже білий (фон екранів)
        slate2: '#F1F5F9', // Світло-сірий (інпути, muted кнопки)
        slate3: '#E2E8F0', // Бордюри
        slate4: '#94A3B8', // Текст підказок (muted)
        slate5: '#475569', // Другорядний текст
        slate6: '#1A1A1B', // Основний текст / Чорні елементи

        // Semantic (Смислові - для гри та статусів)
        green: '#059669',  // Known
        red: '#DC2626',    // Still Learning
        amber: '#F59E0B',  // Starred / Favorite
        blue: '#0284C7',   // Info / Profile progress
    }
})

// 2. ТЕМИ (Логічні ролі)
// Тут ми кажемо, ЯКИЙ токен відповідає за ЯКУ роль.
const appConfig = createTamagui({
    ...config,
    tokens,
    themes: {
        light: {
            // Backgrounds
            background: tokens.color.white,
            backgroundStrong: tokens.color.white,
            backgroundSoft: tokens.color.slate1, // Для карток або фону сторінок
            backgroundHover: tokens.color.slate2,

            // Text Colors
            color: tokens.color.slate6,          // Головний текст (Heading)
            colorSecondary: tokens.color.slate5, // Описи, контент
            colorMuted: tokens.color.slate4,     // Дати, лічильники ("15 words")

            // UI Elements
            borderColor: tokens.color.slate3,
            placeholderColor: tokens.color.slate4,

            // Buttons (Primary - Чорна)
            buttonBg: tokens.color.slate6,
            buttonText: tokens.color.white,

            // Buttons (Secondary - Сіра)
            buttonSecondaryBg: tokens.color.slate2,
            buttonSecondaryText: tokens.color.slate6,

            // Game States (Для карток)
            statusSuccess: tokens.color.green,
            statusDanger: tokens.color.red,
            statusWarning: tokens.color.amber,
            statusInfo: tokens.color.blue,
        },
        dark: {
            background: tokens.color.pureBlack,
            backgroundStrong: '#121212',
            backgroundSoft: '#1A1A1B',
            backgroundHover: '#2A2A2B',

            color: tokens.color.slate1,
            colorSecondary: tokens.color.slate4,
            colorMuted: tokens.color.slate5,

            borderColor: '#334155',
            placeholderColor: tokens.color.slate5,

            buttonBg: tokens.color.white,
            buttonText: tokens.color.pureBlack,

            buttonSecondaryBg: '#2A2A2B',
            buttonSecondaryText: tokens.color.white,

            statusSuccess: '#10B981',
            statusDanger: '#EF4444',
            statusWarning: tokens.color.amber,
            statusInfo: tokens.color.blue,
        },
    },
})

export type AppConfig = typeof appConfig
declare module 'tamagui' {
    interface TamaguiCustomConfig extends AppConfig { }
}

export default appConfig