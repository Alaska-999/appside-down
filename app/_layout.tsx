import { AuroraBeams } from "@/src/components/ui/AuroraBeams";
import {
  ICON_BASE_DEEP,
  ICON_HERO_LIME,
  ICON_MUTED,
  ICON_NEAR_BLACK,
  ICON_TEAL,
  ICON_TEXT,
  ICON_WHITE,
} from "@/src/constants/iconColors";
import {
  MeshGradientBackground,
  MeshVariant,
} from "@/src/components/ui/MeshGradientBackground";
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
import "@tamagui/native/setup-expo-linear-gradient";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { PortalProvider, TamaguiProvider, Theme } from "tamagui";

const queryClient = new QueryClient();

type SplashVariant = "aurora" | MeshVariant;

// Доступні 5 затверджених варіантів
const SPLASH_VARIANTS: SplashVariant[] = [
  "mesh-full",
  "mesh-dark",
  "fall-morph",
  "breathe-core",
  "aurora",
];

function AppSplashSpinner() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1,
      false,
    );
  }, [rotation]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return <Animated.View style={[styles.ring, spinStyle]} />;
}

export function AppSplash() {
  // Індекс активного варіанта для перемикання тапом
  const [variantIndex, setVariantIndex] = useState(1); // За замовчуванням "mesh-dark" (№2)

  const currentVariant = SPLASH_VARIANTS[variantIndex];

  const handleNextVariant = () => {
    setVariantIndex((prev) => (prev + 1) % SPLASH_VARIANTS.length);
  };

  return (
    <Pressable style={styles.splashRoot} onPress={handleNextVariant}>
      {/* Динамічний анімований фон */}
      {currentVariant === "aurora" ? (
        <AuroraBeams intensity={1.5} coverage="full" motion="lively" />
      ) : (
        <MeshGradientBackground variant={currentVariant} />
      )}

      {/* Центровий блок логотипа та спінера */}
      <View style={styles.splashCenter}>
        <Text style={styles.wm}>Appside</Text>
        <AppSplashSpinner />
      </View>

      {/* Підказка перемикання (для тестування) */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {variantIndex + 1}/{SPLASH_VARIANTS.length}: {currentVariant} (Тап для
          зміни)
        </Text>
      </View>
    </Pressable>
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
          colors={[ICON_TEAL, ICON_HERO_LIME]}
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

const SPLASH_FLASH_THRESHOLD = 300;
const SPLASH_HOLD_DURATION = 3000;
// Прев'ю мешу: залишаємо true, поки триває підбір варіантів на девайсі.
// Поверни false, щоб знову увімкнути реальний стек (TamaguiProvider/Stack нижче).
const SPLASH_PREVIEW = false;

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

  if (SPLASH_PREVIEW || !isReady || splashHeld) {
    return <AppSplash />;
  }

  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TamaguiProvider config={config} defaultTheme="dark">
          <PortalProvider>
            <Theme name="dark">
              <QueryClientProvider client={queryClient}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="(auth)" />
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
    backgroundColor: ICON_BASE_DEEP, // Темний фон підкладки з HTML[cite: 2]
  },
  splashCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 7,
  },
  wm: {
    fontSize: 23, // Розмір тексту з HTML[cite: 2]
    fontFamily: "Sora_800ExtraBold",
    fontWeight: "800",
    color: ICON_WHITE,
    // М'яка тінь для чіткості поверх світлих зон мешу[cite: 2]
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 24,
  },
  ring: {
    width: 22, // Розміри спінера з HTML[cite: 2]
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: "rgba(255,255,255,0.18)", // Напівпрозоре кільце[cite: 2]
    borderTopColor: "rgba(255,255,255,0.9)", // Біла дуга[cite: 2]
  },
  badge: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    zIndex: 10,
  },
  badgeText: {
    color: ICON_MUTED,
    fontSize: 11,
    fontWeight: "600",
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
