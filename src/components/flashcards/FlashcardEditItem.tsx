import { AppCard } from "@/src/components/ui/Card";
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

function FieldLabel({ tone, children }: { tone: "term" | "definition"; children: string }) {
  return (
    <Text
      fontSize={13}
      fontWeight="800"
      letterSpacing={0.8}
      textTransform="uppercase"
      color={tone === "term" ? "$accentGradientEnd" : "$accentGradientStart"}
      mb={4}
    >
      {children}
    </Text>
  );
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

  const formContext = useFormContext();
  const arrayName = termName.split(".")[0];
  const clearListError = () => {
    if (formContext?.getFieldState(arrayName).error) {
      formContext.clearErrors(arrayName);
    }
  };

  const setMergedRef =
    (fieldRef: (node: TextInput | null) => void, forwardedRef?: Ref<TextInput>) =>
    (node: TamaguiElement | null) => {
      const textInputNode = node as TextInput | null;
      fieldRef(textInputNode);
      if (typeof forwardedRef === "function") forwardedRef(textInputNode);
      else if (forwardedRef) (forwardedRef as { current: TextInput | null }).current = textInputNode;
    };

  return (
    <YStack gap="$1">
      <AppCard
        variant="soft"
        p="$cardPad"
        gap={12}
        pos="relative"
        borderLeftWidth={4}
        borderLeftColor="$accentGradientStart"
      >
        {showRemove && (
          <Button
            pos="absolute"
            top="$2"
            right="$2"
            size="$2"
            circular
            chromeless
            o={0.5}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            icon={<X size="$1" color="$colorMuted" />}
            onPress={() => onRemove(index)}
          />
        )}

        <YStack>
          <FieldLabel tone="term">TERM</FieldLabel>
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
            fontSize={19}
            color="$color"
            pb="$1"
            bbw={1}
            bc={term.fieldState.error ? "$statusDanger" : "transparent"}
            focusStyle={{ bc: "$accentGradientStart", bbw: 2 }}
          />
        </YStack>

        <YStack>
          <FieldLabel tone="definition">DEFINITION</FieldLabel>
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
            fontSize={19}
            color="$color"
            pb="$1"
            bbw={1}
            bc={definition.fieldState.error ? "$statusDanger" : "transparent"}
            focusStyle={{ bc: "$accentGradientStart", bbw: 2 }}
          />
        </YStack>
      </AppCard>

      {error && (
        <Text color="$statusDanger" fontSize="$2">
          {error.message}
        </Text>
      )}
    </YStack>
  );
}
