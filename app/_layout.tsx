import { useAuthStore } from "@/src/store/useAuthStore";
import config from "@/tamagui.config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { PortalProvider, TamaguiProvider, Theme } from "tamagui";

const queryClient = new QueryClient();

export default function RootLayout() {
  const { token, isHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  console.log("hello");

  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === "(auth)";

    console.log(token, inAuthGroup);
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
  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <PortalProvider>
        <Theme name="light">
          <QueryClientProvider client={queryClient}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
              <Stack.Screen
                name="module/game"
                options={{
                  gestureEnabled: false, // Забороняємо свайп "назад" під час гри
                  presentation: "fullScreenModal",
                }}
              />
            </Stack>
          </QueryClientProvider>
        </Theme>
      </PortalProvider>
    </TamaguiProvider>
  );
}
