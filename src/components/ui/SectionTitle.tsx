import { ReactNode } from "react";
import { Text, TextProps } from "tamagui";

type SectionTitleTone = "muted" | "eyebrow";

type SectionTitleLayoutProps = Pick<
  TextProps,
  "mt" | "mb" | "ml" | "mr" | "px" | "testID"
>;

interface SectionTitleProps extends SectionTitleLayoutProps {
  children: ReactNode;
  tone?: SectionTitleTone;
}

const TONE_STYLES: Record<SectionTitleTone, Partial<TextProps>> = {
  muted: {
    fontSize: 15,
    fontWeight: "700",
    color: "$colorMuted",
    letterSpacing: 1.04,
    mt: 0,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "$colorMuted",
    letterSpacing: 0.99,
    mt: 0,
  },
};

export function SectionTitle({
  children,
  tone = "muted",
  ...rest
}: SectionTitleProps) {
  return (
    <Text textTransform="uppercase" {...TONE_STYLES[tone]} {...rest}>
      {children}
    </Text>
  );
}
