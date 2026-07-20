import { AppCard } from "@/src/components/ui/Card";
import { TEXT } from "@/src/constants/typography";
import { Star } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";

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

function Dot() {
  return (
    <View width={3} height={3} borderRadius={2} backgroundColor="$colorMuted" />
  );
}

export function ModuleCard({ module, onPress }: ModuleCardProps) {
  return (
    <Pressable onPress={onPress}>
      <AppCard
        variant="soft"
        size="md"
        fd="row"
        ai="center"
        gap={16}
        h={76}
        borderLeftWidth={3}
        borderLeftColor={module.isPublic ? "$accentGradientStart" : "$glassBorder"}
      >
        <YStack f={1} gap="$1">
          <XStack ai="center" jc="space-between">
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
            <Dot />
            <Text fontSize={TEXT.cardMeta} color="$colorMuted">
              {module.isPublic ? "Public" : "Private"}
            </Text>
            {module.isPublic && module.user?.username && (
              <>
                <Dot />
                <Text fontSize={TEXT.cardMeta} color="$colorMuted">
                  {module.user.username}
                </Text>
              </>
            )}
          </XStack>
        </YStack>
      </AppCard>
    </Pressable>
  );
}
