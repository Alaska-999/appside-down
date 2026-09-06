import {
  ICON_ACCENT,
  ICON_DANGER,
  ICON_MINT_LIGHT,
  ICON_MUTED_LIGHT,
} from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
import { ComponentType, Fragment, ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

export { ROW_HEIGHT as FOLDER_EDIT_ROW_HEIGHT };

export function FolderEditRows({ children }: { children: ReactNode[] }) {
  return (
    <YStack br="$cardSoft" overflow="hidden" bg="$glassBg">
      {children.map((child, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <View
              style={{
                height: 1,
                backgroundColor: "rgba(220,255,245,0.08)",
              }}
            />
          )}
          {child}
        </Fragment>
      ))}
    </YStack>
  );
}

const ACTION_SIZE = 36;
const ROW_HEIGHT = 56;

const ICON_ACTION_TONE = {
  neutral: {
    bg: "rgba(220,255,245,0.055)",
    pressedBg: "rgba(220,255,245,0.16)",
    border: "rgba(220,255,245,0.11)",
    icon: ICON_MUTED_LIGHT,
  },
  danger: {
    bg: "rgba(239,68,68,0.1)",
    pressedBg: "rgba(239,68,68,0.24)",
    border: "rgba(239,68,68,0.3)",
    icon: ICON_DANGER,
  },
  accent: {
    bg: "rgba(45,212,191,0.1)",
    pressedBg: "rgba(45,212,191,0.24)",
    border: "rgba(45,212,191,0.3)",
    icon: ICON_ACCENT,
  },
} as const;

export function FolderEditIconAction({
  icon: Icon,
  tone = "neutral",
  label,
  onPress,
}: {
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  tone?: keyof typeof ICON_ACTION_TONE;
  label: string;
  onPress: () => void;
}) {
  const t = ICON_ACTION_TONE[tone];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={() => {
        hapticTap();
        onPress();
      }}
    >
      <YStack
        w={ACTION_SIZE}
        h={ACTION_SIZE}
        br={12}
        ai="center"
        jc="center"
        bg={t.bg}
        borderWidth={1}
        borderColor={t.border}
      >
        <Icon size={18} color={t.icon} strokeWidth={1.9} />
      </YStack>
    </Pressable>
  );
}

export function FolderTagEditRow({
  label,
  count,
  actions,
}: {
  label: string;
  count?: number;
  actions: ReactNode;
}) {
  return (
    <XStack ai="center" gap={12} px={16} h={ROW_HEIGHT}>
      <Text
        fontSize={15}
        fontWeight="600"
        color="$color"
        f={1}
        numberOfLines={1}
      >
        {label}
      </Text>
      {count !== undefined && (
        <Text fontSize={12} color="$mutedDim">
          {count}
        </Text>
      )}
      <XStack ai="center" gap={8}>
        {actions}
      </XStack>
    </XStack>
  );
}

export function FolderModuleEditRow({
  name,
  tags,
  actions,
}: {
  name: string;
  tags: string[];
  actions: ReactNode;
}) {
  return (
    <XStack ai="center" gap={12} pl={16} pr={12} py={11}>
      <YStack f={1} minWidth={0} gap={5}>
        <Text fontSize={15} fontWeight="600" color="$color" numberOfLines={1}>
          {name}
        </Text>
        {tags.length > 0 ? (
          <XStack gap={5} flexWrap="wrap">
            {tags.map((tag) => (
              <XStack
                key={tag}
                px={7}
                py={2}
                br={999}
                bg="rgba(220,255,245,0.07)"
                borderWidth={1}
                borderColor="rgba(220,255,245,0.11)"
              >
                <Text fontSize={10} fontWeight="700" color="$textMuted">
                  {tag}
                </Text>
              </XStack>
            ))}
          </XStack>
        ) : (
          <Text fontSize={11} color="$mutedDim">
            No tags
          </Text>
        )}
      </YStack>
      <XStack ai="center" gap={8}>
        {actions}
      </XStack>
    </XStack>
  );
}

export function FolderAddRow({
  icon: Icon,
  label,
  onPress,
}: {
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        hapticTap();
        onPress();
      }}
    >
      <XStack ai="center" gap={10} px={16} h={ROW_HEIGHT}>
        <Icon size={19} color={ICON_MINT_LIGHT} strokeWidth={2.2} />
        <Text fontSize={15} fontWeight="600" color="$mintLight">
          {label}
        </Text>
      </XStack>
    </Pressable>
  );
}
