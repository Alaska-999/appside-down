import { createAnimations } from '@tamagui/animations-react-native'
import { config } from '@tamagui/config/v3'
import { createGenericFont } from '@tamagui/config'
import { createTamagui, createTokens } from 'tamagui'


const tokens = createTokens({
    ...config.tokens,
    color: {
        white: '#FFFFFF',
        pureBlack: '#000000',
        slate1: '#F8FAFC',
        slate2: '#F1F5F9',
        slate3: '#E2E8F0',
        slate4: '#94A3B8',
        slate5: '#475569',
        slate6: '#1A1A1B',
        slate7: '#A9A9A9',
        slate8: '#9DADC4',

        cardSurface: '#FFFFFF',
        cardBack: '#F5F3FF',

        green: '#059669',
        red: '#DC2626',
        amber: '#F59E0B',
        blue: '#0284C7',

        mint: '#2DD4BF',
        lime: '#A3E635',
        mintLight: '#5EEAD4',
        limeLight: '#BEF264',
        auroraBg: '#16192B',
        auroraSurfaceStrong: '#1E2A3D',
        auroraSurfaceSoft: '#243347',
        auroraSurfaceHover: '#33465C',

        heroIndigo: '#4338CA',
        heroTeal: '#0D9488',
        heroLime: '#65A30D',

        auroraText: '#EFFDF8',
        auroraMuted: '#8FA8B8',
        auroraMutedDim: '#64798A',

        nearBlack: '#0D1117',

        // Found hardcoded across screens (progress bars, disabled/link text) — centralized here instead
        indigoAccent: '#6366F1',
        linkBlueDark: '#38BDF8',
        disabledLight: '#B8C2CE',
        disabledDark: '#3F4E5C',
        onAccentTextMuted: '#3A3A3A',
    },
    space: {
        ...config.tokens.space,
        screenX: 19,
        section: 22,
        cardPad: 19,
    },
    radius: {
        ...config.tokens.radius,
        card: 23,
        cardSoft: 20,
        control: 16,
    },
})

// Shared elevation presets (shadowRadius/shadowOpacity) — use instead of inline shadow values per component
export const elevation = {
    sm: { shadowRadius: 12, shadowOpacity: 0.06 },
    md: { shadowRadius: 20, shadowOpacity: 0.1 },
    lg: { shadowRadius: 32, shadowOpacity: 0.16 },
}

// Shared opacity multipliers for interactive states — use instead of inline opacity values per component
export const stateOpacity = {
    disabled: 0.5,
    pressed: 0.7,
    hover: 0.85,
}

const soraFace = {
    normal: { normal: 'Sora_400Regular' },
    bold: { normal: 'Sora_700Bold' },
    400: { normal: 'Sora_400Regular' },
    500: { normal: 'Sora_500Medium' },
    600: { normal: 'Sora_600SemiBold' },
    700: { normal: 'Sora_700Bold' },
    800: { normal: 'Sora_800ExtraBold' },
}

