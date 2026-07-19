import { X } from "@tamagui/lucide-icons";
import {
  Control,
  FieldValues,
  Path,
  useController,
  useFormContext,
} from "react-hook-form";
import { Button, Input, Text, YStack } from "tamagui";

interface FlashcardEditItemProps<T extends FieldValues> {
  control: Control<T>;
  termName: Path<T>;
  definitionName: Path<T>;
  index: number;
  onRemove: (index: number) => void;
  showRemove: boolean;
}

export function FlashcardEditItem<T extends FieldValues>({
  control,
  termName,
  definitionName,
  index,
  onRemove,
  showRemove,
}: FlashcardEditItemProps<T>) {
  const term = useController({ control, name: termName });
  const definition = useController({ control, name: definitionName });
  const error = term.fieldState.error ?? definition.fieldState.error;

  // помилка рівня списку карток ("Add at least 2 cards") зникає,
  // щойно юзер починає заповнювати будь-яку картку
  const formContext = useFormContext();
  const arrayName = termName.split(".")[0];
  const clearListError = () => {
    if (formContext?.getFieldState(arrayName).error) {
      formContext.clearErrors(arrayName);
    }
  };

  return (
    <YStack gap="$1">
      <YStack bg="$backgroundHover" p="$4" br="$4" gap="$5" pos="relative">
        {showRemove && (
          <Button
            pos="absolute"
            top="$2"
            right="$2"
            size="$2"
            circular
            chromeless
            icon={<X size="$1" color="$colorSecondary" o={0.7} />}
            onPress={() => onRemove(index)}
          />
        )}

        <YStack mt="$2">
          <Input
            unstyled
            placeholder="Enter term"
            placeholderTextColor="$colorMuted"
            value={term.field.value as string}
            onChangeText={(text) => {
              clearListError();
              term.field.onChange(text);
            }}
            onBlur={term.field.onBlur}
            fontSize="$5"
            pb="$1"
            bbw={1}
            bc={term.fieldState.error ? "$statusDanger" : "$borderColor"}
            focusStyle={{ bc: "$primary", bbw: 2 }}
          />
          <Text fontSize="$1" color="$colorSecondary" mt="$1" fow="600" o={0.7}>
            TERM
          </Text>
        </YStack>

        <YStack>
          <Input
            unstyled
            placeholder="Enter definition"
            placeholderTextColor="$colorMuted"
            value={definition.field.value as string}
            onChangeText={(text) => {
              clearListError();
              definition.field.onChange(text);
            }}
            onBlur={definition.field.onBlur}
            fontSize="$5"
            pb="$1"
            bbw={1}
            bc={definition.fieldState.error ? "$statusDanger" : "$borderColor"}
            focusStyle={{ bc: "$primary", bbw: 2 }}
          />
          <Text fontSize="$1" color="$colorSecondary" mt="$1" fow="600" o={0.7}>
            DEFINITION
          </Text>
        </YStack>
      </YStack>

      {error && (
        <Text color="$statusDanger" fontSize="$2">
          {error.message}
        </Text>
      )}
    </YStack>
  );
}
