import { AppButton } from "@/src/components/ui/Button";
import { AlertTriangle } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Text, YStack, YStackProps } from "tamagui";

const MOCKUP_SCALE = 390 / 250;

const GLYPH_SIZE = 54 * MOCKUP_SCALE;
const GLYPH_RADIUS = 18 * MOCKUP_SCALE;
const CARD_RADIUS = 20 * MOCKUP_SCALE;
const CARD_PADDING_X = 18 * MOCKUP_SCALE;
const CARD_PADDING_Y = 22 * MOCKUP_SCALE;

type StateCardVariant = "error" | "empty";

interface StateCardProps extends Omit<YStackProps, "children"> {
  variant: StateCardVariant;
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  onButtonPress?: () => void;
  loading?: boolean;
}

export function StateCard({
  variant,
  icon,
  title,
  subtitle,
  buttonLabel,
  onButtonPress,
  loading,
  ...rest
}: StateCardProps) {
  const resolvedIcon =
    icon ??
    (variant === "error" ? (
      <AlertTriangle size={24} color="$statusDanger" />
    ) : null);
  const resolvedLabel = buttonLabel ?? (variant === "error" ? "Retry" : undefined);

  return (
    <YStack
      bg="rgba(220,255,245,0.05)"
      borderWidth={1}
      borderColor="rgba(220,255,245,0.12)"
      br={CARD_RADIUS}
      px={CARD_PADDING_X}
      py={CARD_PADDING_Y}
      ai="center"
      {...rest}
    >
      <YStack
        width={GLYPH_SIZE}
        height={GLYPH_SIZE}
        br={GLYPH_RADIUS}
        ai="center"
        jc="center"
        mb={12}
        overflow="hidden"
        pos="relative"
        bg={variant === "error" ? "rgba(248,113,113,0.12)" : undefined}
        borderWidth={variant === "error" ? 1 : 0}
        borderColor={variant === "error" ? "rgba(248,113,113,0.3)" : undefined}
      >
        {variant === "empty" && (
          <LinearGradient
            colors={["rgba(45,212,191,0.25)", "rgba(163,230,53,0.25)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}
        {resolvedIcon}
      </YStack>

      <Text fontSize={15} fontWeight="800" color="$color" textAlign="center">
        {title}
      </Text>

      {subtitle ? (
        <Text
          fontSize={12}
          color="$colorMuted"
          textAlign="center"
          lineHeight={18}
          mt={5}
        >
          {subtitle}
        </Text>
      ) : null}

      {resolvedLabel && onButtonPress ? (
        <YStack width="100%" mt={14}>
          <AppButton
            variant={variant === "error" ? "soft" : "secondary"}
            size="sm"
            onPress={onButtonPress}
            loading={loading}
          >
            {resolvedLabel}
          </AppButton>
        </YStack>
      ) : null}
    </YStack>
  );
}
