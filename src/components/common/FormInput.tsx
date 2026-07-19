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
  { control, name, rightElement, ...inputProps }: FormInputProps<T>,
  ref: Ref<TextInput>,
) {
  // потрібен FormProvider навколо форми: звідси беремо clearErrors,
  // щоб показана помилка зникала, щойно юзер знову почав вводити
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
                // Input у react-native — це насправді TextInput,
                // хоча tamagui типізує ref як TamaguiElement
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

// forwardRef + generics потребує явного каста типу, інакше TS губить дженерик T
export const FormInput = forwardRef(FormInputInner) as <T extends FieldValues>(
  props: FormInputProps<T> & { ref?: Ref<TextInput> },
) => ReturnType<typeof FormInputInner>;
