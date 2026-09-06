import { StarGlyph } from "@/src/components/ui/StarGlyph";
import { AppCard } from "@/src/components/ui/Card";
import { MODULE_PROGRESS_UNDERLINE } from "@/src/constants/featureFlags";
import {
  ICON_LIME,
  ICON_LIME_LIGHT,
  ICON_MINT_LIGHT,
  ICON_MUTED,
  ICON_SUBTLE,
} from "@/src/constants/iconColors";
import { GRADIENT_PRIMARY } from "@/src/constants/gradients";
import { TEXT_LIME_PALEST } from "@/src/constants/rawColors";
import { SURFACE_BORDER, SURFACE_GLASS_BORDER_FAINT } from "@/src/constants/surfaceAlpha";
import { hapticTap } from "@/src/utils/haptics";
import { withAlpha } from "@/src/utils/withAlpha";
import { LinearGradient } from "expo-linear-gradient";
import { Check, ChevronRight, X } from "lucide-react-native";
import { ReactNode, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { IconButton } from "../ui/IconButton";

interface ModuleCardProps {
  module: {
    id: string;
    name: string;
    itemsCount: number;
    isPublic?: boolean;
    isFavorite?: boolean;
    known?: number;
    total?: number;
  };
  removeButton?: boolean;
  onRemoveButtonPress?: () => void;
  trailing?: ReactNode;
  dimmed?: boolean;
  onPress: () => void;
}

const ROW_HEIGHT = 74;
const ROW_RADIUS = 23;

function MasteredTick() {
  return (
    <YStack
      w={20}
      h={20}
      br={10}
      ai="center"
      jc="center"
      bg={withAlpha(ICON_LIME, 0.16)}
      shadowColor={ICON_LIME_LIGHT}
      shadowOffset={{ width: 0, height: 0 }}
      shadowRadius={6}
      shadowOpacity={0.6}
      accessibilityLabel="Mastered"
    >
      <Check size={11} color={ICON_LIME_LIGHT} strokeWidth={3} />
    </YStack>
  );
}

function ProgressUnderline({ ratio, dim }: { ratio: number; dim: boolean }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 2,
        zIndex: 4,
        backgroundColor: SURFACE_GLASS_BORDER_FAINT,
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${Math.max(0, Math.min(1, ratio)) * 100}%`,
          overflow: "hidden",
          ...(dim
            ? { backgroundColor: SURFACE_BORDER }
            : {
                shadowColor: ICON_MINT_LIGHT,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 3.5,
                shadowOpacity: 0.6,
              }),
        }}
      >
        {!dim && (
          <LinearGradient
            colors={GRADIENT_PRIMARY}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>
    </View>
  );
}

export function ModuleCard({
  module,
  onPress,
  removeButton,
  onRemoveButtonPress,
  trailing,
  dimmed,
}: ModuleCardProps) {
  const [pressed, setPressed] = useState(false);
  const total = module.total ?? 0;
  const known = module.known ?? 0;
  const hasProgress = MODULE_PROGRESS_UNDERLINE && total > 0;
  const mastered = hasProgress && known >= total;

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
        variant={mastered ? "rowGold" : "row"}
        tone={mastered ? "lime" : "mint"}
        size="lg"
        pressed={pressed}
        height={ROW_HEIGHT}
        px={18}
        py={0}
        jc="center"
        opacity={dimmed ? 0.45 : 1}
      >
        <XStack ai="center" gap={12}>
          <YStack f={1} minWidth={0}>
            <XStack ai="center" gap={8}>
              <Text
                fontSize={16}
                fontWeight="700"
                letterSpacing={-0.16}
                color={mastered ? TEXT_LIME_PALEST : "$color"}
                numberOfLines={1}
                flexShrink={1}
              >
                {module.name}
              </Text>
              {mastered && <MasteredTick />}
            </XStack>
            <Text fontSize={12.5} color="$textMuted" mt={3}>
              {module.itemsCount} card{module.itemsCount !== 1 ? "s" : ""}
            </Text>
          </YStack>

          {module.isFavorite && !mastered && (
            <StarGlyph />
          )}

          {trailing}

          {!trailing && removeButton && onRemoveButtonPress && (
            <IconButton
              size={36}
              icon={<X size={18} color={ICON_MUTED} />}
              onPress={onRemoveButtonPress}
            />
          )}

          {!trailing && !removeButton && (
            <ChevronRight size={15} color={ICON_SUBTLE} strokeWidth={2} />
          )}
        </XStack>
      </AppCard>
      {hasProgress && (
        <ProgressUnderline
          ratio={total ? known / total : 0}
          dim={known / total < 0.25}
        />
      )}
      </YStack>
    </Pressable>
  );
}
