import { UserAvatar } from "@/src/components/common/UserAvatar";
import { useAuthStore } from "@/src/store/useAuthStore";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { Search } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Input, XStack, YStack } from "tamagui";

export default function Home() {
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState("");
  const { user } = useAuthStore();
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

  const navigateToProfile = () => {
    router.push({
      pathname: "/profile",
      params: {
        userId: user?.id,
      },
    });
  };

  return (
    <YStack f={1} bg="$background" pt={insets.top}>
      <YStack px="$4" gap="$3" f={1}>
        <XStack jc="space-between" gap="$3" ai="center">
          <XStack
            f={1}
            bg="$backgroundHover"
            br="$10"
            px="$3"
            ai="center"
            gap="$2"
            borderWidth={1}
            borderColor="$borderColor"
            h={40}
          >
            <Search size={16} color="$colorMuted" />
            <Input
              f={1}
              unstyled
              placeholder="Search..."
              value={search}
              onChangeText={setSearch}
              fontSize="$4"
              color="$color"
              placeholderTextColor="$colorMuted"
            />
          </XStack>
          <UserAvatar
            avatarUrl={user?.avatarUrl}
            username={user?.username}
            size="$3"
            onPress={navigateToProfile}
          />
        </XStack>
        <YStack mt="$4">
          <Button onPress={logout} bg="$buttonSecondaryBg">
            Log Out
          </Button>
          <Button onPress={doSmth} bg="$buttonSecondaryBg" mt="$2">
            Do Smth
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
}