const soraSizes = {
    1: 11, 2: 12, 3: 13, 4: 14, true: 14, 5: 16, 6: 18, 7: 20,
    8: 23, 9: 30, 10: 35, 11: 46, 12: 55, 13: 62, 14: 72, 15: 92, 16: 114,
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
            // Surfaces — screen bg through raised/hover states
            background: tokens.color.white,
            backgroundStrong: tokens.color.white,
            backgroundSoft: tokens.color.slate1,
            backgroundHover: tokens.color.slate2,

            // Text — color: primary/heading, colorSecondary: still meant to be read, colorMuted: hints/timestamps/least important
            color: tokens.color.slate6,
            colorHeading: tokens.color.slate6,
            colorSecondary: tokens.color.slate5,
            colorMuted: tokens.color.slate4,
            colorDisabled: tokens.color.disabledLight,
            colorLink: tokens.color.blue,

            // Borders & placeholders
            borderColor: tokens.color.slate3,
            placeholderColor: tokens.color.slate4,

            // Gradients — brand accent, gradient text fill, decorative hero
            accentGradientStart: tokens.color.mint,
            accentGradientEnd: tokens.color.lime,
            gradientTextStart: tokens.color.mintLight,
            gradientTextEnd: tokens.color.limeLight,
            gradientHeroStart: tokens.color.heroIndigo,
            gradientHeroMid: tokens.color.heroTeal,
            gradientHeroEnd: tokens.color.heroLime,
            progressAccent: tokens.color.indigoAccent,

            // Glass/blur surfaces, glows, sheets, and text-on-accent
            tabBarBg: 'rgba(255,255,255,0.92)',
            glassBg: 'rgba(255,255,255,0.6)',
            glassBgSubtle: 'rgba(15,23,42,0.03)',
            glassBgStrong: 'rgba(15,23,42,0.06)',
            glassBorder: 'rgba(15,23,42,0.08)',
            glassBorderSubtle: 'rgba(15,23,42,0.05)',
            accentBorderSoft: 'rgba(101,163,13,0.3)',
            glowColor: 'rgba(45,212,191,0.35)',
            glowSoft: 'rgba(45,212,191,0.15)',
            glowHero: 'rgba(13,148,136,0.25)',
            sheetBg: 'rgba(248,250,252,0.96)',
            onAccentText: tokens.color.nearBlack,
            onAccentTextMuted: tokens.color.onAccentTextMuted,

            // Legacy pre-Aurora buttons — pending consolidation into AppButton
            buttonBg: tokens.color.slate6,
            buttonText: tokens.color.white,

            buttonSecondaryBg: tokens.color.slate2,
            buttonSecondaryText: tokens.color.slate6,

            // Status colors — success/danger/warning/info states
            statusSuccess: tokens.color.green,
            statusDanger: tokens.color.red,
            statusWarning: tokens.color.amber,
            statusInfo: tokens.color.blue,

            // Legacy pre-Aurora cards — pending consolidation into AppCard
            backgroundCard: tokens.color.slate3,
            darkGrey: tokens.color.slate7,
            gameCard: tokens.color.slate8,
            cardSurface: tokens.color.cardSurface,
            cardBack: tokens.color.cardBack,
        },
        dark: {
            // Surfaces — screen bg through raised/hover states
            background: tokens.color.auroraBg,
            backgroundStrong: tokens.color.auroraSurfaceStrong,
            backgroundSoft: tokens.color.auroraSurfaceSoft,
            backgroundHover: tokens.color.auroraSurfaceHover,

            // Text — color: primary/heading, colorSecondary: still meant to be read, colorMuted: hints/timestamps/least important
            color: tokens.color.auroraText,
            colorHeading: tokens.color.auroraText,
            colorSecondary: tokens.color.auroraMuted,
            colorMuted: tokens.color.auroraMutedDim,
            colorDisabled: tokens.color.disabledDark,
            colorLink: tokens.color.linkBlueDark,

            // Borders & placeholders
            borderColor: '#334155',
            placeholderColor: tokens.color.auroraMuted,

            // Gradients — brand accent, gradient text fill, decorative hero
            accentGradientStart: tokens.color.mint,
            accentGradientEnd: tokens.color.lime,
            gradientTextStart: tokens.color.mintLight,
            gradientTextEnd: tokens.color.limeLight,
            gradientHeroStart: tokens.color.heroIndigo,
            gradientHeroMid: tokens.color.heroTeal,
            gradientHeroEnd: tokens.color.heroLime,
            progressAccent: tokens.color.indigoAccent,

            // Glass/blur surfaces, glows, sheets, and text-on-accent
            tabBarBg: 'rgba(26,40,52,0.92)',
            glassBg: 'rgba(220,255,245,0.06)',
            glassBgSubtle: 'rgba(220,255,245,0.04)',
            glassBgStrong: 'rgba(220,255,245,0.08)',
            glassBorder: 'rgba(220,255,245,0.14)',
            glassBorderSubtle: 'rgba(220,255,245,0.08)',
            accentBorderSoft: 'rgba(163,230,53,0.4)',
            glowColor: 'rgba(45,212,191,0.5)',
            glowSoft: 'rgba(45,212,191,0.1)',
            glowHero: 'rgba(13,148,136,0.3)',
            sheetBg: 'rgba(26,40,52,0.96)',
            onAccentText: tokens.color.nearBlack,
            onAccentTextMuted: tokens.color.onAccentTextMuted,

            // Legacy pre-Aurora buttons — pending consolidation into AppButton
            buttonBg: tokens.color.white,
            buttonText: tokens.color.pureBlack,

            buttonSecondaryBg: '#2A2A2B',
            buttonSecondaryText: tokens.color.white,

            // Status colors — success/danger/warning/info states
            statusSuccess: '#10B981',
            statusDanger: '#EF4444',
            statusWarning: tokens.color.amber,
            statusInfo: tokens.color.blue,

            // Legacy pre-Aurora cards — pending consolidation into AppCard
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
