import { stateOpacity } from "@/tamagui.config";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Pressable } from "react-native";
import { Text, useTheme, YStack } from "tamagui";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const SIZE_STYLES: Record<
  ButtonSize,
  { height: number; paddingHorizontal: number; fontSize: number }
> = {
  sm: { height: 36, paddingHorizontal: 14, fontSize: 13 },
  md: { height: 48, paddingHorizontal: 20, fontSize: 15 },
  lg: { height: 56, paddingHorizontal: 24, fontSize: 17 },
};

const VARIANT_STYLES: Record<
  Exclude<ButtonVariant, "primary">,
  { bg?: string; borderWidth?: number; borderColor?: string; textColor: string }
> = {
  secondary: { bg: "$glassBg", borderWidth: 1, borderColor: "$glassBorder", textColor: "$color" },
  outline: { bg: "$glassBg", borderWidth: 1, borderColor: "$accentBorderSoft", textColor: "$accentGradientEnd" },
  ghost: { textColor: "$color" },
  danger: { bg: "$statusDanger", textColor: "white" },
};

interface AppButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export function AppButton({
  variant = "primary",
  size = "md",
  onPress,
  disabled,
  icon,
  children,
}: AppButtonProps) {
  const theme = useTheme();
  const { height, paddingHorizontal, fontSize } = SIZE_STYLES[size];
  const variantStyle = variant !== "primary" ? VARIANT_STYLES[variant] : null;

  const handlePress = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const content = (
    <YStack
      f={1}
      height={height}
      px={paddingHorizontal}
      br={999}
      ai="center"
      jc="center"
      fd="row"
      gap="$2"
      opacity={disabled ? stateOpacity.disabled : 1}
      bg={variantStyle?.bg}
      borderWidth={variantStyle?.borderWidth}
      borderColor={variantStyle?.borderColor}
    >
      {icon}
      <Text
        fontSize={fontSize}
        fontWeight="600"
        color={variant === "primary" ? "$onAccentText" : variantStyle!.textColor}
      >
        {children}
      </Text>
    </YStack>
  );

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => ({ borderRadius: 999, opacity: pressed ? 0.85 : 1 })}
    >
      {variant === "primary" ? (
        <LinearGradient
          colors={[theme.accentGradientStart.get(), theme.accentGradientEnd.get()]}
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
