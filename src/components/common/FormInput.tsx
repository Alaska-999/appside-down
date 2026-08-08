import { forwardRef, ReactNode, Ref } from "react";
import type { TextInput } from "react-native";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";
import { Input, InputProps, Text, TamaguiElement, XStack, YStack } from "tamagui";

type FormInputVariant = "bordered" | "glass" | "underline";
type FormInputSize = "sm" | "md" | "lg";

const SIZE_STYLES: Record<FormInputSize, { height: number; fontSize: number; px: number }> = {
  sm: { height: 44, fontSize: 15, px: 14 },
  md: { height: 52, fontSize: 16, px: 16 },
  lg: { height: 60, fontSize: 19, px: 20 },
};

const MOCKUP_SCALE = 390 / 290;

const GLASS_DEFAULTS = {
  paddingVertical: 13 * MOCKUP_SCALE,
  paddingHorizontal: 15 * MOCKUP_SCALE,
  fontSize: 14.5 * MOCKUP_SCALE,
  borderRadius: 16 * MOCKUP_SCALE,
};

const GLASS_FOCUS_STYLE = {
  borderColor: "rgba(45,212,191,0.55)",
  shadowColor: "rgba(45,212,191,0.12)",
  shadowOpacity: 1,
  shadowRadius: 14 * MOCKUP_SCALE,
  shadowOffset: { width: 0, height: 0 },
};

type FormInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  rightElement?: ReactNode;
  variant?: FormInputVariant;
  inputSize?: FormInputSize;
  onValueChange?: (value: string) => void;
  hideError?: boolean;
} & Omit<InputProps, "value" | "onChangeText">;

function FormInputInner<T extends FieldValues>(
  {
    control,
    name,
    rightElement,
    variant = "bordered",
    inputSize,
    onValueChange,
    hideError = false,
    borderColor,
    borderWidth,
    bg,
    br,
    color,
    ...inputProps
  }: FormInputProps<T>,
  ref: Ref<TextInput>,
) {
  const formContext = useFormContext();
  const sizeStyle = inputSize ? SIZE_STYLES[inputSize] : null;
  const isUnderline = variant === "underline";
  const isGlass = variant === "glass";

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <YStack width="100%" gap="$1">
          <XStack width="100%" ai="center" pos="relative">
            <Input
              f={1}
              size={sizeStyle || isGlass ? undefined : "$4"}
              height={isUnderline ? undefined : sizeStyle?.height}
              py={isUnderline || sizeStyle ? undefined : isGlass ? GLASS_DEFAULTS.paddingVertical : undefined}
              px={isUnderline ? undefined : sizeStyle?.px ?? (isGlass ? GLASS_DEFAULTS.paddingHorizontal : undefined)}
              fontSize={sizeStyle?.fontSize ?? (isGlass ? GLASS_DEFAULTS.fontSize : undefined)}
              placeholderTextColor="$colorSecondary"
              color={color ?? "$color"}
              unstyled={isUnderline || undefined}
              bbw={isUnderline ? 1 : undefined}
              pb={isUnderline ? "$1" : undefined}
              focusStyle={
                isUnderline
                  ? { bc: "$accentGradientStart", bbw: 2 }
                  : isGlass
                    ? GLASS_FOCUS_STYLE
                    : undefined
              }
              bg={isUnderline ? undefined : bg ?? (isGlass ? "$glassBg" : undefined)}
              br={isUnderline ? undefined : br ?? (isGlass ? GLASS_DEFAULTS.borderRadius : undefined)}
              borderWidth={isUnderline ? undefined : borderWidth ?? 1}
              {...inputProps}
              ref={(node: TamaguiElement | null) => {
                const textInputNode = node as TextInput | null;
                field.ref(textInputNode);
                if (typeof ref === "function") ref(textInputNode);
                else if (ref) (ref as { current: TextInput | null }).current = textInputNode;
              }}
              value={field.value as string}
              onChangeText={(text) => {
                if (fieldState.error) {
                  formContext?.clearErrors(name);
                }
                onValueChange?.(text);
                field.onChange(text);
              }}
              onBlur={field.onBlur}
              borderColor={
                fieldState.error
                  ? "$statusDanger"
                  : isUnderline
                    ? "transparent"
                    : borderColor ?? (isGlass ? "$glassBorder" : "$borderColor")
              }
            />
            {rightElement}
          </XStack>
          {!hideError && fieldState.error && (
            <Text color="$statusDanger" fontSize="$2">
              {fieldState.error.message}
            </Text>
          )}
        </YStack>
      )}
    />
  );
}

export const FormInput = forwardRef(FormInputInner) as <T extends FieldValues>(
  props: FormInputProps<T> & { ref?: Ref<TextInput> },
) => ReturnType<typeof FormInputInner>;
