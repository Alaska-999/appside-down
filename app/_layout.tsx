import { AuroraBeams } from "@/src/components/ui/AuroraBeams";
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
import MaskedView from "@react-native-masked-view/masked-view";
import "@tamagui/native/setup-expo-linear-gradient";
import "@tamagui/native/setup-zeego";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef, useState } from "react";
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

const MOCKUP_SCALE = 390 / 250;
const SPLASH_NAME_SIZE = 26 * MOCKUP_SCALE;
const SPLASH_GAP = 14 * MOCKUP_SCALE;
const SPINNER_SIZE = 26 * MOCKUP_SCALE;
const SPINNER_BORDER_WIDTH = 3 * MOCKUP_SCALE;

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

  return <Animated.View style={[styles.spinner, spinStyle]} />;
}

function AppSplash() {
  return (
    <View style={styles.splashRoot}>
      <AuroraBeams intensity={1.5} coverage="full" motion="lively" />
      <View style={styles.splashCenter}>
        <MaskedView
          maskElement={<Text style={styles.splashName}>Appside</Text>}
        >
          <LinearGradient
            colors={["#2DD4BF", "#A3E635"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.splashName, { opacity: 0 }]}>Appside</Text>
          </LinearGradient>
        </MaskedView>
        <AppSplashSpinner />
      </View>
    </View>
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
          colors={["#0D9488", "#65A30D"]}
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
    backgroundColor: "#11141F",
  },
  splashCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: SPLASH_GAP,
  },
  splashName: {
    fontSize: SPLASH_NAME_SIZE,
    fontWeight: "800",
  },
  spinner: {
    width: SPINNER_SIZE,
    height: SPINNER_SIZE,
    borderRadius: SPINNER_SIZE / 2,
    borderWidth: SPINNER_BORDER_WIDTH,
    borderColor: "rgba(220,255,245,0.12)",
    borderTopColor: "#2DD4BF",
  },
  errorRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 24,
    backgroundColor: "#0D1117",
  },
  errorTitle: {
    color: "#EFFDF8",
    fontSize: 19,
    fontWeight: "800",
    textAlign: "center",
  },
  errorSubtitle: {
    color: "#8FA8B8",
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
    color: "#EFFDF8",
    fontSize: 17,
    fontWeight: "700",
  },
});
