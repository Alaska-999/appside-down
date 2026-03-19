import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, XStack } from "tamagui";

export function ScreenHeader({ title }: { title?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <XStack ai="center" p="$4" pt={insets.top} bg="$background">
      <Button
        icon={<ChevronLeft size="$2" color="$color" />}
        circular
        onPress={() => router.back()}
        ml="$-3"
      />

      {title && (
        <Text color="$color" fontSize="$6" fow="bold" ml="$2">
          {title}
        </Text>
      )}
    </XStack>
  );
}
