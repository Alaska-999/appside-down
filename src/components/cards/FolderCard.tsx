import { AppCard } from "@/src/components/ui/Card";
import { Pressable } from "react-native";
import { Avatar, Text, YStack } from "tamagui";

interface FolderCardProps {
  folder: {
    id: string;
    name: string;
    icon?: string | null;
    moduleIds?: string[];
  };
  onPress: () => void;
}

export function FolderCard({ folder, onPress }: FolderCardProps) {
  return (
    <Pressable onPress={onPress}>
      <AppCard variant="soft" fd="row" ai="center" gap="$3">
        <Avatar circular size="$4" bg="$backgroundCard">
          {folder.icon ? (
            <Avatar.Image src={folder.icon} accessibilityLabel={folder.name} />
          ) : null}
          <Avatar.Fallback jc="center" ai="center">
            <Text fontSize="$5">📂</Text>
          </Avatar.Fallback>
        </Avatar>
        <YStack f={1}>
          <Text fontSize="$5" fontWeight="600" color="$color">
            {folder.name}
          </Text>
          {folder.moduleIds && folder.moduleIds.length > 0 && (
            <Text fontSize="$3" color="$colorMuted">
              {folder.moduleIds.length} module
              {folder.moduleIds.length !== 1 ? "s" : ""}
            </Text>
          )}
        </YStack>
      </AppCard>
    </Pressable>
  );
}
