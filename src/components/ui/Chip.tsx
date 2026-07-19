import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Text, XStack, YStack } from "tamagui";

type ChipSize = "md" | "lg";

interface ChipProps {
  monogram: string;
  title: string;
  meta?: string;
  gradientColors: [string, string];
  size?: ChipSize;
  onPress?: () => void;
  rightElement?: ReactNode;
}

// розмірні пресети замість хардкоду на екрані: "lg" — для Recent на Home
// (значення з мокапа home-bento-v7), "md" — компактний варіант для щільних списків
const CHIP_SIZES = {
  md: { avatar: 30, monogram: "$2", title: "$3", meta: "$1", pl: "$1.5", pr: "$3.5", py: "$1.5" },
  lg: { avatar: 36, monogram: "$3", title: "$4", meta: "$2", pl: "$2.5", pr: "$4", py: "$2.5" },
} as const;

// універсальний "пігулка"-елемент: кольоровий монограм-кружок + назва + підпис.
// Використовується для Recent на Home; той самий компонент годиться для будь-якого
// іншого короткого горизонтального списку (обране, останні папки тощо)
export function Chip({ monogram, title, meta, gradientColors, size = "md", onPress, rightElement }: ChipProps) {
  const s = CHIP_SIZES[size];
  return (
    <XStack
      ai="center"
      gap="$2.5"
      bg="$glassBg"
      borderWidth={1}
      borderColor="$glassBorder"
      br={999}
      pl={s.pl}
      pr={s.pr}
      py={s.py}
      onPress={onPress}
      pressStyle={{ scale: 0.97 }}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: s.avatar,
          height: s.avatar,
          borderRadius: s.avatar / 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text fontSize={s.monogram} fontWeight="800" color="white">
          {monogram}
        </Text>
      </LinearGradient>
      <YStack>
        <Text fontSize={s.title} fontWeight="700" color="$color">
          {title}
        </Text>
        {meta && (
          <Text fontSize={s.meta} color="$colorMuted">
            {meta}
          </Text>
        )}
      </YStack>
      {rightElement}
    </XStack>
  );
}
