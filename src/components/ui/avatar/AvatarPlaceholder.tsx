import { LinearGradient } from "expo-linear-gradient";
import { Text } from "tamagui";
import {
  AVATAR_VARIANTS,
  AvatarPlaceholderVariant,
} from "@/src/components/ui/avatar/avatarVariants";

export type { AvatarPlaceholderVariant };

export const AVATAR_PLACEHOLDER_VARIANT: AvatarPlaceholderVariant =
  "frostAccent";

export const AVATAR_PLACEHOLDER_VARIANTS = Object.keys(
  AVATAR_VARIANTS,
) as AvatarPlaceholderVariant[];

interface AvatarPlaceholderProps {
  label: string;
  size: number;
  fontSize: number;
  variant?: AvatarPlaceholderVariant;
}

export function AvatarPlaceholder({
  label,
  size,
  fontSize,
  variant = AVATAR_PLACEHOLDER_VARIANT,
}: AvatarPlaceholderProps) {
  const style = AVATAR_VARIANTS[variant];

  return (
    <LinearGradient
      colors={style.colors}
      locations={style.locations}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: style.borderColor ? 1 : 0,
        borderColor: style.borderColor,
      }}
    >
      <Text color={style.textColor} fontWeight="800" fontSize={fontSize}>
        {label}
      </Text>
    </LinearGradient>
  );
}
