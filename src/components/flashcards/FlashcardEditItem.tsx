import { FormInput } from "@/src/components/common/FormInput";
import { AppCard } from "@/src/components/ui/Card";
import { X } from "@tamagui/lucide-icons";
import { Ref, useRef } from "react";
import { TextInput, View } from "react-native";
import {
  Control,
  FieldValues,
  Path,
  useController,
  useFormContext,
} from "react-hook-form";
import { Button, Text, YStack } from "tamagui";

interface FlashcardEditItemProps<T extends FieldValues> {
  control: Control<T>;
  termName: Path<T>;
  definitionName: Path<T>;
  index: number;
  onRemove: (index: number) => void;
  showRemove: boolean;
  termRef?: Ref<TextInput>;
  definitionRef?: Ref<TextInput>;
  onFieldFocus?: (card: View | null) => void;
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
  onFieldFocus,
}: FlashcardEditItemProps<T>) {
  const term = useController({ control, name: termName });
  const definition = useController({ control, name: definitionName });
  const error = term.fieldState.error ?? definition.fieldState.error;

  const cardRef = useRef<View>(null);
  const handleFocus = () => onFieldFocus?.(cardRef.current);

  const formContext = useFormContext();
  const arrayName = termName.split(".")[0];
  const clearListError = () => {
    if (formContext?.getFieldState(arrayName).error) {
      formContext.clearErrors(arrayName);
    }
  };

  return (
    <View ref={cardRef} collapsable={false}>
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
          <FormInput
            control={control}
            name={termName}
            ref={termRef}
            variant="underline"
            inputSize="lg"
            hideError
            placeholder="Enter term"
            onFocus={handleFocus}
            onValueChange={clearListError}
            returnKeyType={onSubmitTerm ? "next" : undefined}
            blurOnSubmit={onSubmitTerm ? false : undefined}
            onSubmitEditing={onSubmitTerm}
          />
        </YStack>

        <YStack>
          <FieldLabel tone="definition">DEFINITION</FieldLabel>
          <FormInput
            control={control}
            name={definitionName}
            ref={definitionRef}
            variant="underline"
            inputSize="lg"
            hideError
            placeholder="Enter definition"
            onFocus={handleFocus}
            onValueChange={clearListError}
            returnKeyType={onSubmitDefinition ? "next" : undefined}
            blurOnSubmit={onSubmitDefinition ? false : undefined}
            onSubmitEditing={onSubmitDefinition}
          />
        </YStack>
      </AppCard>

      {error && (
        <Text color="$statusDanger" fontSize="$2">
          {error.message}
        </Text>
      )}
    </YStack>
    </View>
  );
}
