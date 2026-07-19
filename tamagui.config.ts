import { createAnimations } from '@tamagui/animations-react-native'
import { config } from '@tamagui/config/v3'
import { createGenericFont } from '@tamagui/config'
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
        slate7: '#A9A9A9',
        slate8: '#9DADC4',

        // Game card surfaces
        cardSurface: '#FFFFFF',
        cardBack: '#F5F3FF',

        // Semantic (Смислові - для гри та статусів)
        green: '#059669',  // Known
        red: '#DC2626',    // Still Learning
        amber: '#F59E0B',  // Starred / Favorite
        blue: '#0284C7',   // Info / Profile progress

        // Design-system redesign: indigo->cyan accent gradient + violet-tinted dark surfaces
        indigo: '#6366F1',
        cyan: '#22D3EE',
        // світліші й "об'ємніші" за проханням юзера — попередні відтінки читались
        // як суцільна чорнота без глибини; ці значення звірені з затвердженим
        // bento-мокапом Home (.superpowers/brainstorm/.../home-bento-v7.html)
        nearBlackViolet: '#1C1930',
        darkSurfaceStrong: '#221F3D',
        darkSurfaceSoft: '#2A2642',
        darkSurfaceHover: '#3A3460',

        // акцентна пара з мокапа home-bento-v7: світлі indigo→sky, використовуються
        // для градієнтного тексту, кільця аватарки, активного таба, прогрес-кільця
        indigoLight: '#818CF8',
        sky: '#38BDF8',

        // hero-градієнт StreakCard — три стопи з мокапа (120deg, середній на 60%)
        heroIndigo: '#4C46A8',
        heroBlue: '#3D6FB8',
        heroTeal: '#2FA3B8',

        // приглушений лавандовий текст на темних поверхнях (мокап #a29dc4 /
        // #8f8ab0) — slate4/5 на фіолетовому тлі читались брудно-сірими
        lavenderGray: '#A29DC4',
        lavenderGrayDim: '#8F8AB0',
    },
    space: {
        ...config.tokens.space,
        // семантичні відступи макета Home (bento, значення з home-bento-v7):
        // паддінг екрана по X, крок між секціями, внутрішній паддінг карток
        screenX: 16,
        section: 20,
        cardPad: 16,
    },
    radius: {
        ...config.tokens.radius,
        card: 20,    // великі поверхні: bento-картки, hero-плитка (мокап 20)
        control: 16, // інпути, кнопки, компактні контроли
    },
})

// RN не підтримує один family з різними вагами — кожна вага Sora це окремий
// файл/family, тому мапимо вагу на конкретну назву через `face` (тільки native)
// деякі місця в апці досі задають fontWeight="bold"/"normal" (рядком, не числом) —
// без цих alias-ів face-лукап на них мовчки не спрацьовує і рендериться Sora Regular
const soraFace = {
    normal: { normal: 'Sora_400Regular' },
    bold: { normal: 'Sora_700Bold' },
    400: { normal: 'Sora_400Regular' },
    500: { normal: 'Sora_500Medium' },
    600: { normal: 'Sora_600SemiBold' },
    700: { normal: 'Sora_700Bold' },
    800: { normal: 'Sora_800ExtraBold' },
}

// дефолтна шкала createGenericFont, але $10 перевизначено 46 → 32: це наш
// "display"-крок (привітання Home, цифра стріку; мокап 30-32) — 46 для
// мобільного екрана завеликий; $11 лишається 46 для сумісності
const soraSizes = {
    1: 11, 2: 12, 3: 13, 4: 14, true: 14, 5: 16, 6: 18, 7: 20,
    8: 23, 9: 30, 10: 32, 11: 46, 12: 55, 13: 62, 14: 72, 15: 92, 16: 114,
}

const soraHeadingFont = createGenericFont('Sora_700Bold', {
    size: soraSizes,
    weight: { 6: '700', 7: '800' },
    face: soraFace,
})

const soraBodyFont = createGenericFont('Sora_400Regular', {
    size: soraSizes,
    weight: { 1: '400', 5: '500', 6: '600' },
    face: soraFace,
})

// 2. ТЕМИ (Логічні ролі)
// Тут ми кажемо, ЯКИЙ токен відповідає за ЯКУ роль.
const appConfig = createTamagui({
    ...config,
    tokens,
    fonts: {
        ...config.fonts,
        heading: soraHeadingFont,
        body: soraBodyFont,
    },
    animations: createAnimations({
        bouncy: {
            damping: 10,
            mass: 0.9,
            stiffness: 100,
        },
        lazy: {
            damping: 18,
            stiffness: 50,
        },
        quick: {
            damping: 20,
            mass: 1.2,
            stiffness: 250,
        },
    }),
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

            // Design-system redesign tokens
            accentGradientStart: tokens.color.indigoLight,
            accentGradientEnd: tokens.color.sky,
            gradientHeroStart: tokens.color.heroIndigo,
            gradientHeroMid: tokens.color.heroBlue,
            gradientHeroEnd: tokens.color.heroTeal,
            tabBarBg: 'rgba(255,255,255,0.92)',
            glassBg: 'rgba(255,255,255,0.6)',
            glassBorder: 'rgba(15,23,42,0.08)',
            glowColor: 'rgba(99,102,241,0.35)',

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

            backgroundCard: tokens.color.slate3,
            darkGrey: tokens.color.slate7,
            gameCard: tokens.color.slate8,
            cardSurface: tokens.color.cardSurface,
            cardBack: tokens.color.cardBack,
        },
        dark: {
            background: tokens.color.nearBlackViolet,
            backgroundStrong: tokens.color.darkSurfaceStrong,
            backgroundSoft: tokens.color.darkSurfaceSoft,
            backgroundHover: tokens.color.darkSurfaceHover,

            color: tokens.color.slate1,
            colorSecondary: tokens.color.lavenderGray,
            colorMuted: tokens.color.lavenderGrayDim,

            borderColor: '#334155',
            placeholderColor: tokens.color.lavenderGray,

            // Design-system redesign tokens
            accentGradientStart: tokens.color.indigoLight,
            accentGradientEnd: tokens.color.sky,
            gradientHeroStart: tokens.color.heroIndigo,
            gradientHeroMid: tokens.color.heroBlue,
            gradientHeroEnd: tokens.color.heroTeal,
            // напівпрозорий фіолетовий острівець таббара (мокап rgba(40,36,68,0.9))
            tabBarBg: 'rgba(40,36,68,0.92)',
            // біле напівпрозоре скло (не фіолетове) — звірено з затвердженим
            // bento-мокапом Home, дає "справжній" контраст поверх темного тла
            glassBg: 'rgba(255,255,255,0.09)',
            glassBorder: 'rgba(255,255,255,0.16)',
            glowColor: 'rgba(129,140,248,0.4)',

            buttonBg: tokens.color.white,
            buttonText: tokens.color.pureBlack,

            buttonSecondaryBg: '#2A2A2B',
            buttonSecondaryText: tokens.color.white,

            statusSuccess: '#10B981',
            statusDanger: '#EF4444',
            statusWarning: tokens.color.amber,
            statusInfo: tokens.color.blue,

            backgroundCard: tokens.color.blue,
            darkGrey: tokens.color.slate7,
            gameCard: tokens.color.slate8,
            cardSurface: '#1E293B',
            cardBack: '#1A1A2E',

        },
    },
})

export type AppConfig = typeof appConfig
declare module 'tamagui' {
    interface TamaguiCustomConfig extends AppConfig { }
}

export default appConfig