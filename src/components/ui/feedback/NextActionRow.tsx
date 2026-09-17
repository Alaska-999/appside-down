import { GlowSurface, LAMP_TILE } from "@/src/components/ui/surface/GlowSurface";
import { GradientBorder } from "@/src/components/ui/surface/GradientBorder";
import {
  ICON_LIME,
  ICON_LIME_LIGHT,
  ICON_MINT,
  ICON_MINT_LIGHT,
  ICON_PURE_BLACK,
  ICON_WHITE,
} from "@/src/constants/iconColors";
import {
  GLASS_BORDER_BOTTOM,
  GLASS_BORDER_TOP,
  GLASS_SHEEN_SOFT,
  GLASS_SHEEN_TOP_LINE,
  LIQUID_LENS_TINT,
  SKY_GLOW_SOFT,
} from "@/src/constants/rawColors";
import {
  SURFACE_GLASS_BG,
  SURFACE_GLASS_BG_FAINT,
} from "@/src/constants/surfaceAlpha";
import { NextAction } from "@/src/types";
import { hapticTap } from "@/src/utils/haptics";
import { pluralize } from "@/src/utils/plural";
import { estimateMinutes } from "@/src/utils/progress";
import { withAlpha } from "@/src/utils/withAlpha";
import { ChevronRight } from "lucide-react-native";
import { View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

type RowVariant = "action" | "quiet" | "invite";
type DotTone = "lime" | "mint";

const VARIANT_STYLES: Record<
  RowVariant,
  {
    radius: number;
    fill: string;
    sheen: string;
    titleColor: string;
    titleWeight: "500" | "600";
    shadowOffsetY: number;
    shadowRadius: number;
    borderAngle: number;
    borderColors: string[];
    borderPositions: number[];
  }
> = {
  action: {
    radius: 16,
    fill: SURFACE_GLASS_BG,
    sheen: GLASS_SHEEN_TOP_LINE,
    titleColor: "$color",
    titleWeight: "600",
    shadowOffsetY: 4,
    shadowRadius: 7,
    borderAngle: 160,
    borderColors: [GLASS_BORDER_TOP, GLASS_BORDER_BOTTOM, SKY_GLOW_SOFT],
    borderPositions: [0, 0.46, 1],
  },
  quiet: {
    radius: 16,
    fill: SURFACE_GLASS_BG_FAINT,
    sheen: withAlpha(ICON_WHITE, 0.18),
    titleColor: "$mutedLight",
    titleWeight: "500",
    shadowOffsetY: 4,
    shadowRadius: 7,
    borderAngle: 160,
    borderColors: [
      withAlpha(ICON_WHITE, 0.22),
      GLASS_BORDER_BOTTOM,
      LIQUID_LENS_TINT,
    ],
    borderPositions: [0, 0.46, 1],
  },
  invite: {
    radius: 18,
    fill: SURFACE_GLASS_BG,
    sheen: GLASS_SHEEN_SOFT,
    titleColor: "$color",
    titleWeight: "600",
    shadowOffsetY: 6,
    shadowRadius: 10,
    borderAngle: 150,
    borderColors: [
      withAlpha(ICON_MINT_LIGHT, 0.5),
      withAlpha(ICON_WHITE, 0.05),
      withAlpha(ICON_MINT_LIGHT, 0.18),
    ],
    borderPositions: [0, 0.48, 1],
  },
};

const DOT_COLORS: Record<DotTone, string> = {
  lime: ICON_LIME_LIGHT,
  mint: ICON_MINT_LIGHT,
};

const PILL_HEIGHT = 36;
const INVITE_LAMP = { rx: 1.18, ry: 1.5, cx: 0.08, cy: -0.3 };
const MODE_LABEL: Record<string, string | undefined> = {
  FLASHCARDS: "Flashcards",
  LEARN: "Learn",
};

function TopHighlight({ color }: { color: string }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 9,
        right: 9,
        height: 1,
        backgroundColor: color,
      }}
    />
  );
}

function Dot({ tone }: { tone: DotTone }) {
  const color = DOT_COLORS[tone];
  return (
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 6,
        shadowOpacity: 0.85,
      }}
    />
  );
}

