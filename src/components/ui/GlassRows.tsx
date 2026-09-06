import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { ICON_MUTED_LIGHT, ICON_SUBTLE } from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
import { ChevronRight } from "lucide-react-native";
import { Children, ComponentType, ReactNode } from "react";
import { View } from "react-native";
import { Text, XStack, YStack, YStackProps } from "tamagui";

const GLASS_RADIUS = 20;
const GLASS_FILL = "rgba(220,255,245,0.045)";
const DIVIDER = "rgba(220,255,245,0.09)";
const DIVIDER_INSET = 48;

type GlassCardLayoutProps = Pick<YStackProps, "p" | "px" | "py" | "gap" | "ai" | "fd">;

export function GlassCard({
  children,
  ...layout
}: GlassCardLayoutProps & { children: ReactNode }) {
  return (
    <YStack pos="relative" br={GLASS_RADIUS} overflow="hidden" bg={GLASS_FILL}>
      <GradientBorder radius={GLASS_RADIUS} preset="surf" />
      <YStack zIndex={2} {...layout}>
        {children}
      </YStack>
    </YStack>
  );
}

export function GlassRows({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  return (
    <GlassCard>
      {items.map((child, index) => (
        <View key={index}>
          {index > 0 && (
            <View
              pointerEvents="none"
              style={{ marginLeft: DIVIDER_INSET, height: 1, backgroundColor: DIVIDER }}
            />
          )}
          {child}
        </View>
      ))}
    </GlassCard>
  );
}

export function GlassRow({
  icon: Icon,
  label,
  value,
  right,
  disabled,
  onPress,
}: {
  icon?: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  value?: string;
  right?: ReactNode;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const pressable = !!onPress && !disabled;
  return (
    <XStack
      ai="center"
      gap={13}
      px={17}
      py={14}
      opacity={disabled ? 0.45 : 1}
      transition="press"
      {...(pressable && {
        onPress: () => {
          hapticTap();
          onPress();
        },
        pressStyle: { bg: "rgba(220,255,245,0.05)" },
        accessibilityRole: "button" as const,
        accessibilityLabel: label,
      })}
    >
      {Icon && <Icon size={18} color={ICON_MUTED_LIGHT} strokeWidth={1.9} />}
      <Text f={1} fontSize={16} fontWeight="600" color="$color">
        {label}
      </Text>
      {value && (
        <Text fontSize={14} color="$colorMuted">
          {value}
        </Text>
      )}
      {right}
      {pressable && !right && (
        <ChevronRight size={16} color={ICON_SUBTLE} strokeWidth={2} />
      )}
    </XStack>
  );
}
