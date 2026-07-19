import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Text, TextProps, useTheme } from "tamagui";

interface GradientTextProps extends TextProps {
  children: ReactNode;
}

export function GradientText({ children, ...textProps }: GradientTextProps) {
  const theme = useTheme();

  return (
    <MaskedView maskElement={<Text {...textProps}>{children}</Text>}>
      <LinearGradient
        colors={[theme.gradientTextStart.get(), theme.gradientTextEnd.get()]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text {...textProps} opacity={0}>
          {children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}
