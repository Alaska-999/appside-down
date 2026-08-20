import { useEffect, useRef, useState } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import type { TextInput as RNTextInput } from "react-native";
import { Pressable, TextInput } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";

type CodeCellState = "empty" | "on" | "cur" | "bad" | "good";

const CELL_SIZES = {
  md: { width: 46, height: 56, radius: 14, fontSize: 22 },
  lg: { width: 50, height: 60, radius: 16, fontSize: 22 },
} as const;

const CELL_BORDERS: Record<CodeCellState, { width: number; color: string }> = {
  empty: { width: 1, color: "rgba(220,255,245,0.1)" },
  on: { width: 1.4, color: "rgba(220,255,245,0.24)" },
  cur: { width: 1.6, color: "rgba(94,234,212,0.8)" },
  bad: { width: 1.5, color: "rgba(239,68,68,0.7)" },
  good: { width: 1.4, color: "rgba(163,230,53,0.6)" },
};

const CELL_TEXT: Record<CodeCellState, string> = {
  empty: "$color",
  on: "$color",
  cur: "$color",
  bad: "#FCA5A5",
  good: "#BEF264",
};

function Caret() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 525 }),
        withTiming(0, { duration: 100 }),
        withTiming(0, { duration: 325 }),
        withTiming(1, { duration: 100 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[{ width: 1.6, height: 20, backgroundColor: "#EFFDF8" }, style]}
    />
  );
}

interface CodeInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  length?: number;
  size?: keyof typeof CELL_SIZES;
  autoFocus?: boolean;
  onComplete?: (code: string) => void;
}

export function CodeInput<T extends FieldValues>({
  control,
  name,
  length = 6,
  size = "md",
  autoFocus,
  onComplete,
}: CodeInputProps<T>) {
  const inputRef = useRef<RNTextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const cell = CELL_SIZES[size];

  const focusInput = () => {
    if (isFocused) {
      inputRef.current?.blur();
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return;
    }
    inputRef.current?.focus();
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value: string = field.value ?? "";
        const complete = value.length === length;

        return (
          <YStack width="100%" gap={6}>
            <YStack pos="relative" width="100%">
              <Pressable onPress={focusInput}>
                <XStack jc="center" gap={9} pointerEvents="none">
                  {Array.from({ length }).map((_, index) => {
                    const char = value[index];
                    const isActive = isFocused && index === Math.min(value.length, length - 1) && !complete;
                    const state: CodeCellState = fieldState.error
                      ? "bad"
                      : complete
                        ? "good"
                        : isActive
                          ? "cur"
                          : char
                            ? "on"
                            : "empty";
                    const border = CELL_BORDERS[state];

                    return (
                      <YStack
                        key={index}
                        width={cell.width}
                        height={cell.height}
                        br={cell.radius}
                        bg="rgba(4,7,10,0.5)"
                        borderWidth={border.width}
                        borderColor={border.color}
                        ai="center"
                        jc="center"
                      >
                        {char ? (
                          <Text
                            color={CELL_TEXT[state]}
                            fontSize={cell.fontSize}
                            fontWeight="700"
                          >
                            {char}
                          </Text>
                        ) : (
                          isActive && <Caret />
                        )}
                      </YStack>
                    );
                  })}
                </XStack>
              </Pressable>
              <TextInput
                ref={inputRef}
                value={value}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "").slice(0, length);
                  field.onChange(cleaned);
                  if (cleaned.length === length) {
                    onComplete?.(cleaned);
                  }
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  field.onBlur();
                }}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={length}
                autoFocus={autoFocus}
                caretHidden
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0,
                }}
              />
            </YStack>
            {fieldState.error && (
              <Text color="#FCA5A5" fontSize={11.5} textAlign="center">
                {fieldState.error.message}
              </Text>
            )}
          </YStack>
        );
      }}
    />
  );
}
