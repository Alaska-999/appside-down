import { useAuthStore } from "@/src/store/useAuthStore";
import { router } from "expo-router";
import { Button, Text, View } from "tamagui";

export default function Home() {
  const logout = () => {
    useAuthStore.getState().logout();
    router.replace("/login");
  };
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text mb="$4">Home Screen</Text>
      <Button onPress={logout}>Log Out</Button>
    </View>
  );
}
