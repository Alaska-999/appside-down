import {
  MARK_INK,
  MARK_VIEWBOX,
  SvitlyMark,
} from "@/src/components/brand/SvitlyMark";
import { GradientText } from "@/src/components/ui/GradientText";
import { MeshGradientBackground } from "@/src/components/ui/MeshGradientBackground";
import { GRADIENT_SOFT } from "@/src/constants/gradients";
import {
  ICON_BASE,
  ICON_MUTED,
  ICON_NEAR_BLACK,
  ICON_TEXT,
} from "@/src/constants/iconColors";
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
import React, { useCallback, useEffect, useRef, useState } from "react";
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
  runOnJS,
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
const GRADIENT_TEXT_RIGHT_PAD = 6;
const MARK_SCALE = MARK_SIZE / MARK_VIEWBOX;
const MARK_INK_WIDTH = MARK_INK.width * MARK_SCALE;
const MARK_INK_HEIGHT = MARK_INK.height * MARK_SCALE;
const MARK_TO_WORDMARK = 37.3;
const STACK_TOP_FROM_CENTER = -140.375;
const EXIT_DELAY = 2550;
const EXIT_MS = 340;
const SOFT_OUT = Easing.bezier(0.2, 0.8, 0.3, 1);

interface AppSplashProps {
  ready: boolean;
  onExited: () => void;
}

export function AppSplash({ ready, onExited }: AppSplashProps) {
  const still = useReducedMotion();
  const [wordmarkWidth, setWordmarkWidth] = useState(0);
  const mountedAt = useRef(0);

  const reveal = useSharedValue(still ? 1 : 0);
  const tagline = useSharedValue(still ? 1 : 0);
  const exit = useSharedValue(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

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
  }, [still, reveal, tagline]);

  useEffect(() => {
    if (!ready) return;

    const elapsed = Date.now() - mountedAt.current;
    const delay = still ? 0 : Math.max(0, EXIT_DELAY - elapsed);

    exit.value = withDelay(
      delay,
      withTiming(
        1,
        { duration: EXIT_MS, easing: Easing.in(Easing.quad) },
        (finished) => {
          if (finished) {
            runOnJS(onExited)();
          }
        },
      ),
    );
  }, [ready, still, exit, onExited]);

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

  const taglineStyle = useAnimatedStyle(() => {
    const tracking =
      TAGLINE_TRACKING_FROM +
      (TAGLINE_TRACKING_TO - TAGLINE_TRACKING_FROM) * tagline.value;
    return {
      opacity: tagline.value,
      letterSpacing: tracking,
      transform: [{ translateX: tracking / 2 }],
    };
  });

  const measureWordmark = (event: LayoutChangeEvent) => {
    setWordmarkWidth(event.nativeEvent.layout.width);
  };

  return (
    <Animated.View style={[styles.splashRoot, rootStyle]}>
      <MeshGradientBackground variant="calm-mist" />

      <View style={styles.splashStack} pointerEvents="none">
        <View style={styles.markSlot}>
          <SvitlyMark mode={still ? "static" : "draw"} size={MARK_SIZE} />
        </View>

        <View style={styles.splashWords}>
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

export default function RootLayout() {
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });
  const segments = useSegments();
  const router = useRouter();

  const [splashVisible, setSplashVisible] = useState(true);
  const isReady = isHydrated && fontsLoaded;

  const hideSplash = useCallback(() => setSplashVisible(false), []);

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

  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TamaguiProvider config={config} defaultTheme="dark">
          <PortalProvider>
            <Theme name="dark">
              <QueryClientProvider client={queryClient}>
                {isReady ? (
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
                ) : null}
              </QueryClientProvider>
            </Theme>
          </PortalProvider>
        </TamaguiProvider>

        {splashVisible && <AppSplash ready={isReady} onExited={hideSplash} />}
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  splashRoot: {
    ...StyleSheet.absoluteFill,
    backgroundColor: ICON_BASE,
  },
  splashStack: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
    marginTop: STACK_TOP_FROM_CENTER,
    alignItems: "center",
  },
  markSlot: {
    width: MARK_INK_WIDTH,
    height: MARK_INK_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  splashWords: {
    marginTop: MARK_TO_WORDMARK,
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
    transform: [{ translateX: GRADIENT_TEXT_RIGHT_PAD / 2 }],
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
