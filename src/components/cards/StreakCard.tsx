import { GlowSurface } from "@/src/components/ui/GlowSurface";
import { LinearGradient } from "expo-linear-gradient";
import { View } from "react-native";
import { Text, useTheme, XStack, YStack } from "tamagui";

const DEFAULT_DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

interface StreakCardProps {
  currentStreak: number;
  todayIndex: number;
  dayLabels?: string[];
}

// "hero"-плитка bento-сітки Home: єдиний яскравий елемент екрану (навмисний
// контраст із рештою — див. затверджений мокап home-bento-v7). Градієнт —
// три стопи з мокапа: linear-gradient(120deg, heroIndigo 0%, heroBlue 60%,
// heroTeal 100%), плюс м'яка світла пляма у правому верхньому куті
export function StreakCard({
  currentStreak,
  todayIndex,
  dayLabels = DEFAULT_DAY_LABELS,
}: StreakCardProps) {
  const theme = useTheme();
  const gradientColors = [
    theme.gradientHeroStart.get(),
    theme.gradientHeroMid.get(),
    theme.gradientHeroEnd.get(),
  ] as const;
  const inactiveDotColor = "rgba(255,255,255,0.3)";

  return (
    <GlowSurface glow br="$card" overflow="hidden" pos="relative">
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.6, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.35 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      {/* аналог .glow з мокапа: розмита біла пляма зверху праворуч */}
      <LinearGradient
        colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0)"]}
        start={{ x: 0.95, y: 0 }}
        end={{ x: 0.45, y: 0.9 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <YStack p="$cardPad" gap="$1.5">
        <XStack ai="center" gap="$2.5">
          <Text fontSize={30}>🔥</Text>
          <Text fontSize="$10" fontWeight="900" color="white">
            {currentStreak}
          </Text>
        </XStack>
        <Text fontSize="$3" fontWeight="600" color="rgba(255,255,255,0.85)">
          day streak{currentStreak === 0 ? " · keep going" : ""}
        </Text>
        <XStack gap="$1.5" mt="$1">
          {dayLabels.map((label, i) => (
            <View
              key={`${label}-${i}`}
              style={{
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: i < todayIndex ? "white" : inactiveDotColor,
                borderWidth: i === todayIndex ? 1.5 : 0,
                borderColor: "white",
              }}
            />
          ))}
        </XStack>
      </YStack>
    </GlowSurface>
  );
}
