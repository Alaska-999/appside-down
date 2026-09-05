import { hapticTap } from "@/src/utils/haptics";
import { ComponentType, Fragment, ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

export function FolderEditRows({ children }: { children: ReactNode[] }) {
  return (
    <YStack br={20} overflow="hidden" bg="rgba(220,255,245,0.045)">
      {children.map((child, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <View
              style={{
                marginLeft: 16,
                height: 1,
                backgroundColor: "rgba(220,255,245,0.09)",
              }}
            />
          )}
          {child}
        </Fragment>
      ))}
    </YStack>
  );
}

const ICON_ACTION_TONE = {
  neutral: {
    bg: "rgba(220,255,245,0.055)",
    border: "rgba(220,255,245,0.11)",
    icon: "#B7CEDA",
  },
  danger: {
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.3)",
    icon: "#FCA5A5",
  },
  accent: {
    bg: "rgba(45,212,191,0.1)",
    border: "rgba(45,212,191,0.3)",
    icon: "#5EEAD4",
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
        w={36}
        h={36}
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
    <XStack ai="center" gap={12} px={16} py={14}>
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
        <Text fontSize={12} color="#5A6B7A">
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
                <Text fontSize={10} fontWeight="700" color="#8FA8B8">
                  {tag}
                </Text>
              </XStack>
            ))}
          </XStack>
        ) : (
          <Text fontSize={11} color="#5A6B7A">
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
      <XStack ai="center" gap={10} px={16} py={15}>
        <Icon size={19} color="#5EEAD4" strokeWidth={2.2} />
        <Text fontSize={15} fontWeight="600" color="#5EEAD4">
          {label}
        </Text>
      </XStack>
    </Pressable>
  );
}
