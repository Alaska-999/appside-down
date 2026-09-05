import {
  InputShell,
  InputShellSize,
  InputShellVariant,
} from "@/src/components/ui/InputShell";
import { ICON_DANGER, ICON_SUBTLE } from "@/src/constants/iconColors";
import { AlertCircle, Eye, EyeOff } from "lucide-react-native";
import { FieldGroupContext } from "@/src/components/ui/FieldGroup";
import { forwardRef, ReactNode, Ref, useContext, useState } from "react";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";
import type { TextInput } from "react-native";
import { Pressable } from "react-native";
import {
  Input,
  InputProps,
  TamaguiElement,
  Text,
  XStack,
  YStack,
} from "tamagui";

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
  secureToggle?: boolean;
  textRole?: FormInputTextRole;
} & Omit<InputProps, "value" | "onChangeText" | "size">;

type FormInputTextRole = "body" | "title";

const TEXT_ROLE_STYLES: Record<
  FormInputTextRole,
  { fontSize: number; fontWeight: "400" | "700" }
> = {
  body: { fontSize: 16, fontWeight: "400" },
  title: { fontSize: 19, fontWeight: "700" },
};

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
    secureToggle = false,
    textRole = "body",
    maxLength,
    multiline,
    disabled,
    ...inputProps
  }: FormInputProps<T>,
  ref: Ref<TextInput>,
) {
  const formContext = useFormContext();
  const [focused, setFocused] = useState(false);
  const [secureVisible, setSecureVisible] = useState(false);
  const groupFocus = useContext(FieldGroupContext);
  const shellVariant: InputShellVariant =
    variant === "bordered" ? "well" : variant;
  const text = TEXT_ROLE_STYLES[textRole];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = (field.value as string) ?? "";
        const nearLimit =
          maxLength !== undefined &&
          value.length >= maxLength - Math.max(3, Math.ceil(maxLength * 0.15));

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
                minHeight={
                  multiline ? (variant === "plain" ? 50 : 66) : undefined
                }
                fontSize={multiline ? 15 : text.fontSize}
                fontWeight={text.fontWeight}
                color="$color"
                placeholderTextColor="$placeholderColor"
                multiline={multiline}
                maxLength={maxLength}
                disabled={disabled}
                textAlignVertical={multiline ? "top" : undefined}
                {...inputProps}
                secureTextEntry={
                  secureToggle ? !secureVisible : inputProps.secureTextEntry
                }
                ref={(node: TamaguiElement | null) => {
                  const textInputNode = node as TextInput | null;
                  field.ref(textInputNode);
                  if (typeof ref === "function") ref(textInputNode);
                  else if (ref)
                    (ref as { current: TextInput | null }).current =
                      textInputNode;
                }}
                value={value}
                onChangeText={(text) => {
                  if (fieldState.error) {
                    formContext?.clearErrors(name);
                  }
                  onValueChange?.(text);
                  field.onChange(text);
                }}
                onFocus={(e) => {
                  setFocused(true);
                  groupFocus?.(true);
                  inputProps.onFocus?.(e);
                }}
                onBlur={(e) => {
                  setFocused(false);
                  groupFocus?.(false);
                  field.onBlur();
                  inputProps.onBlur?.(e);
                }}
              />
              {secureToggle ? (
                <Pressable
                  onPress={() => setSecureVisible((prev) => !prev)}
                  hitSlop={8}
                >
                  {secureVisible ? (
                    <EyeOff size={19} color={ICON_SUBTLE} strokeWidth={1.9} />
                  ) : (
                    <Eye size={19} color={ICON_SUBTLE} strokeWidth={1.9} />
                  )}
                </Pressable>
              ) : (
                rightElement
              )}
              {showCounter && maxLength !== undefined && value.length > 0 && (
                <Text
                  als={multiline ? "flex-end" : undefined}
                  mt={multiline ? "auto" : undefined}
                  pt={multiline ? 8 : undefined}
                  fontSize={multiline ? 10.5 : 11.5}
                  color={nearLimit ? "#FCD34D" : "$mutedDim"}
                >
                  {value.length}/{maxLength}
                </Text>
              )}
            </InputShell>
            {!hideError && fieldState.error && (
              <XStack ai="center" gap={6}>
                <AlertCircle size={13} color={ICON_DANGER} strokeWidth={2.2} />
                <Text color="$dangerText" fontSize={11.5}>
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
