import { SvitlyMark, MARK_TIMING } from "@/src/components/brand/SvitlyMark";
import { GradientText } from "@/src/components/ui/GradientText";
import { MeshGradientBackground } from "@/src/components/ui/MeshGradientBackground";
import {
  ICON_BASE,
  ICON_MUTED,
  ICON_NEAR_BLACK,
  ICON_TEXT,
} from "@/src/constants/iconColors";
import { GRADIENT_SOFT } from "@/src/constants/gradients";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useStudyQueueStore } from "@/src/store/useStudyQueueStore";
import config, { controlHeight } from "@/tamagui.config";
import {
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/sora";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { PortalProvider, TamaguiProvider, Theme } from "tamagui";

const queryClient = new QueryClient();

const MARK_SIZE = 120;
const WORDMARK_SIZE = 44;
const WORDMARK_DELAY = 1500;
const WORDMARK_MS = 600;
const TAGLINE_DELAY = 1900;
const TAGLINE_MS = 500;
const TAGLINE_TRACKING_FROM = 4.59;
const TAGLINE_TRACKING_TO = 2.7;
const EXIT_DELAY = 2550;
const EXIT_MS = 340;
const SOFT_OUT = Easing.bezier(0.2, 0.8, 0.3, 1);

export function AppSplash() {
  const still = useReducedMotion();
  const [wordmarkWidth, setWordmarkWidth] = useState(0);

  const reveal = useSharedValue(still ? 1 : 0);
  const tagline = useSharedValue(still ? 1 : 0);
  const exit = useSharedValue(0);

  useEffect(() => {
    if (still) return;

    reveal.value = withDelay(
      WORDMARK_DELAY,
      withTiming(1, { duration: WORDMARK_MS, easing: SOFT_OUT }),
    );
    tagline.value = withDelay(
      TAGLINE_DELAY,
      withTiming(1, { duration: TAGLINE_MS, easing: Easing.out(Easing.quad) }),
    );
    exit.value = withDelay(
      EXIT_DELAY,
      withTiming(1, { duration: EXIT_MS, easing: Easing.in(Easing.quad) }),
    );
  }, [still, reveal, tagline, exit]);

  const rootStyle = useAnimatedStyle(() => ({
    opacity: 1 - exit.value,
    transform: [{ scale: 1 + exit.value * 0.04 }],
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: reveal.value,
    transform: [{ translateY: (1 - reveal.value) * 14 }],
  }));

  const wordmarkClipStyle = useAnimatedStyle(() => ({
    width: wordmarkWidth === 0 ? undefined : wordmarkWidth * reveal.value,
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: tagline.value,
    letterSpacing:
      TAGLINE_TRACKING_FROM +
      (TAGLINE_TRACKING_TO - TAGLINE_TRACKING_FROM) * tagline.value,
  }));

  const measureWordmark = (event: LayoutChangeEvent) => {
    setWordmarkWidth(event.nativeEvent.layout.width);
  };

  return (
    <Animated.View style={[styles.splashRoot, rootStyle]}>
      <MeshGradientBackground variant="calm-mist" />

      <View style={styles.splashMark} pointerEvents="none">
        <SvitlyMark mode={still ? "static" : "draw"} size={MARK_SIZE} />
      </View>

      <View style={styles.splashWords} pointerEvents="none">
        <Animated.View
          style={[
            styles.wordmarkOuter,
            wordmarkStyle,
            wordmarkWidth > 0 && { width: wordmarkWidth },
          ]}
        >
          <Animated.View style={[styles.wordmarkClip, wordmarkClipStyle]}>
            <View onLayout={measureWordmark} style={styles.wordmarkInner}>
              <GradientText fontSize={WORDMARK_SIZE}>Svitly</GradientText>
            </View>
          </Animated.View>
        </Animated.View>
        <Animated.Text style={[styles.tagline, taglineStyle]}>
          Illuminate your learning
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

export function ErrorBoundary({
  error,
  retry,
}: {
  error: Error;
  retry: () => Promise<void>;
}) {
  if (__DEV__) {
    console.error(error);
  }
  return (
    <View style={styles.errorRoot}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorSubtitle}>
        Looks like a connection hiccup. Your data is safe — try again.
      </Text>
      <Pressable onPress={retry}>
        <LinearGradient
          colors={GRADIENT_SOFT}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.errorRetry}
        >
          <Text style={styles.errorRetryLabel}>Retry</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const SCREEN_BASE = "#08090C";

const SHEET_SCREEN = {
  animation: "slide_from_bottom",
} as const;

const SHEET_LOCKED = { ...SHEET_SCREEN, gestureEnabled: false } as const;

const SPLASH_FLASH_THRESHOLD = 300;
const SPLASH_HOLD_DURATION =
  MARK_TIMING.drawDelayMs + MARK_TIMING.drawMs + 1000;

export default function RootLayout() {
  const { token, isHydrated } = useAuthStore();
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });
  const segments = useSegments();
  const router = useRouter();

  const splashStartRef = useRef(Date.now());
  const [splashHeld, setSplashHeld] = useState(false);
  const isReady = isHydrated && fontsLoaded;

  useEffect(() => {
    if (!isReady) return;

    const elapsed = Date.now() - splashStartRef.current;
    if (elapsed < SPLASH_FLASH_THRESHOLD) {
      return;
    }

    setSplashHeld(true);
    const remaining = SPLASH_HOLD_DURATION - elapsed;
    const timeout = setTimeout(() => setSplashHeld(false), remaining);
    return () => clearTimeout(timeout);
  }, [isReady]);

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === "(auth)";

    const performRedirect = () => {
      if (!token && !inAuthGroup) {
        router.replace("/login");
      } else if (token && inAuthGroup) {
        router.replace("/");
      }
    };
    const timeout = setTimeout(performRedirect, 1);
    return () => clearTimeout(timeout);
  }, [token, isHydrated, segments]);

  useEffect(() => {
    if (isHydrated && token) {
      useStudyQueueStore.getState().flush();
    }
  }, [isHydrated, token]);

  if (!isReady || splashHeld) {
    return <AppSplash />;
  }

  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TamaguiProvider config={config} defaultTheme="dark">
          <PortalProvider>
            <Theme name="dark">
              <QueryClientProvider client={queryClient}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    animation: "slide_from_right",
                    contentStyle: { backgroundColor: SCREEN_BASE },
                  }}
                >
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="(auth)" />
                  <Stack.Screen name="module/create" options={SHEET_LOCKED} />
                  <Stack.Screen name="folder/create" options={SHEET_LOCKED} />
                  <Stack.Screen name="folder/edit" options={SHEET_SCREEN} />
                  <Stack.Screen
                    name="folder/add-modules"
                    options={SHEET_SCREEN}
                  />
                </Stack>
              </QueryClientProvider>
            </Theme>
          </PortalProvider>
        </TamaguiProvider>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  splashRoot: {
    flex: 1,
    backgroundColor: ICON_BASE,
  },
  splashMark: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  splashWords: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    marginTop: 78,
    alignItems: "center",
  },
  wordmarkOuter: {
    alignItems: "flex-start",
  },
  wordmarkClip: {
    overflow: "hidden",
    alignItems: "flex-start",
  },
  wordmarkInner: {
    flexShrink: 0,
  },
  tagline: {
    marginTop: 10,
    fontSize: 13.5,
    fontFamily: "Sora_500Medium",
    color: ICON_MUTED,
  },
  errorRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
    backgroundColor: ICON_NEAR_BLACK,
  },
  errorTitle: {
    color: ICON_TEXT,
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
  },
  errorSubtitle: {
    color: ICON_MUTED,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 280,
  },
  errorRetry: {
    height: controlHeight.lg,
    borderRadius: 999,
    paddingHorizontal: 32,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  errorRetryLabel: {
    color: ICON_TEXT,
    fontSize: 17,
    fontWeight: "700",
  },
});
