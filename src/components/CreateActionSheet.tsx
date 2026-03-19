import { FilePlus, FolderPlus } from "@tamagui/lucide-icons";
import { Href, useRouter } from "expo-router";
import { Button, Sheet, Text, XStack, YStack } from "tamagui";

export function CreateActionSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  console.log("CreateActionSheet");
  const router = useRouter();

  const handleNavigate = (path: Href) => {
    onOpenChange(false);
    router.push(path);
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[30]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay bg="$pureBlack" opacity={0.5} />
      <Sheet.Handle />
      <Sheet.Frame p="$4" bg="$background" gap="$4">
        <XStack jc="space-between" ai="center">
          <Text fontSize="$6" fow="bold">
            Create New
          </Text>
        </XStack>

        <YStack gap="$3">
          <Button
            size="$5"
            icon={<FolderPlus size="$2" />}
            bg="$buttonSecondaryBg"
            onPress={() => handleNavigate("/folder/create")}
          >
            <Text f={1} fontSize="$5">
              Folder
            </Text>
          </Button>

          <Button
            size="$5"
            icon={<FilePlus size="$2" />}
            bg="$buttonSecondaryBg"
            onPress={() => handleNavigate("/module/create")}
          >
            <Text f={1} fontSize="$5">
              Module
            </Text>
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
