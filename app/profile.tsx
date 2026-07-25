import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { StreakCard } from "@/src/components/cards/StreakCard";
import { useAuthStore } from "@/src/store/useAuthStore";
import { BellRing, ChevronRight, Settings } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { ReactNode } from "react";
import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";

function GlassCard({ children }: { children: ReactNode }) {
  return (
    <YStack
      bg="$glassBg"
      borderWidth={1}
      borderColor="$glassBorder"
      br="$cardSoft"
      overflow="hidden"
    >
      {children}
    </YStack>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text
      fontSize="$3"
      color="$auroraMuted"
      fontWeight="600"
      tt="uppercase"
      px="$1"
    >
      {children}
    </Text>
  );
}

function AccountRow({
  icon,
  label,
  onPress,
  disabled,
  isLast,
  right,
}: {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  isLast?: boolean;
  right?: ReactNode;
}) {
  const content = (
    <XStack
      ai="center"
      jc="space-between"
      px={18}
      py={14}
      opacity={disabled ? 0.45 : 1}
      borderBottomWidth={isLast ? 0 : 1}
      borderColor="$glassBorderSubtle"
    >
      <XStack ai="center" gap="$3">
        {icon}
        <Text fontSize={16} fontWeight="600" color="$color">
          {label}
        </Text>
      </XStack>
      {right ??
        (onPress && !disabled && (
          <ChevronRight size={16} color="$colorMuted" />
        ))}
    </XStack>
  );

  if (!onPress || disabled) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <YStack f={1} bg="$background">
      <ScreenHeader title="Profile" />

      <YStack f={1} px="$screenX" gap="$5" pt="$2">
        <YStack ai="center" mt="$2" mb="$1">
          <UserAvatar
            avatarUrl={user?.avatarUrl}
            username={user?.username}
            size={102}
          />
          <Text fontSize={23} fontWeight="800" color="$color" mt="$3">
            {user?.username ?? "Unknown"}
          </Text>
          <Text fontSize={14} color="$colorMuted" mt="$1">
            {user?.email}
          </Text>
        </YStack>

        <StreakCard
          currentStreak={user?.streak?.currentStreak ?? 0}
          todayIndex={todayIndex}
        />

        <YStack gap="$2">
          <SectionTitle>Account</SectionTitle>
          <GlassCard>
            <AccountRow
              icon={<Settings size={18} color="$colorSecondary" />}
              label="Settings"
              onPress={() => router.push("/settings")}
            />
            <AccountRow
              icon={<BellRing size={18} color="$colorSecondary" />}
              label="Activity"
              disabled
              isLast
              right={
                <Text fontSize={14} color="$colorMuted">
                  soon
                </Text>
              }
            />
          </GlassCard>
        </YStack>
      </YStack>
    </YStack>
  );
}
