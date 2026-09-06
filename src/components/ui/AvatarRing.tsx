import {
  Canvas,
  Circle,
  Group,
  SweepGradient,
  vec,
} from "@shopify/react-native-skia";
import {
  AvatarPlaceholder,
  AvatarPlaceholderVariant,
} from "@/src/components/ui/AvatarPlaceholder";
import { ICON_LIME, ICON_MINT } from "@/src/constants/iconColors";
import { Image, Pressable } from "react-native";
import { YStack } from "tamagui";

interface AvatarRingProps {
  avatarUrl?: string | null;
  username?: string | null;
  size?: number;
  onPress?: () => void;
  variant?: AvatarPlaceholderVariant;
  ring?: boolean;
}

const RING_SPREAD = 3;

export function AvatarRing({
  avatarUrl,
  username,
  size = 50,
  onPress,
  variant,
  ring = false,
}: AvatarRingProps) {
  const outer = ring ? size + RING_SPREAD * 2 : size;
  const center = outer / 2;
  const initial = (username?.trim()?.[0] ?? "?").toUpperCase();

  return (
    <Pressable onPress={onPress} disabled={!onPress} hitSlop={8}>
      <YStack width={outer} height={outer} ai="center" jc="center">
        {ring ? (
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
        ) : null}
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
          />
        ) : (
          <AvatarPlaceholder
            label={initial}
            size={size}
            fontSize={Math.round(size / 2.9)}
            variant={variant}
          />
        )}
      </YStack>
    </Pressable>
  );
}
