import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { useLocalSearchParams } from "expo-router";
import { Text, YStack } from "tamagui";

export default function Folder() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <YStack f={1} bg="$background">
      <YStack pos="absolute" top={0} left={0} right={0} zi={100}>
        <ScreenHeader title="Folder" />

        <Text>{id}</Text>
      </YStack>
    </YStack>
  );
}
