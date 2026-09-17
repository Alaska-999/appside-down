import { AppCard } from "@/src/components/ui/surface/Card";
import { ICON_MINT_LIGHT, ICON_SUBTLE } from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
import { pluralize } from "@/src/utils/plural";
import { BookmarkCheck, ChevronRight } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";

export interface PublicModuleResult {
  id: string;
  name: string;
  user?: { id: string; username: string; avatarUrl?: string | null };
  author?: { id: string; username: string; avatarUrl?: string | null } | null;
  authorUsername?: string | null;
  _count?: { flashcards: number; copies?: number };
  savedCopyId?: string | null;
}

interface PublicModuleRowProps {
  module: PublicModuleResult;
  onPress: () => void;
}

const ROW_HEIGHT = 74;
const ROW_RADIUS = 23;

export function PublicModuleRow({ module, onPress }: PublicModuleRowProps) {
  const [pressed, setPressed] = useState(false);
  const count = module._count?.flashcards ?? 0;
  const saves = module._count?.copies ?? 0;
  const author = module.author?.username ?? module.authorUsername ?? "Unknown";

  return (
    <Pressable
      onPress={() => {
        hapticTap();
        onPress();
      }}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{ transform: [{ scale: pressed ? 0.978 : 1 }] }}
    >
      <YStack pos="relative" br={ROW_RADIUS} overflow="hidden">
        <AppCard
          variant="row"
          tone="mint"
          size="lg"
          pressed={pressed}
          height={ROW_HEIGHT}
          px={18}
          py={0}
          jc="center"
        >
          <XStack ai="center" gap={12}>
            <YStack f={1} minWidth={0}>
              <Text
                fontSize={16}
                fontWeight="700"
                letterSpacing={-0.16}
                color="$color"
                numberOfLines={1}
              >
                {module.name}
              </Text>
              <Text
                fontSize={12.5}
                color="$textMuted"
                mt={3}
                numberOfLines={1}
              >
                {author} · {pluralize(count, "term")}
                {saves > 0 ? ` · ${pluralize(saves, "save")}` : ""}
              </Text>
            </YStack>

            {module.savedCopyId && (
              <BookmarkCheck
                size={18}
                color={ICON_MINT_LIGHT}
                strokeWidth={2}
              />
            )}

            <ChevronRight size={15} color={ICON_SUBTLE} strokeWidth={2} />
          </XStack>
        </AppCard>
      </YStack>
    </Pressable>
  );
}
