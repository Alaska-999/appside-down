import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { hapticTap } from "@/src/utils/haptics";
import { ReactElement } from "react";
import { View } from "react-native";
import { Button, ButtonProps, YStack, YStackProps } from "tamagui";

type IconButtonVariant = "glass" | "liquidGlass" | "badge" | "danger";

interface IconButtonProps extends Omit<ButtonProps, "icon" | "onPress" | "size" | "variant"> {
  icon: ReactElement;
  variant?: IconButtonVariant;
  size?: ButtonProps["size"] | number;
  onPress?: () => void;
}

const VARIANT_STYLES: Record<Exclude<IconButtonVariant, "liquidGlass">, Partial<ButtonProps>> = {
  glass: {
    bg: "$glassBg",
    borderWidth: 1,
    borderColor: "$glassBorder",
  },
  badge: {
    bg: "$backgroundStrong",
    borderWidth: 3,
    borderColor: "$background",
  },
  danger: {
    bg: "$statusDanger",
    borderWidth: 2,
    borderColor: "$background",
  },
};

export function IconButton({
  icon,
  variant = "glass",
  size = "$3",
  onPress,
  ...rest
}: IconButtonProps) {
  const handlePress = () => {
    hapticTap();
    onPress?.();
  };

  if (variant === "liquidGlass") {
    return (
      <YStack
        w={44}
        h={44}
        br={22}
        ai="center"
        jc="center"
        onPress={handlePress}
        pressStyle={{ scale: 0.9 }}
        accessibilityRole="button"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 3 }}
        shadowRadius={5}
        shadowOpacity={0.5}
        {...(rest as YStackProps)}
      >
        <YStack
          pos="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          br={22}
          overflow="hidden"
          bg="$surfaceGlassFaint"
        >
          <LiquidGlass intensity={20} tint="default" borderRadius={22} />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255,255,255,0.06)",
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 8,
              right: 8,
              height: 1,
              backgroundColor: "rgba(255,255,255,0.34)",
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              bottom: 0,
              left: 8,
              right: 8,
              height: 1,
              backgroundColor: "rgba(120,220,255,0.16)",
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              top: 8,
              bottom: 8,
              width: 1,
              backgroundColor: "rgba(255,190,220,0.1)",
            }}
          />
        </YStack>
        <GradientBorder radius={22} preset="lens" />
        {icon}
      </YStack>
    );
  }

  return (
    <Button
      circular
      size={size}
      icon={icon}
      onPress={handlePress}
      pressStyle={{ scale: 0.92 }}
      {...VARIANT_STYLES[variant]}
      {...rest}
    />
  );
}
