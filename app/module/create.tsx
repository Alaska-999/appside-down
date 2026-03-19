import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { Text, YStack } from "tamagui";

export default function ModuleCreate() {
  return (
    <YStack f={1} bg="$background">
      <YStack pos="absolute" top={0} left={0} right={0} zi={100}>
        <ScreenHeader />
        <Text>Module Create</Text>
      </YStack>
    </YStack>
  );
}
