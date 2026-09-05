import { createAnimations } from '@tamagui/animations-react-native'
import { createGenericFont } from '@tamagui/config'
import { config } from '@tamagui/config/v3'
import { Easing } from 'react-native-reanimated'
import { createTamagui, createTokens } from 'tamagui'


const tokens = createTokens({
    ...config.tokens,
    color: {
        white: '#FFFFFF',
        pureBlack: '#000000',

        mint: '#2DD4BF',
        mintLight: '#5EEAD4',
        roseSoft: '#FCA5A5',
        teal: '#0D9488',
        lime: '#A3E635',
        limeLight: '#BEF264',
        heroLime: '#65A30D',
        indigo: '#4338CA',
        indigoAccent: '#6366F1',
        text: '#EFFDF8',
        textMuted: '#8FA8B8',
        nearBlack: '#0D1117',
        base: '#08090C',
        baseTop: '#0E1A1E',

        amber: '#F59E0B',
        blue: '#0284C7',
        linkBlueDark: '#38BDF8',
        disabledDark: '#3F4E5C',
        onAccentTextMuted: '#3A3A3A',

        mutedDim: '#5A6B7A',
        iconOnGlass: '#EAF7FF',
        backgroundDeep: '#11141F',
        mintTintDark: '#06231F',
        indigoLight: '#818CF8',
        mutedLight: '#B7CEDA',
    },
    space: {
        ...config.tokens.space,
        screenX: 16,
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

export const controlHeight = {
    sm: 42,
    md: 52,
    lg: 60,
}

export const screenGutter = 16

export const topPaddingBoost = 18

export const elevation = {
    sm: { shadowRadius: 12, shadowOpacity: 0.06 },
    md: { shadowRadius: 20, shadowOpacity: 0.1 },
    lg: { shadowRadius: 32, shadowOpacity: 0.16 },
}

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
            type: 'spring',
            damping: 100,
            mass: 1,
            stiffness: 500,
        },
        fade: {
            type: 'timing',
            duration: 40,
        },
        press: {
            type: 'timing',
            duration: 170,
            easing: Easing.bezier(0.2, 0.8, 0.3, 1).factory(),
        },
        simple: {
            stiffness: 20,
        }
    }),
    themes: {
        dark: {
            background: tokens.color.base,
            backgroundTop: tokens.color.baseTop,
            backgroundStrong: tokens.color.nearBlack,

            color: tokens.color.text,
            colorHeading: tokens.color.text,
            colorSecondary: tokens.color.textMuted,
            colorMuted: tokens.color.textMuted,
            colorDisabled: tokens.color.disabledDark,
            colorLink: tokens.color.linkBlueDark,
            iconMuted: '#6E8496',
            iconOnGlass: tokens.color.iconOnGlass,

            borderColor: 'rgba(220,255,245,0.13)',
            hairline: 'rgba(220,255,245,0.08)',
            placeholderColor: tokens.color.textMuted,

            accentGradientStart: tokens.color.mint,
            accentGradientEnd: tokens.color.lime,
            gradientTextStart: tokens.color.mintLight,
            gradientTextEnd: tokens.color.limeLight,
            gradientHeroStart: tokens.color.indigo,
            gradientHeroMid: tokens.color.teal,
            gradientHeroEnd: tokens.color.heroLime,
            progressAccent: tokens.color.indigoAccent,

            surfaceCard: 'rgba(20,28,34,0.55)',
            surfaceWell: 'rgba(4,7,10,0.5)',
            surfaceGlass: 'rgba(220,255,245,0.06)',
            surfaceGlassFaint: 'rgba(220,255,245,0.03)',
            tabBarBg: 'rgba(14,26,28,0.62)',
            sheetBg: 'rgba(20,27,34,0.4)',

            glassBg: 'rgba(220,255,245,0.06)',
            glassBgSubtle: 'rgba(220,255,245,0.03)',
            glassBgStrong: 'rgba(220,255,245,0.08)',
            glassBorder: 'rgba(220,255,245,0.13)',
            glassBorderSubtle: 'rgba(220,255,245,0.08)',
            accentBorderSoft: 'rgba(163,230,53,0.4)',
            glowColor: 'rgba(45,212,191,0.5)',
            glowSoft: 'rgba(45,212,191,0.1)',
            glowHero: 'rgba(13,148,136,0.3)',
            mintGlassBg: 'rgba(45,212,191,0.14)',
            mintGlassBorder: 'rgba(45,212,191,0.28)',
            onAccentText: tokens.color.nearBlack,
            onAccentTextMuted: tokens.color.onAccentTextMuted,

            statusSuccess: '#10B981',
            statusDanger: '#EF4444',
            dangerText: tokens.color.roseSoft,
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
