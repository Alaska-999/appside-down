import { controlHeight, stateOpacity } from "@/tamagui.config";
import { hapticTap } from "@/src/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Pressable } from "react-native";
import { Spinner, Text, useTheme, YStack } from "tamagui";

type ButtonVariant =
  | "primary"
  | "soft"
  | "hero"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "glass";
type ButtonSize = "sm" | "md" | "lg";
type GradientVariant = "primary" | "soft" | "hero";
type GradientColorKey =
  | "accentGradientStart"
  | "accentGradientEnd"
  | "gradientHeroStart"
  | "gradientHeroMid"
  | "gradientHeroEnd";

const SIZE_STYLES: Record<
  ButtonSize,
  { height: number; paddingHorizontal: number; fontSize: number }
> = {
  sm: { height: controlHeight.sm, paddingHorizontal: 14, fontSize: 13 },
  md: { height: controlHeight.md, paddingHorizontal: 20, fontSize: 15 },
  lg: { height: controlHeight.lg, paddingHorizontal: 24, fontSize: 17 },
};

const MIN_TAP_TARGET = 44;

const VARIANT_STYLES: Record<
  Exclude<ButtonVariant, GradientVariant>,
  { bg?: string; borderWidth?: number; borderColor?: string; textColor: string }
> = {
  secondary: {
    bg: "$glassBg",
    borderWidth: 1,
    borderColor: "$glassBorder",
    textColor: "$color",
  },
  outline: {
    bg: "$glassBg",
    borderWidth: 1,
    borderColor: "$accentBorderSoft",
    textColor: "$accentGradientEnd",
  },
  ghost: { textColor: "$color" },
  danger: { bg: "$statusDanger", textColor: "white" },
  glass: {
    bg: "rgba(45,212,191,0.12)",
    textColor: "$mint",
    borderWidth: 1,
    borderColor: "rgba(45, 212, 191, 0.28)",
  },
};

const GRADIENT_VARIANT_STYLES: Record<
  GradientVariant,
  { colors: GradientColorKey[]; textColor: string }
> = {
  primary: {
    colors: ["accentGradientStart", "accentGradientEnd"],
    textColor: "$onAccentText",
  },
  soft: {
    colors: ["gradientHeroMid", "gradientHeroEnd"],
    textColor: "$color",
  },
  hero: {
    colors: ["gradientHeroStart", "gradientHeroMid", "gradientHeroEnd"],
    textColor: "white",
  },
};

interface AppButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export function AppButton({
  variant = "primary",
  size = "md",
  onPress,
  disabled,
  loading,
  icon,
  children,
}: AppButtonProps) {
  const theme = useTheme();
  const { height, paddingHorizontal, fontSize } = SIZE_STYLES[size];
  const isGradient =
    variant === "primary" || variant === "soft" || variant === "hero";
  const variantStyle = !isGradient ? VARIANT_STYLES[variant] : null;
  const gradientStyle = isGradient ? GRADIENT_VARIANT_STYLES[variant] : null;
  const textColor = gradientStyle
    ? gradientStyle.textColor
    : variantStyle!.textColor;
  const isBlocked = disabled || loading;
  const verticalHitSlop = Math.max(0, (MIN_TAP_TARGET - height) / 2);

  const handlePress = () => {
    if (isBlocked) return;
    hapticTap();
    onPress?.();
  };

  const content = (
    <YStack
      w="100%"
      height={height}
      px={paddingHorizontal}
      br={999}
      ai="center"
      jc="center"
      fd="row"
      gap="$2"
      opacity={loading ? 0.85 : disabled ? stateOpacity.disabled : 1}
      bg={variantStyle?.bg}
      borderWidth={variantStyle?.borderWidth}
      borderColor={variantStyle?.borderColor}
    >
      {loading ? <Spinner size="small" color={textColor} /> : icon}
      <Text fontSize={fontSize} fontWeight="600" color={textColor}>
        {children}
      </Text>
    </YStack>
  );

  return (
    <Pressable
      onPress={handlePress}
      disabled={isBlocked}
      hitSlop={{ top: verticalHitSlop, bottom: verticalHitSlop }}
      style={({ pressed }) => ({
        borderRadius: 999,
        opacity: pressed && !loading ? 0.85 : 1,
      })}
    >
      {gradientStyle ? (
        <LinearGradient
          colors={
            gradientStyle.colors.map((key) => theme[key].get()) as [
              string,
              string,
              ...string[],
            ]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 999 }}
        >
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </Pressable>
  );
}
