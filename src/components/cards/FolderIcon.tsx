import {
  ICON_ACCENT,
  ICON_LIME,
  ICON_LIME_LIGHT,
  ICON_MINT,
  ICON_TEAL,
} from "@/src/constants/iconColors";
import { FOLDER_ICON_ACCENT_DEEP } from "@/src/constants/rawColors";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";
import { Text, YStack } from "tamagui";

export const FOLDER_ICON_GRADIENTS: [string, string][] = [
  [ICON_MINT, ICON_TEAL],
  [ICON_LIME_LIGHT, ICON_LIME],
  [ICON_ACCENT, FOLDER_ICON_ACCENT_DEEP],
];

const EMOJI_ICON = /^[\p{Extended_Pictographic}\p{Emoji_Presentation}‍️]{1,4}$/u;

export const isFolderImageIcon = (icon?: string | null) =>
  !!icon && icon.trim().length > 0 && !EMOJI_ICON.test(icon.trim());

export function FolderIcon({
  icon,
  name,
  size,
  radius,
  gradient,
}: {
  icon?: string | null;
  name: string;
  size: number;
  radius: number;
  gradient: [string, string];
}) {
  if (isFolderImageIcon(icon)) {
    return (
      <YStack
        w={size}
        h={size}
        br={radius}
        overflow="hidden"
        bg="$glassBg"
      >
        <Image
          source={{ uri: icon as string }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          accessibilityLabel={name}
        />
      </YStack>
    );
  }
  return (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.86, y: 0.86 }}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon ? (
        <Text fontSize={size * 0.4}>{icon}</Text>
      ) : (
        <Text fontSize={size * 0.4} fontWeight="800" color="$mintTintDark">
          {name.slice(0, 1).toUpperCase()}
        </Text>
      )}
    </LinearGradient>
  );
}
