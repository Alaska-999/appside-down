import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { ICON_MINT, ICON_MINT_LIGHT, ICON_MINT_TINT_DARK } from "@/src/constants/iconColors";
import { GRADIENT_PRIMARY } from "@/src/constants/gradients";
import { SURFACE_MINT_GLASS_BG } from "@/src/constants/surfaceAlpha";
import { withAlpha } from "@/src/utils/withAlpha";
import { LinearGradient } from "expo-linear-gradient";
import { Check } from "lucide-react-native";
import { StyleSheet } from "react-native";
import { Text, XStack, YStack } from "tamagui";

const DEFAULT_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface StreakCardProps {
  currentStreak: number;
  todayIndex: number;
  dayLabels?: string[];
}

export function StreakCard({
  currentStreak,
  todayIndex,
  dayLabels = DEFAULT_DAY_LABELS,
}: StreakCardProps) {
  const days = (
    <XStack jc="space-between">
      {dayLabels.map((label, i) => {
        const isNow = i === todayIndex;
        const isOn = i < todayIndex && i >= todayIndex - currentStreak;

        return (
          <YStack key={`${label}-${i}`} ai="center" gap={6}>
            <YStack
              width={28}
              height={28}
              br={10}
              ai="center"
              jc="center"
              overflow="hidden"
              pos="relative"
              bg={isOn ? undefined : isNow ? SURFACE_MINT_GLASS_BG : "$glassBg"}
              borderWidth={isNow ? 1.5 : isOn ? 0 : 1}
              borderColor={isNow ? withAlpha(ICON_MINT_LIGHT, 0.9) : "$glassBgStrong"}
              shadowColor={ICON_MINT}
              shadowOffset={{ width: 0, height: 0 }}
              shadowRadius={isOn ? 7 : isNow ? 8 : 0}
              shadowOpacity={isOn ? 0.8 : isNow ? 0.7 : 0}
            >
              {isOn && (
                <>
                  <LinearGradient
                    colors={GRADIENT_PRIMARY}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Check size={14} color={ICON_MINT_TINT_DARK} strokeWidth={2.8} />
                </>
              )}
            </YStack>
            <Text fontSize={10.5} fontWeight="600" color={isNow ? "$mintLight" : "$colorMuted"}>
              {label}
            </Text>
          </YStack>
        );
      })}
    </XStack>
  );

  return (
    <YStack br="$card" overflow="hidden" pos="relative" bg="$surfaceCard" p={16} px={17}>
      <GradientBorder radius={23} preset="surf" />

      <XStack ai="baseline" gap={6} mb={15}>
        <Text fontSize={26} fontWeight="900" letterSpacing={-0.5} color="$color">
          {currentStreak}
        </Text>
        <Text fontSize={12.5} fontWeight="600" color="$colorMuted">
          day streak
        </Text>
      </XStack>

      {days}
    </YStack>
  );
}
