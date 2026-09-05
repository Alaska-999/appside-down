import { GradientBorder } from "@/src/components/ui/GradientBorder";
import {
  FOCUS_BORDER,
  FocusRing,
  useFocusProgress,
} from "@/src/components/ui/InputShell";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
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
  colors: [
    "rgba(255,255,255,0.4)",
    "rgba(255,255,255,0.04)",
    "rgba(150,220,255,0.18)",
  ],
  positions: [0, 0.46, 1],
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
  const term = role === "term";
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Input
          unstyled
          px={0}
          py={term ? 4 : 8}
          fontSize={term ? 18 : 16}
          fontWeight={term ? "500" : "400"}
          color={term ? "#EFFDF8" : "#99b3c4"}
          placeholder={placeholder}
          placeholderTextColor={"#5A6B7A" as never}
          returnKeyType={returnKeyType}
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
      shadowColor="#000"
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
        <LiquidGlass
          intensity={30}
          borderRadius={CARD_RADIUS}
          backgroundColor="rgba(220,255,245,0.04)"
        />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 10,
            right: 10,
            height: 1,
            backgroundColor: "rgba(255,255,255,0.26)",
          }}
        />
      </YStack>
      <GradientBorder
        radius={CARD_RADIUS}
        angle={lit ? 180 : 160}
        colors={lit ? FOCUS_BORDER.colors : CARD_BORDER.colors}
        positions={lit ? FOCUS_BORDER.positions : CARD_BORDER.positions}
      />
      <FocusRing radius={CARD_RADIUS} progress={focusProgress} />

      <YStack px={16} pt={14} pb={12} zIndex={2}>
        <XStack ai="center" gap={14} mb={4}>
          <Text
            f={1}
            fontSize={10.5}
            fontWeight="700"
            letterSpacing={0.63}
            textTransform="uppercase"
            color={lit ? "#5EEAD4" : "#5A6B7A"}
          >
            Card {String(index + 1).padStart(2, "0")}
          </Text>
          {dragGesture ? (
            <GestureDetector gesture={dragGesture}>
              <View
                accessibilityLabel={`Reorder card ${index + 1}`}
                hitSlop={12}
                style={{ paddingHorizontal: 4, paddingVertical: 6 }}
              >
                <GripHorizontal
                  size={18}
                  color={dragging ? "#5EEAD4" : "#5A6B7A"}
                  strokeWidth={1.9}
                />
              </View>
            </GestureDetector>
          ) : (
            <GripHorizontal size={18} color="#5A6B7A" strokeWidth={1.9} />
          )}
          {canRemove && (
            <Pressable
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Delete card ${index + 1}`}
              onPress={() => {
                hapticTap();
                onRemove(index);
              }}
            >
              <Trash2 size={18} color="#5A6B7A" strokeWidth={1.9} />
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
          colors={["rgba(220,255,245,0.2)", "rgba(227, 248, 242, 0.05)"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
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
