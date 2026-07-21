import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import * as Haptics from "expo-haptics";
import { ReactElement } from "react";
import { View } from "react-native";
import { Button, ButtonProps } from "tamagui";

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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  if (variant === "liquidGlass") {
    return (
      <View style={{ borderRadius: 999, overflow: "hidden" }}>
        <LiquidGlass
          intensity={50}
          borderRadius={999}
          borderWidth={1}
          borderColor="rgba(220, 255, 245, 0.15)"
          backgroundColor="rgba(19, 21, 32, 0.3)"
        />
        <Button
          circular
          size={size}
          icon={icon}
          onPress={handlePress}
          pressStyle={{ scale: 0.92 }}
          bg="transparent"
          {...rest}
        />
      </View>
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
