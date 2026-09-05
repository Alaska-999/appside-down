import { API_BASE_URL } from "@/src/api/config";
import { CardEditor } from "@/src/components/flashcards/CardEditor";
import { AddPill } from "@/src/components/ui/AddPill";
import { IconButton } from "@/src/components/ui/IconButton";
import { SavePill } from "@/src/components/ui/SavePill";
import { AppSheet } from "@/src/components/ui/Sheet";
import { ICON_ON_GLASS } from "@/src/constants/iconColors";
import { useKeyboardCardLift } from "@/src/hooks/useKeyboardCardLift";
import { useServerError } from "@/src/hooks/useServerError";
import { Flashcard } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { EditCardsForm, editCardsSchema } from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";

interface EditCardsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  cards: { id: string; term: string; definition: string }[];
  onSaved: (updatedCards: Flashcard[]) => void;
}

const newCard = () => ({
  id: `new-${Date.now()}`,
  term: "",
  definition: "",
  isNew: true,
});

export function EditCardsSheet({
  open,
  onOpenChange,
  moduleId,
  cards,
  onSaved,
}: EditCardsSheetProps) {
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  const form = useForm<EditCardsForm>({
    resolver: zodResolver(editCardsSchema),
    defaultValues: { flashcards: cards },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = form;
  const [serverError, setServerError] = useServerError(form);

  const flashcardsError =
    errors.flashcards?.root?.message ??
    (errors.flashcards as { message?: string } | undefined)?.message;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "flashcards",
    keyName: "fieldKey",
  });

  const {
    scrollRef,
    scrollInnerRef,
    onViewportLayout,
    spacerStyle,
    liftCard,
  } = useKeyboardCardLift();
  const termRefs = useRef<Array<TextInput | null>>([]);
  const definitionRefs = useRef<Array<TextInput | null>>([]);
  const prevFieldsLength = useRef(fields.length);

  useEffect(() => {
    if (fields.length > prevFieldsLength.current) {
      termRefs.current[fields.length - 1]?.focus();
    }
    prevFieldsLength.current = fields.length;
  }, [fields.length]);

  const focusTerm = (index: number) => termRefs.current[index]?.focus();
  const focusDefinition = (index: number) =>
    definitionRefs.current[index]?.focus();

  useEffect(() => {
    if (open) {
      reset({ flashcards: cards.map((c) => ({ ...c })) });
      setRemovedIds([]);
      setServerError(null);
    }
  }, [open]);

  const handleRemove = (index: number) => {
    const card = getValues(`flashcards.${index}`);
    if (!card.isNew) {
      setRemovedIds((prev) => [...prev, card.id]);
    }
    remove(index);
  };

  const onSubmit = async (data: EditCardsForm) => {
    setServerError(null);

    const isEmpty = (card: { term: string; definition: string }) =>
      !card.term && !card.definition;
    const keptCards = data.flashcards.filter((c) => !isEmpty(c));
    const emptiedExistingIds = data.flashcards
      .filter((c) => !c.isNew && isEmpty(c))
      .map((c) => c.id);
    const idsToDelete = [...removedIds, ...emptiedExistingIds];

    try {
      const readJson = async (res: Response) => {
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        return res.json();
      };

      const [, patchedResults, createdResults] = await Promise.all([
        Promise.all(
          idsToDelete.map((cardId) =>
            protectedFetch(`${API_BASE_URL}/flashcards/${cardId}`, {
              method: "DELETE",
            }).then((r) => {
              if (!r.ok) throw new Error(`Error: ${r.status}`);
              return r;
            }),
          ),
        ),
        Promise.all(
          keptCards
            .filter((c) => !c.isNew)
            .map((c) =>
              protectedFetch(`${API_BASE_URL}/flashcards/${c.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                  term: c.term,
                  definition: c.definition,
                }),
              }).then(readJson),
            ),
        ),
        Promise.all(
          keptCards
            .filter((c) => c.isNew)
            .map((c) =>
              protectedFetch(`${API_BASE_URL}/flashcards`, {
                method: "POST",
                body: JSON.stringify({
                  term: c.term,
                  definition: c.definition,
                  moduleId,
                }),
              }).then(readJson),
            ),
        ),
      ]);

      onSaved([...patchedResults, ...createdResults]);
      onOpenChange(false);
    } catch (err) {
      console.error("[EditCardsSheet] save error:", err);
      setServerError("Couldn't save the cards. Try again");
    }
  };

  return (
    <FormProvider {...form}>
      <AppSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Edit cards"
        snapPoints={[90]}
        keepKeyboard
        growWithKeyboard
        leftAction={
          <IconButton
            variant="liquidGlass"
            icon={<X size={22} color={ICON_ON_GLASS} strokeWidth={1.9} />}
            onPress={() => onOpenChange(false)}
            accessibilityLabel="Close"
          />
        }
        rightAction={
          <SavePill loading={isSubmitting} onPress={handleSubmit(onSubmit)} />
        }
      >
        <View style={{ flex: 1 }} onLayout={onViewportLayout}>
          <KeyboardAwareScrollView
            ref={scrollRef}
            innerViewRef={scrollInnerRef}
            enabled={false}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="none"
            keyboardShouldPersistTaps="always"
          >
            <XStack ai="center" jc="space-between" mb={6}>
              <Text fontSize={16} fontWeight="700" color="$color">
                Cards
              </Text>
              <Text fontSize={12.5} color="$textMuted">
                {fields.length}
              </Text>
            </XStack>

            <YStack gap={10}>
              {fields.map((field, index) => (
                <CardEditor
                  key={field.fieldKey}
                  control={control}
                  termName={`flashcards.${index}.term`}
                  definitionName={`flashcards.${index}.definition`}
                  index={index}
                  onRemove={handleRemove}
                  canRemove={fields.length > 2}
                  onFieldFocus={liftCard}
                  termRef={(node) => {
                    termRefs.current[index] = node;
                  }}
                  definitionRef={(node) => {
                    definitionRefs.current[index] = node;
                  }}
                  onSubmitTerm={() => focusDefinition(index)}
                  onSubmitDefinition={() => {
                    if (index + 1 < fields.length) focusTerm(index + 1);
                    else append(newCard());
                  }}
                />
              ))}
            </YStack>

            {flashcardsError && (
              <Text color="$dangerText" fontSize={11.5} mt={8}>
                {flashcardsError}
              </Text>
            )}

            {serverError && (
              <Text
                color="$dangerText"
                fontSize={12.5}
                textAlign="center"
                mt={12}
              >
                {serverError}
              </Text>
            )}

            <YStack ai="center" mt={18}>
              <AddPill label="Add card" onPress={() => append(newCard())} />
            </YStack>
            <Animated.View style={spacerStyle} />
          </KeyboardAwareScrollView>
        </View>
      </AppSheet>
    </FormProvider>
  );
}
