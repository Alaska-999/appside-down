import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Pressable } from "react-native";
import { Text, useTheme, YStack } from "tamagui";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const SIZE_STYLES: Record<
  ButtonSize,
  { height: number; paddingHorizontal: number; fontSize: number }
> = {
  sm: { height: 36, paddingHorizontal: 14, fontSize: 13 },
  md: { height: 48, paddingHorizontal: 20, fontSize: 15 },
  lg: { height: 56, paddingHorizontal: 24, fontSize: 17 },
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
      br="$10"
      ai="center"
      jc="center"
      fd="row"
      gap="$2"
      opacity={disabled ? 0.5 : 1}
      bg={
        variant === "secondary"
          ? "$glassBg"
          : variant === "ghost"
            ? "transparent"
            : variant === "danger"
              ? "$statusDanger"
              : undefined
      }
      borderWidth={variant === "secondary" ? 1 : 0}
      borderColor="$glassBorder"
    >
      {icon}
      <Text
        fontSize={fontSize}
        fontWeight="600"
        color={variant === "primary" || variant === "danger" ? "white" : "$color"}
      >
        {children}
      </Text>
    </YStack>
  );

  return (
    <Pressable onPress={handlePress} disabled={disabled} style={{ borderRadius: 999 }}>
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
