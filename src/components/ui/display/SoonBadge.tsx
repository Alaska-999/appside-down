import { Text, XStack } from "tamagui";

export function SoonBadge() {
  return (
    <XStack br={999} px={8} py={3} borderWidth={1} borderColor="$borderColor">
      <Text
        fontSize={9.5}
        fontWeight="800"
        letterSpacing={0.76}
        tt="uppercase"
        color="$colorMuted"
      >
        soon
      </Text>
    </XStack>
  );
}
