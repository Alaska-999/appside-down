import { FOLDER_ICON_GRADIENTS, FolderIcon } from "@/src/components/cards/FolderIcon";
import { AppCard } from "@/src/components/ui/Card";
import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { hapticTap } from "@/src/utils/haptics";
import { ChevronRight, Plus, Settings, Star } from "lucide-react-native";
import { useState } from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";

export type FolderCardModule = {
  id: string;
  name: string;
  itemsCount: number;
  isFavorite?: boolean;
};

interface FolderCardProps {
  folder: {
    id: string;
    name: string;
    icon?: string | null;
    moduleIds?: string[];
    modules?: unknown[];
    _count?: { modules?: number };
  };
  index?: number;
  expanded?: boolean;
  modules?: FolderCardModule[];
  modulesLoading?: boolean;
  onToggle?: () => void;
  onPress: () => void;
  onModulePress?: (moduleId: string) => void;
  onAddModule?: () => void;
  onSettings?: () => void;
}

const CARD_RADIUS = 23;
const HEADER_HEIGHT = 80;
const VISIBLE_MODULES = 4;
const EASE = Easing.bezier(0.2, 0.8, 0.3, 1);

const SWEEP_COLORS = [
  "rgba(94,234,212,0)",
  "rgba(94,234,212,1)",
  "rgba(190,242,100,0.9)",
  "rgba(190,242,100,0)",
  "rgba(190,242,100,0)",
];
const SWEEP_POSITIONS = [0, 0.08, 0.14, 0.26, 1];

function StackShadow({ expanded }: { expanded: boolean }) {
  const reduced = useReducedMotion();
  const duration = reduced ? 0 : 300;

  const backStyle = useAnimatedStyle(() => ({
    opacity: withTiming(expanded ? 0 : 1, { duration, easing: EASE }),
    transform: [{ translateY: withTiming(expanded ? -6 : 0, { duration, easing: EASE }) }],
  }));
  const frontStyle = useAnimatedStyle(() => ({
    opacity: withTiming(expanded ? 0.4 : 1, { duration, easing: EASE }),
  }));

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 0,
            left: 14,
            right: 14,
            height: 36,
            borderRadius: 20,
            backgroundColor: "rgba(24,34,38,0.42)",
            borderWidth: 1,
            borderColor: "rgba(220,255,245,0.09)",
          },
          backStyle,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 6,
            left: 7,
            right: 7,
            height: 36,
            borderRadius: 20,
            backgroundColor: "rgba(24,34,38,0.62)",
            borderWidth: 1,
            borderColor: "rgba(220,255,245,0.12)",
          },
          frontStyle,
        ]}
      />
    </>
  );
}

function SubRow({
  module,
  onPress,
}: {
  module: FolderCardModule;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        hapticTap();
        onPress?.();
      }}
    >
      <XStack ai="center" gap={12} p={12} br={15}>
        <Text fontSize={14.5} fontWeight="600" color="$color" f={1} numberOfLines={1}>
          {module.name}
        </Text>
        {module.isFavorite && <Star size={12} color="#BEF264" fill="#BEF264" />}
        <Text fontSize={11.5} color="#8FA8B8">
          {module.itemsCount}
        </Text>
        <ChevronRight size={13} color="#5A6B7A" strokeWidth={2} />
      </XStack>
    </Pressable>
  );
}

