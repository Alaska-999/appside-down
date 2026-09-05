import { AppButton } from "@/src/components/ui/Button";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import {
  ICON_ACCENT,
  ICON_DANGER,
  ICON_WARNING,
} from "@/src/constants/iconColors";
import { BlurMask, Canvas, Circle } from "@shopify/react-native-skia";
import { LinearGradient } from "expo-linear-gradient";
import { ComponentType, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Text, YStack, YStackProps } from "tamagui";

export type StateTone = "error" | "warn" | "empty";

const TONE_HALO: Record<StateTone, string> = {
  error: "rgba(239,68,68,0.28)",
  warn: "rgba(252,211,77,0.26)",
  empty: "rgba(45,212,191,0.35)",
};

const TONE_ICON_COLOR: Record<StateTone, string> = {
  error: ICON_DANGER,
  warn: ICON_WARNING,
  empty: ICON_ACCENT,
};

const DISC_SIZE = 96;
const HALO_INSET = 40;
const HALO_SIZE = DISC_SIZE + HALO_INSET * 2;
const HALO_RADIUS = 46;
const HALO_BLUR = 16;

function StateHalo({ color }: { color: string }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: -HALO_INSET,
        left: -HALO_INSET,
        width: HALO_SIZE,
        height: HALO_SIZE,
      }}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <Circle
          cx={HALO_SIZE / 2}
          cy={HALO_SIZE / 2}
          r={HALO_RADIUS}
          color={color}
        >
          <BlurMask blur={HALO_BLUR} style="normal" />
        </Circle>
      </Canvas>
    </View>
  );
}

interface StateCardProps extends YStackProps {
  tone: StateTone;
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  subtitle?: ReactNode;
  buttonLabel?: string;
  buttonIcon?: ReactNode;
  onButtonPress?: () => void;
  loading?: boolean;
}

export function StateCard({
  tone,
  icon: Icon,
  title,
  subtitle,
  buttonLabel,
  buttonIcon,
  onButtonPress,
  loading,
  ...rest
}: StateCardProps) {
  return (
    <YStack f={1} ai="center" jc="center" px={14} {...rest}>
      <YStack width={DISC_SIZE} height={DISC_SIZE} mb={22} pos="relative">
        <StateHalo color={TONE_HALO[tone]} />
        <YStack
          width={DISC_SIZE}
          height={DISC_SIZE}
          br={DISC_SIZE / 2}
          overflow="hidden"
          ai="center"
          jc="center"
          pos="relative"
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 4 }}
          shadowRadius={9}
          shadowOpacity={0.8}
        >
          <LiquidGlass
            intensity={28}
            backgroundColor="rgba(220,255,245,0.05)"
            borderRadius={DISC_SIZE / 2}
          />
          <LinearGradient
            colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0)"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.6 }}
            style={StyleSheet.absoluteFill}
          />
          <Icon size={40} color={TONE_ICON_COLOR[tone]} strokeWidth={1.7} />
        </YStack>
      </YStack>

      <Text
        fontSize={22}
        fontWeight="700"
        color="$color"
        textAlign="center"
        letterSpacing={-0.2}
        mb={8}
      >
        {title}
      </Text>

      {subtitle ? (
        typeof subtitle === "string" ? (
          <Text
            fontSize={13.5}
            color="#7F97A6"
            textAlign="center"
            lineHeight={21.6}
            maxWidth={280}
          >
            {subtitle}
          </Text>
        ) : (
          <YStack maxWidth={280}>{subtitle}</YStack>
        )
      ) : null}

      {buttonLabel && onButtonPress ? (
        <YStack width="100%" maxWidth={320} mt={26}>
          <AppButton
            variant="primary"
            size="lg"
            icon={buttonIcon}
            onPress={onButtonPress}
            loading={loading}
          >
            {buttonLabel}
          </AppButton>
        </YStack>
      ) : null}
    </YStack>
  );
}
