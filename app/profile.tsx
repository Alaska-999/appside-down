import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { StreakCard } from "@/src/components/cards/StreakCard";
import { GlowSurface } from "@/src/components/ui/GlowSurface";
import { ICON_MUTED_LIGHT, ICON_SUBTLE } from "@/src/constants/iconColors";
import { useAuthStore } from "@/src/store/useAuthStore";
import { BellRing, ChevronRight, Settings } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

function AccountRow({
  icon,
  label,
  onPress,
  disabled,
  isFirst,
  right,
}: {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  isFirst?: boolean;
  right?: ReactNode;
}) {
  const content = (
    <XStack ai="center" gap={13} px={17} py={15} pos="relative" opacity={disabled ? 0.45 : 1}>
      {!isFirst && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 48,
            right: 0,
            top: 0,
            height: 1,
            backgroundColor: "rgba(220,255,245,0.09)",
          }}
        />
      )}
      {icon}
      <Text f={1} fontSize={16} fontWeight="600" color="$color">
        {label}
      </Text>
      {right ??
        (onPress && !disabled && (
          <ChevronRight size={16} color={ICON_SUBTLE} />
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

      <YStack f={1} px="$screenX" gap="$7" pt="$2">
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
          glow
        />

        <YStack gap="$2">
          <Text
            fontSize={11}
            fontWeight="700"
            letterSpacing={0.99}
            textTransform="uppercase"
            color="$colorMuted"
            px={4}
          >
            Account
          </Text>
          <GlowSurface
            radius={20}
            fill="$surfaceCard"
            blurIntensity={0}
            lampAlpha={0.16}
            borderAngle={138}
            borderColors={[
              "rgba(94,234,212,0.36)",
              "rgba(94,234,212,0.05)",
              "rgba(220,255,245,0.03)",
            ]}
            borderPositions={[0, 0.46, 1]}
            p={0}
            overflow="hidden"
          >
            <AccountRow
              icon={<Settings size={18} color={ICON_MUTED_LIGHT} strokeWidth={1.9} />}
              label="Settings"
              onPress={() => router.push("/settings")}
              isFirst
            />
            <AccountRow
              icon={<BellRing size={18} color={ICON_MUTED_LIGHT} strokeWidth={1.9} />}
              label="Activity"
              disabled
              right={
                <Text fontSize={14} color="$colorMuted">
                  soon
                </Text>
              }
            />
          </GlowSurface>
        </YStack>
      </YStack>
    </YStack>
  );
}
