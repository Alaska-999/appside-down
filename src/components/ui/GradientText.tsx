import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { Text, TextProps, useTheme } from "tamagui";

interface GradientTextProps extends TextProps {
  children: ReactNode;
}

// MaskedView використовує дочірній Text лише як маску форми (його colour
// ігнорується) — фактичний колір задає LinearGradient під маскою
export function GradientText({ children, ...textProps }: GradientTextProps) {
  const theme = useTheme();

  return (
    <MaskedView maskElement={<Text {...textProps}>{children}</Text>}>
      <LinearGradient
        colors={[theme.accentGradientStart.get(), theme.accentGradientEnd.get()]}
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
