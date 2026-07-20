import * as Haptics from "expo-haptics";
import { ReactElement } from "react";
import { Button, ButtonProps } from "tamagui";

type IconButtonVariant = "glass" | "badge" | "danger";

interface IconButtonProps extends Omit<ButtonProps, "icon" | "onPress" | "size" | "variant"> {
  icon: ReactElement;
  variant?: IconButtonVariant;
  size?: ButtonProps["size"] | number;
  onPress?: () => void;
}

const VARIANT_STYLES: Record<IconButtonVariant, Partial<ButtonProps>> = {
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
