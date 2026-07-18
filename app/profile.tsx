import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { useAuthStore } from "@/src/store/useAuthStore";
import { BellRing, Flame, Settings } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { Button, Text, XStack, YStack } from "tamagui";

export default function ProfileScreen() {
  const { user } = useAuthStore();

  return (
    <YStack f={1} bg="$background">
      <ScreenHeader title="Profile" />

      <YStack f={1} ai="center" gap="$4" px="$4">
        <UserAvatar
          avatarUrl={user?.avatarUrl}
          username={user?.username}
          size="$8"
        />

        <YStack ai="center" gap="$1">
          <Text fontSize="$7" fontWeight="bold" color="$color">
            {user?.username ?? "Unknown"}
          </Text>
          <Text fontSize="$4" color="$colorMuted">
            {user?.email}
          </Text>
        </YStack>

        <XStack
          ai="center"
          gap="$2"
          bg="$backgroundHover"
          br="$10"
          px="$4"
          py="$2"
        >
          <Flame size={16} color="$statusWarning" />
          <Text fontSize="$4" fontWeight="600" color="$color">
            {user?.streak?.currentStreak ?? 0} day streak
          </Text>
        </XStack>

        <YStack
          gap="$3"
          ai="center"
          jc="center"
          width="100%"
          maxWidth={300}
          mt="$4"
        >
          <Button
            icon={<Settings size="$1" color="$color" />}
            bg="$buttonSecondaryBg"
            onPress={() => router.push("/settings")}
            width="100%"
          >
            <Text color="$color" fontWeight="600">
              Settings
            </Text>
          </Button>

          <Button
            icon={<BellRing size="$1" color="$color" />}
            bg="$buttonSecondaryBg"
            // onPress={() => router.push("/settings")}
            width="100%"
            disabled
            opacity={0.5}
          >
            <Text color="$color" fontWeight="600">
              Activity
            </Text>
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
}
