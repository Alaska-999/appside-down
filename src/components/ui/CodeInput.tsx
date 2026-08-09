import { useRef, useState } from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
} from "react-hook-form";
import type { TextInput as RNTextInput } from "react-native";
import { Pressable, TextInput } from "react-native";
import { Text, XStack, YStack } from "tamagui";

const MOCKUP_SCALE = 390 / 290;
const CELL_WIDTH = 36 * MOCKUP_SCALE;
const CELL_HEIGHT = 44 * MOCKUP_SCALE;
const CELL_RADIUS = 12 * MOCKUP_SCALE;
const CELL_GAP = 8 * MOCKUP_SCALE;

interface CodeInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  length?: number;
  autoFocus?: boolean;
  onComplete?: (code: string) => void;
}

export function CodeInput<T extends FieldValues>({
  control,
  name,
  length = 6,
  autoFocus,
  onComplete,
}: CodeInputProps<T>) {
  const inputRef = useRef<RNTextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

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

        return (
          <YStack width="100%" gap="$1">
            <YStack pos="relative" width="100%">
              <Pressable onPress={focusInput}>
                <XStack jc="center" gap={CELL_GAP} pointerEvents="none">
                  {Array.from({ length }).map((_, index) => {
                    const char = value[index];
                    const isFilled = Boolean(char);
                    const isActive = isFocused && index === value.length;

                    return (
                      <YStack
                        key={index}
                        width={CELL_WIDTH}
                        height={CELL_HEIGHT}
                        br={CELL_RADIUS}
                        bg="$glassBg"
                        borderWidth={1}
                        borderColor={
                          isActive
                            ? "rgba(163,230,53,0.65)"
                            : isFilled
                              ? "rgba(45,212,191,0.5)"
                              : "$glassBorder"
                        }
                        shadowColor={
                          isActive ? "rgba(163,230,53,0.15)" : undefined
                        }
                        shadowOpacity={isActive ? 1 : 0}
                        shadowRadius={12 * MOCKUP_SCALE}
                        shadowOffset={{ width: 0, height: 0 }}
                        ai="center"
                        jc="center"
                      >
                        <Text color="$color" fontSize={18 * MOCKUP_SCALE} fontWeight="700">
                          {char ?? ""}
                        </Text>
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
              <Text color="$statusDanger" fontSize="$2" textAlign="center">
                {fieldState.error.message}
              </Text>
            )}
          </YStack>
        );
      }}
    />
  );
}
