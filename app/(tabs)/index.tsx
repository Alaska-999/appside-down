import { useAuthStore } from "@/src/store/useAuthStore";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Button, Text, View } from "tamagui";

export default function Home() {
  const logout = async () => {
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: useAuthStore.getState().user?.id }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      useAuthStore.getState().logout();
      await SecureStore.deleteItemAsync("refreshToken");

      router.replace("/login");
    }
  };

  const doSmth = async () => {
    try {
      const response = await protectedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/test-protected`,
      );
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text mb="$4">Home Screen</Text>
      <Button onPress={logout}>Log Out</Button>
      <Button onPress={doSmth} mt="$2">
        Do Smth
      </Button>
    </View>
  );
}
