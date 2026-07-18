import { ReactNode } from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Input, InputProps, Text, XStack, YStack } from "tamagui";

type FormInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  rightElement?: ReactNode;
} & Omit<InputProps, "value" | "onChangeText">;

export function FormInput<T extends FieldValues>({
  control,
  name,
  rightElement,
  ...inputProps
}: FormInputProps<T>) {
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
              {...inputProps}
              value={field.value as string}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              borderColor={fieldState.error ? "$statusDanger" : "$borderColor"}
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
