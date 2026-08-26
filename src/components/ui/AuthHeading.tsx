import { GradientText } from "@/src/components/ui/GradientText";
import type { ReactNode } from "react";
import { Text, YStack } from "tamagui";

interface AuthHeadingProps {
  title: string;
  titleHighlight: string;
  subtitle: ReactNode;
}

export function AuthHeading({ title, titleHighlight, subtitle }: AuthHeadingProps) {
  return (
    <YStack width="100%">
      <YStack mb={10}>
        <Text color="$color" fontSize={44} fontWeight="800" letterSpacing={-1.32} lineHeight={46.6}>
          {title}
        </Text>
        <GradientText fontSize={44}>{titleHighlight}</GradientText>
      </YStack>
      <Text fontSize={13.5} color="#7F97A6" lineHeight={20.9} mb={26}>
        {subtitle}
      </Text>
    </YStack>
  );
}
