import { StarToggle } from "@/src/components/ui/controls/StarToggle";
import { ICON_MINT_LIGHT } from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
import { ArrowDownUp } from "lucide-react-native";
import { Pressable } from "react-native";
import { Text, XStack } from "tamagui";

export function CardsHeader({
  count,
  starredCount,
  starredOnly,
  onToggleStarred,
  onSort,
}: {
  count: number;
  starredCount: number;
  starredOnly: boolean;
  onToggleStarred: () => void;
  onSort: () => void;
}) {
  return (
    <XStack ai="center" jc="space-between" mb={11}>
      <XStack ai="baseline" gap={9}>
        <Text fontSize={16} fontWeight="700" color="$color">
          Cards
        </Text>
        {starredOnly && (
          <Text fontSize={12.5} fontWeight="600" color="$textMuted">
            {starredCount} starred
          </Text>
        )}
        {!starredOnly && (
          <Text fontSize={12.5} fontWeight="600" color="$textMuted">
            {count}
          </Text>
        )}
      </XStack>
      <XStack ai="center" gap={12}>
        <StarToggle
          size="sm"
          active={starredOnly}
          onPress={onToggleStarred}
          accessibilityLabel="Filter starred cards"
        />
        <Pressable
          hitSlop={{ top: 14, bottom: 14, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Sort cards"
          onPress={() => {
            hapticTap();
            onSort();
          }}
        >
          <XStack ai="center" gap={6}>
            <ArrowDownUp size={16} color={ICON_MINT_LIGHT} strokeWidth={2} />
            <Text fontSize={14.5} fontWeight="600" color="$mintLight">
              Sort
            </Text>
          </XStack>
        </Pressable>
      </XStack>
    </XStack>
  );
}
