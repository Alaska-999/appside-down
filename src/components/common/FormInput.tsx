import {
  InputShell,
  InputShellSize,
  InputShellVariant,
} from "@/src/components/ui/InputShell";
import { AlertCircle } from "lucide-react-native";
import { forwardRef, ReactNode, Ref, useState } from "react";
import type { TextInput } from "react-native";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";
import { Input, InputProps, TamaguiElement, Text, XStack, YStack } from "tamagui";

type FormInputVariant = InputShellVariant | "bordered";
type FormInputSize = InputShellSize;

type FormInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
  variant?: FormInputVariant;
  inputSize?: FormInputSize;
  onValueChange?: (value: string) => void;
  hideError?: boolean;
  showCounter?: boolean;
} & Omit<InputProps, "value" | "onChangeText" | "size">;

function FormInputInner<T extends FieldValues>(
  {
    control,
    name,
    label,
    leftElement,
    rightElement,
    variant = "well",
    inputSize = "md",
    onValueChange,
    hideError = false,
    showCounter = false,
    maxLength,
    multiline,
    disabled,
    ...inputProps
  }: FormInputProps<T>,
  ref: Ref<TextInput>,
) {
  const formContext = useFormContext();
  const [focused, setFocused] = useState(false);
  const shellVariant: InputShellVariant = variant === "bordered" ? "well" : variant;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = (field.value as string) ?? "";
        const nearLimit =
          maxLength !== undefined && value.length >= maxLength - Math.max(3, Math.ceil(maxLength * 0.15));

        return (
          <YStack width="100%" gap={6}>
            {label && (
              <Text
                fontSize={11}
                fontWeight="700"
                letterSpacing={0.55}
                textTransform="uppercase"
                color="#7F97A6"
              >
                {label}
              </Text>
            )}
            <InputShell
              variant={shellVariant}
              size={inputSize}
              state={fieldState.error ? "error" : focused ? "focus" : "default"}
              multiline={multiline ?? undefined}
              disabled={Boolean(disabled)}
            >
              {leftElement}
              <Input
                f={1}
                unstyled
                h={multiline ? undefined : "100%"}
                minHeight={multiline ? 66 : undefined}
                fontSize={multiline ? 15 : 16}
                color="$color"
                placeholderTextColor="$placeholderColor"
                multiline={multiline}
                maxLength={maxLength}
                disabled={disabled}
                textAlignVertical={multiline ? "top" : undefined}
                {...inputProps}
                ref={(node: TamaguiElement | null) => {
                  const textInputNode = node as TextInput | null;
                  field.ref(textInputNode);
                  if (typeof ref === "function") ref(textInputNode);
                  else if (ref) (ref as { current: TextInput | null }).current = textInputNode;
                }}
                value={value}
                onChangeText={(text) => {
                  if (fieldState.error) {
                    formContext?.clearErrors(name);
                  }
                  onValueChange?.(text);
                  field.onChange(text);
                }}
                onFocus={() => setFocused(true)}
                onBlur={() => {
                  setFocused(false);
                  field.onBlur();
                }}
              />
              {rightElement}
              {showCounter && maxLength !== undefined && multiline && (
                <Text
                  als="flex-end"
                  mt="auto"
                  pt={8}
                  fontSize={10.5}
                  color={nearLimit ? "#FCD34D" : "$iconMuted"}
                >
                  {value.length}/{maxLength}
                </Text>
              )}
            </InputShell>
            {!hideError && fieldState.error && (
              <XStack ai="center" gap={6}>
                <AlertCircle size={13} color="#FCA5A5" strokeWidth={2.2} />
                <Text color="#FCA5A5" fontSize={11.5}>
                  {fieldState.error.message}
                </Text>
              </XStack>
            )}
          </YStack>
        );
      }}
    />
  );
}

export const FormInput = forwardRef(FormInputInner) as <T extends FieldValues>(
  props: FormInputProps<T> & { ref?: Ref<TextInput> },
) => ReturnType<typeof FormInputInner>;
