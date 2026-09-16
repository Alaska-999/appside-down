import { StreakCard } from "@/src/components/cards/StreakCard";
import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { Row, Rows } from "@/src/components/ui/Rows";
import { ScreenBackground } from "@/src/components/ui/ScreenBackground";
import { SectionTitle } from "@/src/components/ui/SectionTitle";
import { useAuthStore } from "@/src/store/useAuthStore";
import { router } from "expo-router";
import { BellRing, Settings } from "lucide-react-native";
import { Text, YStack } from "tamagui";

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <ScreenBackground preset="twilightDuo">
      <ScreenHeader title="Profile" />

      <YStack f={1} px="$screenX" gap={20} pt="$2">
        <YStack ai="center" pt={8} pb={2}>
          <UserAvatar
            avatarUrl={user?.avatarUrl}
            username={user?.username}
            size={102}
          />
          <Text fontSize={23} fontWeight="800" color="$color" mt={12}>
            {user?.username ?? "Unknown"}
          </Text>
          <Text fontSize={14} color="$colorMuted" mt={3}>
            {user?.email}
          </Text>
        </YStack>

        <StreakCard
          currentStreak={user?.streak?.currentStreak ?? 0}
          todayIndex={todayIndex}
        />

        <YStack gap={8}>
          <SectionTitle tone="eyebrow" px={4}>
            Account
          </SectionTitle>
          <Rows variant="glass" divider="inset">
            <Row
              icon={Settings}
              label="Settings"
              onPress={() => router.push("/settings")}
            />
            <Row
              icon={BellRing}
              label="Activity"
              disabled
              right={
                <Text fontSize={14} color="$colorMuted">
                  soon
                </Text>
              }
            />
          </Rows>
        </YStack>
      </YStack>
    </ScreenBackground>
  );
}
