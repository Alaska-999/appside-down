import { useAuthStore } from "@/src/store/useAuthStore";
import { useStudyQueueStore } from "@/src/store/useStudyQueueStore";
import config from "@/tamagui.config";
import {
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/sora";
import "@tamagui/native/setup-expo-linear-gradient";
import "@tamagui/native/setup-zeego";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Button, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { PortalProvider, TamaguiProvider, Theme } from "tamagui";

const queryClient = new QueryClient();

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
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        padding: 24,
        backgroundColor: "#000",
      }}
    >
      <Text style={{ color: "#fff", fontSize: 16, textAlign: "center" }}>
        Something went wrong. Please try again.
      </Text>
      <Button title="Retry" onPress={retry} />
    </View>
  );
}

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
      //for events that were not sent on prev session
      useStudyQueueStore.getState().flush();
    }
  }, [isHydrated, token]);

  if (!isHydrated || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
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
                  <Stack.Screen
                    name="(auth)"
                    options={{ presentation: "modal" }}
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
