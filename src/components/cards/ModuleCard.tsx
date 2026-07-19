import { AppCard } from "@/src/components/ui/Card";
import { Badge } from "@/src/components/ui/Badge";
import { Globe, Lock, Star } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";

interface ModuleCardProps {
  module: {
    id: string;
    name: string;
    itemsCount: number;
    isPublic?: boolean;
    isFavorite?: boolean;
    user?: { username: string } | null;
  };
  onPress: () => void;
}

export function ModuleCard({ module, onPress }: ModuleCardProps) {
  return (
    <Pressable onPress={onPress}>
      <AppCard variant="soft" fd="row" ai="center" gap="$3">
        <YStack f={1} gap="$1">
          <Text fontSize="$5" fontWeight="600" color="$color">
            {module.name}
          </Text>
          <XStack ai="center" gap="$1.5">
            <Text fontSize="$3" color="$colorMuted">
              {module.itemsCount} card{module.itemsCount !== 1 ? "s" : ""}
            </Text>
            <Text color="$borderColor">·</Text>
            <Badge
              tone="neutral"
              icon={
                module.isPublic ? (
                  <Globe size={12} color="$colorMuted" />
                ) : (
                  <Lock size={12} color="$colorMuted" />
                )
              }
            >
              {module.isPublic ? "Public" : "Private"}
            </Badge>
            {module.user?.username && (
              <>
                <Text color="$borderColor">·</Text>
                <Text fontSize="$3" color="$colorMuted">
                  by {module.user.username}
                </Text>
              </>
            )}
          </XStack>
        </YStack>
        {module.isFavorite && (
          <Star size={16} color="$statusWarning" fill="$statusWarning" />
        )}
      </AppCard>
    </Pressable>
  );
}
