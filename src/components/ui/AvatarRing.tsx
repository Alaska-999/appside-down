import {
  Canvas,
  Circle,
  Group,
  SweepGradient,
  vec,
} from "@shopify/react-native-skia";
import { ICON_LIME, ICON_MINT, ICON_TEAL } from "@/src/constants/iconColors";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Pressable } from "react-native";
import { Text, YStack } from "tamagui";

interface AvatarRingProps {
  avatarUrl?: string | null;
  username?: string | null;
  size?: number;
  onPress?: () => void;
}

const RING_SPREAD = 3;

export function AvatarRing({ avatarUrl, username, size = 50, onPress }: AvatarRingProps) {
  const outer = size + RING_SPREAD * 2;
  const center = outer / 2;
  const initial = (username?.trim()?.[0] ?? "?").toUpperCase();

  return (
    <Pressable onPress={onPress} disabled={!onPress} hitSlop={8}>
      <YStack width={outer} height={outer} ai="center" jc="center">
        <Canvas style={{ position: "absolute", width: outer, height: outer }}>
          <Group transform={[{ rotate: (200 * Math.PI) / 180 }]} origin={vec(center, center)}>
            <Circle cx={center} cy={center} r={center}>
              <SweepGradient
                c={vec(center, center)}
                colors={[ICON_MINT, ICON_LIME, "rgba(45,212,191,0.1)", ICON_MINT]}
                positions={[0, 0.4, 0.7, 1]}
              />
            </Circle>
          </Group>
        </Canvas>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
          />
        ) : (
          <LinearGradient
            colors={[ICON_TEAL, ICON_MINT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text color="$mintTintDark" fontWeight="800" fontSize={Math.round(size / 2.9)}>
              {initial}
            </Text>
          </LinearGradient>
        )}
      </YStack>
    </Pressable>
  );
}