function MiniPill({ label }: { label: string }) {
  return (
    <XStack
      h={PILL_HEIGHT}
      px={15}
      br={PILL_HEIGHT / 2}
      ai="center"
      jc="center"
      gap={7}
      pos="relative"
      overflow="hidden"
      bg={withAlpha(ICON_MINT, 0.05)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <GradientBorder
        radius={PILL_HEIGHT / 2}
        angle={150}
        colors={[withAlpha(ICON_LIME, 0.6), withAlpha(ICON_LIME, 0.18)]}
        positions={[0, 1]}
      />
      <Text fontSize={12.5} fontWeight="700" color="$limeLight" zIndex={2}>
        {label}
      </Text>
    </XStack>
  );
}

type ActionCopy = { title: string; sub?: string; dot: DotTone };

function actionCopy(action: NextAction): ActionCopy | null {
  if (action.kind === "learn_new") {
    const modeLabel = MODE_LABEL[action.mode];
    if (!modeLabel) return null;
    const minutes = estimateMinutes(action.count);
    return {
      title: `Learn ${pluralize(action.count, "new card")}`,
      sub: `${modeLabel} · about ${pluralize(minutes, "minute")}`,
      dot: "mint",
    };
  }
  if (action.kind === "prove") {
    return {
      title: `${pluralize(action.count, "card")} you recognise — try writing them`,
      dot: "lime",
    };
  }
  return null;
}

export function NextActionRow({
  action,
  mastered,
  total,
  onPress,
}: {
  action: NextAction | null;
  mastered: number;
  total: number;
  onPress?: () => void;
}) {
  const allSolid = !action && total > 0 && mastered >= total;
  const copy = action ? actionCopy(action) : null;
  if (action && !copy) return null;
  if (!action && !allSolid) return null;

  const variant: RowVariant = allSolid ? "invite" : onPress ? "action" : "quiet";
  const style = VARIANT_STYLES[variant];
  const title = copy ? copy.title : `All ${pluralize(total, "card")} are solid`;
  const sub = copy ? copy.sub : "A short practice keeps them that way";
  const spoken = sub ? `${title}. ${sub}` : title;

  const pressProps = onPress
    ? {
        onPress: () => {
          hapticTap();
          onPress();
        },
        pressStyle: { scale: 0.98 },
        transition: "press" as const,
        accessibilityRole: "button" as const,
        accessibilityLabel: allSolid ? `Practise. ${spoken}` : spoken,
      }
    : null;

  return (
    <GlowSurface
      radius={style.radius}
      fd="row"
      ai="center"
      gap={allSolid ? 12 : 11}
      px={allSolid ? 13 : 14}
      py={allSolid ? 13 : 12}
      minHeight={allSolid ? 62 : 48}
      tone="mint"
      lampAlpha={allSolid ? 0.22 : 0}
      lampGeometry={allSolid ? INVITE_LAMP : LAMP_TILE}
      lampEdge={0.62}
      fill={style.fill}
      blurIntensity={30}
      shadowColor={ICON_PURE_BLACK}
      shadowOffset={{ width: 0, height: style.shadowOffsetY }}
      shadowRadius={style.shadowRadius}
      shadowOpacity={0.8}
      underlay={<TopHighlight color={style.sheen} />}
      borderAngle={style.borderAngle}
      borderColors={style.borderColors}
      borderPositions={style.borderPositions}
      {...pressProps}
    >
      {!allSolid && copy && <Dot tone={copy.dot} />}
      <YStack f={1} minWidth={0} ml={allSolid ? 2 : 0}>
        <Text
          fontSize={13.5}
          fontWeight={style.titleWeight}
          lineHeight={18.2}
          color={style.titleColor}
        >
          {title}
        </Text>
        {!!sub && (
          <Text fontSize={11.5} color="$textMuted" mt={allSolid ? 3 : 2}>
            {sub}
          </Text>
        )}
      </YStack>
      {allSolid ? (
        onPress ? (
          <MiniPill label="Practise" />
        ) : null
      ) : onPress ? (
        <XStack w={22} h={22} ai="center" jc="center">
          <ChevronRight
            size={15}
            color={ICON_MINT_LIGHT}
            strokeWidth={2.2}
          />
        </XStack>
      ) : null}
    </GlowSurface>
  );
}
