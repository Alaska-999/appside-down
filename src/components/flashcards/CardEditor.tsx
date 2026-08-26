import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { hapticTap } from "@/src/utils/haptics";
import { GripHorizontal, Trash2 } from "lucide-react-native";
import { Ref, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { GestureDetector, GestureType } from "react-native-gesture-handler";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Input, Text, XStack, YStack } from "tamagui";

const CARD_RADIUS = 20;
const FIELD_RADIUS = 13;

function CardField<T extends FieldValues>({
  control,
  name,
  placeholder,
  inputRef,
  onSubmitEditing,
  returnKeyType,
}: {
  control: Control<T>;
  name: Path<T>;
  placeholder: string;
  inputRef?: Ref<TextInput>;
  onSubmitEditing?: () => void;
  returnKeyType?: "next" | "done";
}) {
  const [focused, setFocused] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <YStack br={FIELD_RADIUS} pos="relative">
          <YStack
            pos="absolute"
            t={0}
            l={0}
            r={0}
            b={0}
            br={FIELD_RADIUS}
            overflow="hidden"
          >
            <View
              style={[
                StyleSheet.absoluteFillObject,
                { backgroundColor: "rgba(4,8,10,0.5)" },
              ]}
            />
          </YStack>
          {focused && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: FIELD_RADIUS,
                borderWidth: 1.5,
                borderColor: "rgba(94,234,212,0.7)",
                zIndex: 3,
              }}
            />
          )}
          <Input
            unstyled
            zIndex={2}
            px={13}
            py={11}
            fontSize={14.5}
            color="$color"
            placeholder={placeholder}
            placeholderTextColor={"#5A6B7A" as never}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            ref={inputRef as never}
            value={(field.value as string) ?? ""}
            onChangeText={field.onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              field.onBlur();
            }}
          />
        </YStack>
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
}) {
  return (
    <YStack
      br={CARD_RADIUS}
      pos="relative"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 4 }}
      shadowRadius={dragging ? 16 : 7}
      shadowOpacity={dragging ? 0.9 : 0.8}
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
          tint="default"
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
        angle={160}
        colors={[
          "rgba(255,255,255,0.4)",
          "rgba(255,255,255,0.04)",
          "rgba(150,220,255,0.18)",
        ]}
        positions={[0, 0.46, 1]}
      />

      <YStack p={14} zIndex={2} gap={8}>
        <XStack ai="center" gap={10} mb={3}>
          <Text f={1} fontSize={11} fontWeight="800" letterSpacing={0.66} color="#5A6B7A">
            {String(index + 1).padStart(2, "0")}
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
        />
        <CardField
          control={control}
          name={definitionName}
          placeholder="Definition"
          inputRef={definitionRef}
          returnKeyType="next"
          onSubmitEditing={onSubmitDefinition}
        />
      </YStack>
    </YStack>
  );
}
