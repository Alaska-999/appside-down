import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, XStack } from "tamagui";

export function ScreenHeader({ title, right }: { title?: string; right?: ReactNode }) {
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

      {right && <XStack f={1} jc="flex-end">{right}</XStack>}
    </XStack>
  );
}
