import * as Haptics from "expo-haptics";
import { ReactElement } from "react";
import { Button, ButtonProps } from "tamagui";

interface IconButtonProps extends Omit<ButtonProps, "icon" | "onPress"> {
  icon: ReactElement;
  size?: "$2" | "$3" | "$4";
  onPress?: () => void;
}

export function IconButton({ icon, size = "$3", onPress, ...rest }: IconButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Button
      circular
      size={size}
      bg="$glassBg"
      borderWidth={1}
      borderColor="$glassBorder"
      icon={icon}
      onPress={handlePress}
      pressStyle={{ scale: 0.92 }}
      {...rest}
    />
  );
}