export function FolderCard({
  folder,
  index = 0,
  expanded = false,
  modules,
  modulesLoading,
  onToggle,
  onPress,
  onModulePress,
  onAddModule,
  onSettings,
}: FolderCardProps) {
  const [pressed, setPressed] = useState(false);
  const gradient = FOLDER_ICON_GRADIENTS[index % FOLDER_ICON_GRADIENTS.length];
  const moduleCount =
    folder._count?.modules ??
    folder.modules?.length ??
    folder.moduleIds?.length ??
    0;
  const visible = (modules ?? []).slice(0, VISIBLE_MODULES);

  return (
    <YStack pos="relative" pt={12}>
      <StackShadow expanded={expanded} />
      <YStack zIndex={3}>
        <YStack pos="relative">
          <AppCard
            variant="row"
            size="lg"
            pressed={pressed}
            px={0}
            py={0}
            overflow="hidden"
          >
            <Pressable
              onPress={() => {
                hapticTap();
                onPress();
              }}
              onPressIn={() => setPressed(true)}
              onPressOut={() => setPressed(false)}
            >
              <XStack h={HEADER_HEIGHT} px={16} ai="center" gap={14}>
                <FolderIcon
                  icon={folder.icon}
                  name={folder.name}
                  size={52}
                  radius={17}
                  gradient={gradient}
                />
                <YStack f={1} minWidth={0}>
                  <Text
                    fontSize={17}
                    fontWeight="700"
                    letterSpacing={-0.17}
                    color="$color"
                    numberOfLines={1}
                  >
                    {folder.name}
                  </Text>
                  <Text fontSize={12.5} color="#8FA8B8" mt={3}>
                    {moduleCount} module{moduleCount !== 1 ? "s" : ""}
                  </Text>
                </YStack>
                <Pressable
                  onPress={() => {
                    hapticTap();
                    onToggle?.();
                  }}
                  hitSlop={{ top: 18, bottom: 18, left: 14, right: 14 }}
                  accessibilityLabel={
                    expanded ? "Collapse folder" : "Expand folder"
                  }
                >
                  <YStack
                    w={20}
                    h={44}
                    ai="center"
                    jc="center"
                    rotate={expanded ? "90deg" : "0deg"}
                  >
                    <ChevronRight
                      size={16}
                      color={expanded ? "#5EEAD4" : "#5A6B7A"}
                      strokeWidth={2}
                    />
                  </YStack>
                </Pressable>
              </XStack>
            </Pressable>

            {expanded && (
              <YStack
                px={10}
                pb={10}
                borderTopWidth={1}
                borderTopColor="rgba(220,255,245,0.09)"
              >
                <YStack pt={8} gap={4}>
                  {modulesLoading && !visible.length ? (
                    <Text fontSize={12.5} color="#8FA8B8" p={12}>
                      Loading…
                    </Text>
                  ) : (
                    visible.map((m) => (
                      <SubRow
                        key={m.id}
                        module={m}
                        onPress={() => onModulePress?.(m.id)}
                      />
                    ))
                  )}
                </YStack>

                <Pressable
                  onPress={() => {
                    hapticTap();
                    onAddModule?.();
                  }}
                >
                  <XStack
                    ai="center"
                    jc="center"
                    gap={8}
                    p={11}
                    mt={4}
                    br={15}
                    borderWidth={1}
                    borderStyle="dashed"
                    borderColor="rgba(220,255,245,0.18)"
                  >
                    <Plus size={14} color="#5EEAD4" strokeWidth={2.2} />
                    <Text fontSize={12.5} fontWeight="600" color="#5EEAD4">
                      Add module
                    </Text>
                  </XStack>
                </Pressable>

                <Pressable
                  onPress={() => {
                    hapticTap();
                    onSettings?.();
                  }}
                >
                  <XStack
                    ai="center"
                    gap={10}
                    px={12}
                    py={13}
                    mt={6}
                    borderTopWidth={1}
                    borderTopColor="rgba(220,255,245,0.08)"
                  >
                    <Settings size={18} color="#8FA8B8" strokeWidth={1.8} />
                    <Text fontSize={13} fontWeight="600" color="#8FA8B8" f={1}>
                      Folder settings
                    </Text>
                    <ChevronRight size={14} color="#5A6B7A" strokeWidth={2} />
                  </XStack>
                </Pressable>
              </YStack>
            )}
          </AppCard>

          {expanded && (
            <>
              <GradientBorder
                radius={CARD_RADIUS}
                width={1.4}
                angle={140}
                colors={["rgba(220,255,245,0.18)", "rgba(220,255,245,0.04)"]}
                positions={[0, 1]}
              />
              <GradientBorder
                radius={CARD_RADIUS}
                width={1.4}
                sweep
                spinDuration={7000}
                colors={SWEEP_COLORS}
                positions={SWEEP_POSITIONS}
              />
            </>
          )}
        </YStack>
      </YStack>
    </YStack>
  );
}
