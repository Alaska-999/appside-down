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

type FormInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  rightElement?: ReactNode;
} & Omit<InputProps, "value" | "onChangeText">;

function FormInputInner<T extends FieldValues>(
  { control, name, rightElement, borderColor, ...inputProps }: FormInputProps<T>,
  ref: Ref<TextInput>,
) {
  const formContext = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <YStack width="100%" gap="$1">
          <XStack width="100%" ai="center" pos="relative">
            <Input
              f={1}
              size="$4"
              placeholderTextColor="$colorMuted"
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
                field.onChange(text);
              }}
              onBlur={field.onBlur}
              borderColor={
                fieldState.error ? "$statusDanger" : borderColor ?? "$borderColor"
              }
            />
            {rightElement}
          </XStack>
          {fieldState.error && (
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
