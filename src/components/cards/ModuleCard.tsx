import { Badge } from "@/src/components/ui/Badge";
import { AppCard } from "@/src/components/ui/Card";
import { TEXT } from "@/src/constants/typography";
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
      <AppCard
        variant="soft"
        fd="row"
        ai="center"
        gap={16}
        br={20}
        px={15}
        py={17}
        h={76}
      >
        <YStack f={1} gap="$1">
          <XStack ai="center" gap="$1.5">
            <Text fontSize={TEXT.cardTitle} fontWeight="700" color="$color">
              {module.name}
            </Text>
            {module.isFavorite && (
              <Star size={16} color="#A3E635" fill="#A3E635" />
            )}
          </XStack>
          <XStack ai="center" gap="$1.5" flexWrap="wrap">
            <Text fontSize={TEXT.cardMeta} color="$colorMuted">
              {module.itemsCount} card{module.itemsCount !== 1 ? "s" : ""}
            </Text>
            <Badge
              tone="neutral"
              icon={
                module.isPublic ? (
                  <Globe size={13} color="$colorMuted" />
                ) : (
                  <Lock size={13} color="$colorMuted" />
                )
              }
            >
              {module.isPublic ? "Public" : "Private"}
            </Badge>
            {module.isPublic && module.user?.username && (
              <>
                <Text color="$colorMuted">·</Text>
                <Text fontSize={TEXT.cardMeta} color="$colorMuted">
                  by {module.user.username}
                </Text>
              </>
            )}
          </XStack>
        </YStack>
      </AppCard>
    </Pressable>
  );
}
