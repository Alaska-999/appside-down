import { X } from "@tamagui/lucide-icons";
import { Ref } from "react";
import type { TextInput } from "react-native";
import {
  Control,
  FieldValues,
  Path,
  useController,
  useFormContext,
} from "react-hook-form";
import { Button, Input, TamaguiElement, Text, YStack } from "tamagui";

interface FlashcardEditItemProps<T extends FieldValues> {
  control: Control<T>;
  termName: Path<T>;
  definitionName: Path<T>;
  index: number;
  onRemove: (index: number) => void;
  showRemove: boolean;
  termRef?: Ref<TextInput>;
  definitionRef?: Ref<TextInput>;
  onSubmitTerm?: () => void;
  onSubmitDefinition?: () => void;
}

export function FlashcardEditItem<T extends FieldValues>({
  control,
  termName,
  definitionName,
  index,
  onRemove,
  showRemove,
  termRef,
  definitionRef,
  onSubmitTerm,
  onSubmitDefinition,
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

  const setMergedRef =
    (fieldRef: (node: TextInput | null) => void, forwardedRef?: Ref<TextInput>) =>
    // Input у react-native — це насправді TextInput,
    // хоча tamagui типізує ref як TamaguiElement
    (node: TamaguiElement | null) => {
      const textInputNode = node as TextInput | null;
      fieldRef(textInputNode);
      if (typeof forwardedRef === "function") forwardedRef(textInputNode);
      else if (forwardedRef) (forwardedRef as { current: TextInput | null }).current = textInputNode;
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
            ref={setMergedRef(term.field.ref, termRef)}
            placeholder="Enter term"
            placeholderTextColor="$colorMuted"
            value={term.field.value as string}
            onChangeText={(text) => {
              clearListError();
              term.field.onChange(text);
            }}
            onBlur={term.field.onBlur}
            returnKeyType={onSubmitTerm ? "next" : undefined}
            blurOnSubmit={onSubmitTerm ? false : undefined}
            onSubmitEditing={onSubmitTerm}
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
            ref={setMergedRef(definition.field.ref, definitionRef)}
            placeholder="Enter definition"
            placeholderTextColor="$colorMuted"
            value={definition.field.value as string}
            onChangeText={(text) => {
              clearListError();
              definition.field.onChange(text);
            }}
            onBlur={definition.field.onBlur}
            returnKeyType={onSubmitDefinition ? "next" : undefined}
            blurOnSubmit={onSubmitDefinition ? false : undefined}
            onSubmitEditing={onSubmitDefinition}
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
