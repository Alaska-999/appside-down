import type { ReactNode } from "react";
import { Text, XStack, YStack } from "tamagui";
import { GradientText } from "./GradientText";

const MOCKUP_SCALE = 390 / 290;

interface AuthHeadingProps {
  titlePrefix?: string;
  titleHighlight: string;
  subtitle: ReactNode;
}

export function AuthHeading({ titlePrefix, titleHighlight, subtitle }: AuthHeadingProps) {
  return (
    <YStack ai="center" gap={8 * MOCKUP_SCALE}>
      <XStack ai="center" jc="center" flexWrap="wrap">
        {titlePrefix && (
          <Text
            color="$color"
            fontSize={24 * MOCKUP_SCALE}
            fontWeight="800"
            lineHeight={24 * MOCKUP_SCALE * 1.2}
          >
            {titlePrefix}{" "}
          </Text>
        )}
        <GradientText
          fontSize={24 * MOCKUP_SCALE}
          fontWeight="800"
          lineHeight={24 * MOCKUP_SCALE * 1.2}
        >
          {titleHighlight}
        </GradientText>
      </XStack>
      <Text
        color="$colorSecondary"
        fontSize={12.5 * MOCKUP_SCALE}
        lineHeight={12.5 * MOCKUP_SCALE * 1.5}
        textAlign="center"
      >
        {subtitle}
      </Text>
    </YStack>
  );
}
