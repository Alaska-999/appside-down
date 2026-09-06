import { FocusRing, useFocusProgress } from "@/src/components/ui/FocusRing";
import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { ICON_MINT, ICON_MUTED, ICON_PURE_BLACK } from "@/src/constants/iconColors";
import { FOCUS_HIGHLIGHT } from "@/src/constants/focus";
import {
  CARD_EDITOR_DIVIDER_END,
  CARD_EDITOR_EDGE_BLUE,
  CARD_EDITOR_EDGE_SOFT,
  GLASS_BORDER_TOP,
  WHITE_BLOOM_FAINT,
} from "@/src/constants/rawColors";
import { SURFACE_BORDER } from "@/src/constants/surfaceAlpha";
import { hapticTap } from "@/src/utils/haptics";
import { LinearGradient } from "expo-linear-gradient";
import { GripHorizontal, Trash2 } from "lucide-react-native";
import { Ref, useRef, useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Pressable, TextInput, View } from "react-native";
import { GestureDetector, GestureType } from "react-native-gesture-handler";
import { Input, Text, XStack, YStack } from "tamagui";

const CARD_RADIUS = 20;
const CARD_BORDER = {
  colors: [GLASS_BORDER_TOP, SURFACE_BORDER, CARD_EDITOR_EDGE_SOFT, CARD_EDITOR_EDGE_BLUE],
  positions: [0, 0.3, 0.8, 1],
};

const FIELD_STYLES = {
  term: {
    py: 8,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "500" as const,
    color: "$text",
    opacity: 1,
    multiline: false,
  },
  definition: {
    py: 10,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "400" as const,
    color: "$text",
    opacity: 0.84,
    multiline: true,
  },
};

function CardField<T extends FieldValues>({
  control,
  name,
  placeholder,
  inputRef,
  onSubmitEditing,
  returnKeyType,
  role,
  onFocusChange,
}: {
  control: Control<T>;
  name: Path<T>;
  placeholder: string;
  inputRef?: Ref<TextInput>;
  onSubmitEditing?: () => void;
  returnKeyType?: "next" | "done";
  role: "term" | "definition";
  onFocusChange: (focused: boolean) => void;
}) {
  const f = FIELD_STYLES[role];
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Input
          unstyled
          px={0}
          py={f.py}
          fontSize={f.fontSize}
          fontWeight={f.fontWeight}
          style={{ lineHeight: f.lineHeight }}
          color={f.color}
          opacity={f.opacity}
          placeholder={placeholder}
          placeholderTextColor={"$mutedDim" as never}
          selectionColor="$mintLight"
          cursorColor="$mintLight"
          multiline={f.multiline}
          scrollEnabled={false}
          textAlignVertical="top"
          submitBehavior={f.multiline ? "blurAndSubmit" : "submit"}
          returnKeyType={returnKeyType}
          autoCapitalize="sentences"
          onSubmitEditing={onSubmitEditing}
          ref={inputRef as never}
          value={(field.value as string) ?? ""}
          onChangeText={field.onChange}
          onFocus={() => onFocusChange(true)}
          onBlur={() => {
            onFocusChange(false);
            field.onBlur();
          }}
        />
      )}
    />
  );
}

export function CardEditor<T extends FieldValues>({
  control,
  termName,
  definitionName,
  index,
  onRemove,
  canRemove,
  termRef,
  definitionRef,
  onSubmitTerm,
  onSubmitDefinition,
  dragGesture,
  dragging,
  onFieldFocus,
}: {
  control: Control<T>;
  termName: Path<T>;
  definitionName: Path<T>;
  index: number;
  onRemove: (index: number) => void;
  canRemove: boolean;
  termRef?: Ref<TextInput>;
  definitionRef?: Ref<TextInput>;
  onSubmitTerm?: () => void;
  onSubmitDefinition?: () => void;
  dragGesture?: GestureType;
  dragging?: boolean;
  onFieldFocus?: (card: View | null) => void;
}) {
  const cardRef = useRef<View>(null);
  const [focusCount, setFocusCount] = useState(0);
  const lit = focusCount > 0 || !!dragging;
  const onFocusChange = (focused: boolean) => {
    setFocusCount((n) => Math.max(0, n + (focused ? 1 : -1)));
    if (focused) onFieldFocus?.(cardRef.current);
  };
  const focusProgress = useFocusProgress(lit);

  return (
    <YStack
      ref={cardRef as never}
      br={CARD_RADIUS}
      pos="relative"
      shadowColor={ICON_PURE_BLACK}
      shadowOffset={{ width: 0, height: dragging ? 10 : 4 }}
      shadowRadius={dragging ? 14 : 7}
      shadowOpacity={0.8}
    >
      <YStack
        pos="absolute"
        t={0}
        l={0}
        r={0}
        b={0}
        br={CARD_RADIUS}
        overflow="hidden"
      >
        <LiquidGlass intensity={25} borderRadius={CARD_RADIUS} />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 10,
            right: 10,
            height: 1,
            backgroundColor: FOCUS_HIGHLIGHT,
          }}
        />
      </YStack>
      <GradientBorder
        radius={CARD_RADIUS}
        angle={160}
        colors={CARD_BORDER.colors}
        positions={CARD_BORDER.positions}
      />
      <FocusRing radius={CARD_RADIUS} progress={focusProgress} />

      <YStack px={16} pt={14} pb={12} zIndex={2}>
        <XStack ai="center" gap={14} mb={4}>
          <Text
            f={1}
            fontSize={10.5}
            fontWeight="500"
            letterSpacing={0.63}
            textTransform="uppercase"
            color={lit ? "$mintLight" : "$textMuted"}
          >
            Card {String(index + 1).padStart(2, "0")}
          </Text>
          {dragGesture && (
            <GestureDetector gesture={dragGesture}>
              <View
                accessibilityLabel={`Reorder card ${index + 1}`}
                hitSlop={12}
                style={{ paddingHorizontal: 4, paddingVertical: 6 }}
              >
                <GripHorizontal
                  size={20}
                  color={dragging ? ICON_MINT : ICON_MUTED}
                  strokeWidth={1.9}
                />
              </View>
            </GestureDetector>
          )}
          {canRemove && (
            <Pressable
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel={`Delete card ${index + 1}`}
              onPress={() => {
                hapticTap();
                onRemove(index);
              }}
            >
              <Trash2
                size={20}
                color={dragging ? ICON_MINT : ICON_MUTED}
                strokeWidth={1.9}
              />
            </Pressable>
          )}
        </XStack>

        <CardField
          control={control}
          name={termName}
          placeholder="Term"
          inputRef={termRef}
          returnKeyType="next"
          onSubmitEditing={onSubmitTerm}
          role="term"
          onFocusChange={onFocusChange}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[WHITE_BLOOM_FAINT, CARD_EDITOR_DIVIDER_END]}
          start={{ x: 1, y: 0.5 }}
          end={{ x: 0, y: 0.5 }}
          style={{ height: 1, marginTop: 6 }}
        />
        <CardField
          control={control}
          name={definitionName}
          placeholder="Definition"
          inputRef={definitionRef}
          returnKeyType="next"
          onSubmitEditing={onSubmitDefinition}
          role="definition"
          onFocusChange={onFocusChange}
        />
      </YStack>
    </YStack>
  );
}
