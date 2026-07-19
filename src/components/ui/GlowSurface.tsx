import { YStack, YStackProps } from "tamagui";

export interface GlowSurfaceProps extends YStackProps {
  glow?: boolean;
}

// iOS будує тінь по альфа-каналу ВСЬОГО вмісту в'юхи: якщо фон напівпрозорий
// (скло), тінь "обводить" і кожен текст усередині — написи виглядають
// розмитими. Тому фон розкладено на два абсолютні шари під контентом:
// суцільна підкладка кольору тла (тінь бере форму картки саме з неї) +
// скляний шар зверху. Самі тексти в альфа-формі більше не домінують.
export function GlowSurface({ glow, br, bg, children, ...rest }: GlowSurfaceProps) {
  return (
    <YStack
      br={br}
      pos="relative"
      {...(glow
        ? {
            shadowColor: "$glowColor",
            shadowOpacity: 1,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 0 },
            elevation: 10,
          }
        : null)}
      {...rest}
    >
      <YStack pos="absolute" t={0} l={0} r={0} b={0} br={br} bg="$background" />
      {bg ? (
        <YStack pos="absolute" t={0} l={0} r={0} b={0} br={br} bg={bg} />
      ) : null}
      {children}
    </YStack>
  );
}
