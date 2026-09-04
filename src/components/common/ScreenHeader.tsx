import { IconButton } from "@/src/components/ui/IconButton";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { ReactNode } from "react";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { Button, Text, XStack } from "tamagui";

type ScreenHeaderVariant = "default" | "create";

interface ScreenHeaderProps {
  variant?: ScreenHeaderVariant;
  title?: string;
  right?: ReactNode;
  onCreate?: () => void;
}

export function ScreenHeader({
  variant = "default",
  title,
  right,
  onCreate,
}: ScreenHeaderProps) {
  const router = useRouter();
  const screen = useScreenInsets();

  if (variant === "create") {
    return (
      <XStack
        jc="space-between"
        ai="center"
        width="100%"
        px="$screenX"
        pt={screen.top}
        bg="$background"
      >
        <Button
          chromeless
          onPress={() => router.back()}
          p={0}
          pressStyle={{ opacity: 0.7 }}
        >
          <Text color="$colorMuted" fontWeight="600" fontSize={16}>
            Cancel
          </Text>
        </Button>

        <Button chromeless onPress={onCreate} p={0} pressStyle={{ opacity: 0.7 }}>
          <Text color="$accentGradientEnd" fontWeight="700" fontSize={16}>
            Create
          </Text>
        </Button>
      </XStack>
    );
  }

  return (
    <XStack ai="center" p="$4" pt={screen.top} bg="$background">
      <IconButton
        variant="liquidGlass"
        icon={<ChevronLeft size="$1" color="$color" />}
        onPress={() => router.back()}
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
