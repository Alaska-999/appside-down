import { GlowSurface } from "@/src/components/ui/GlowSurface";
import { GradientBorder } from "@/src/components/ui/GradientBorder";
import {
  ICON_LIME,
  ICON_MINT,
  ICON_MINT_TINT_DARK,
} from "@/src/constants/iconColors";
import { LinearGradient } from "expo-linear-gradient";
import { Check } from "lucide-react-native";
import { StyleSheet } from "react-native";
import { Text, XStack, YStack } from "tamagui";

const DEFAULT_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface StreakCardProps {
  currentStreak: number;
  todayIndex: number;
  dayLabels?: string[];
  glow?: boolean;
}

export function StreakCard({
  currentStreak,
  todayIndex,
  dayLabels = DEFAULT_DAY_LABELS,
  glow = false,
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
              bg={isOn ? undefined : isNow ? "rgba(45,212,191,0.14)" : "rgba(220,255,245,0.06)"}
              borderWidth={isNow ? 1.5 : isOn ? 0 : 1}
              borderColor={isNow ? "rgba(94,234,212,0.9)" : "rgba(220,255,245,0.09)"}
              shadowColor="rgba(45,212,191,1)"
              shadowOffset={{ width: 0, height: 0 }}
              shadowRadius={isOn ? 7 : isNow ? 8 : 0}
              shadowOpacity={isOn ? 0.8 : isNow ? 0.7 : 0}
            >
              {isOn && (
                <>
                  <LinearGradient
                    colors={[ICON_MINT, ICON_LIME]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Check size={14} color={ICON_MINT_TINT_DARK} strokeWidth={2.8} />
                </>
              )}
            </YStack>
            <Text fontSize={10} fontWeight="600" color={isNow ? "$mintLight" : "#6E8496"}>
              {label}
            </Text>
          </YStack>
        );
      })}
    </XStack>
  );

  if (glow) {
    return (
      <GlowSurface
        radius={23}
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
        p={16}
        px={17}
      >
        <XStack ai="baseline" gap={6} mb={15}>
          <Text fontSize={26} fontWeight="900" letterSpacing={-0.5} color="$color">
            {currentStreak}
          </Text>
          <Text fontSize={12.5} fontWeight="600" color="$colorMuted">
            day streak
          </Text>
        </XStack>
        {days}
      </GlowSurface>
    );
  }

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
