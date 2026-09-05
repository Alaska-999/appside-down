import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import { FlashcardEditItem } from "@/src/components/flashcards/FlashcardEditItem";
import { AppButton } from "@/src/components/ui/Button";
import { IconButton } from "@/src/components/ui/IconButton";
import { AppSheet } from "@/src/components/ui/Sheet";
import { Flashcard } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { EditModuleForm, editModuleSchema } from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronDown, Globe, Lock, X } from "@tamagui/lucide-icons";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardAwareScrollViewRef,
} from "react-native-keyboard-controller";
import { Text, XStack, YStack } from "tamagui";

const CARD_TOP_GAP = 12;
const LIFT_SETTLE_DELAY = 360;

interface EditCardsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  cards: { id: string; term: string; definition: string }[];
  onSaved: (
    updatedCards: Flashcard[],
    name: string,
    description: string,
    isPublic: boolean,
    updatedAt: string,
  ) => void;
  moduleName: string;
  moduleDescription: string;
  moduleIsPublic: boolean;
}

export function EditCardsSheet({
  open,
  onOpenChange,
  moduleId,
  cards,
  onSaved,
  moduleName,
  moduleDescription,
  moduleIsPublic,
}: EditCardsSheetProps) {
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(moduleIsPublic);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<EditModuleForm>({
    resolver: zodResolver(editModuleSchema),
    defaultValues: {
      name: moduleName,
      description: moduleDescription,
      flashcards: cards,
    },
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

  const flashcardsError =
    errors.flashcards?.root?.message ??
    (errors.flashcards as { message?: string } | undefined)?.message;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "flashcards",
    keyName: "fieldKey",
  });

  const scrollRef = useRef<KeyboardAwareScrollViewRef & ScrollView>(null);
  const scrollInnerRef = useRef<View>(null as unknown as View);
  const termRefs = useRef<Array<TextInput | null>>([]);
  const definitionRefs = useRef<Array<TextInput | null>>([]);
  const prevFieldsLength = useRef(fields.length);

  useEffect(() => {
    if (fields.length > prevFieldsLength.current) {
      termRefs.current[fields.length - 1]?.focus();
    }
    prevFieldsLength.current = fields.length;
  }, [fields.length]);

  const liftCard = (card: View | null) => {
    const scrollTo = () => {
      const scroll = scrollRef.current;
      const inner = scrollInnerRef.current;
      if (!card || !scroll || !inner) return;
      card.measureLayout(inner, (_x, y) => {
        console.log("[EditCardsSheet] liftCard", { y });
        scroll.scrollTo({ y: Math.max(0, y - CARD_TOP_GAP), animated: true });
      });
    };
    scrollTo();
    setTimeout(scrollTo, LIFT_SETTLE_DELAY);
  };

  const focusTerm = (index: number) => termRefs.current[index]?.focus();
  const focusDefinition = (index: number) =>
    definitionRefs.current[index]?.focus();

  useEffect(() => {
    const subscription = form.watch(() => setServerError(null));
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (open) {
      reset({
        name: moduleName,
        description: moduleDescription,
        flashcards: cards.map((c) => ({ ...c })),
      });
      setRemovedIds([]);
      setIsPublic(moduleIsPublic);
      setPrivacyOpen(false);
      setServerError(null);
    }
  }, [open]);

  const handleAdd = () => {
    append({ id: `new-${Date.now()}`, term: "", definition: "", isNew: true });
  };

  const handleRemove = (index: number) => {
    const card = getValues(`flashcards.${index}`);
    if (!card.isNew) {
      setRemovedIds((prev) => [...prev, card.id]);
    }
    remove(index);
  };

  const onSubmit = async (data: EditModuleForm) => {
    setServerError(null);

    const isEmpty = (card: { term: string; definition: string }) =>
      !card.term && !card.definition;
    const keptCards = data.flashcards.filter((c) => !isEmpty(c));
    const emptiedExistingIds = data.flashcards
      .filter((c) => !c.isNew && isEmpty(c))
      .map((c) => c.id);
    const idsToDelete = [...removedIds, ...emptiedExistingIds];

    try {
      const [, patchedResults, createdResults, moduleRes] = await Promise.all([
        Promise.all(
          idsToDelete.map((cardId) =>
            protectedFetch(`${API_BASE_URL}/flashcards/${cardId}`, {
              method: "DELETE",
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
              }).then((r) => r.json()),
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
              }).then((r) => r.json()),
            ),
        ),
        protectedFetch(`${API_BASE_URL}/modules/${moduleId}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: data.name,
            description: data.description,
            isPublic,
          }),
        }),
      ]);

      const updatedModule = await moduleRes.json();

      onSaved(
        [...patchedResults, ...createdResults],
        data.name,
        data.description,
        isPublic,
        updatedModule.updatedAt,
      );
      onOpenChange(false);
    } catch (err) {
      console.error("[EditCardsSheet] save error:", err);
      setServerError("Failed to save changes. Please try again");
    }
  };

  return (
    <FormProvider {...form}>
      <AppSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Edit module"
        snapPoints={[90]}
        keepKeyboard
        growWithKeyboard
        leftAction={
          <IconButton
            variant="glass"
            size={36}
            icon={<X size={16} color="$colorSecondary" />}
            onPress={() => onOpenChange(false)}
          />
        }
        rightAction={
          <AppButton
            variant="primary"
            size="sm"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          >
            Save
          </AppButton>
        }
      >
        <KeyboardAwareScrollView
          ref={scrollRef}
          innerViewRef={scrollInnerRef}
          style={{ flex: 1 }}
          mode="layout"
          bottomOffset={40}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="always"
        >
          <YStack gap="$3">
            <FormInput
              control={control}
              name="name"
              placeholder="Untitled Module"
              variant="glass"
              inputSize="md"
            />

            <FormInput
              control={control}
              name="description"
              placeholder="Description (optional)"
              variant="glass"
              inputSize="md"
            />

            <YStack>
              <Pressable onPress={() => setPrivacyOpen((prev) => !prev)}>
                <XStack
                  bg="$glassBg"
                  br={16}
                  px="$4"
                  height={48}
                  ai="center"
                  jc="space-between"
                  borderWidth={1}
                  borderColor="$glassBorder"
                >
                  <XStack ai="center" gap="$2">
                    {isPublic ? (
                      <Globe size={16} color="$colorSecondary" />
                    ) : (
                      <Lock size={16} color="$colorSecondary" />
                    )}
                    <Text fontSize="$4" color="$color">
                      {isPublic ? "Public" : "Private"}
                    </Text>
                  </XStack>
                  <ChevronDown
                    size={16}
                    color="$colorMuted"
                    rotate={privacyOpen ? "180deg" : "0deg"}
                  />
                </XStack>
              </Pressable>

              {privacyOpen && (
                <YStack
                  bg="$glassBg"
                  br={16}
                  mt="$2"
                  borderWidth={1}
                  borderColor="$glassBorder"
                  overflow="hidden"
                >
                  {(
                    [
                      {
                        value: false,
                        label: "Private",
                        hint: "Only you can see this module",
                        Icon: Lock,
                      },
                      {
                        value: true,
                        label: "Public",
                        hint: "Anyone can find and save it",
                        Icon: Globe,
                      },
                    ] as const
                  ).map(({ value, label, hint, Icon }) => (
                    <Pressable
                      key={label}
                      onPress={() => {
                        setIsPublic(value);
                        setPrivacyOpen(false);
                      }}
                    >
                      <XStack px="$4" py="$3" ai="center" gap="$2">
                        <Icon size={16} color="$colorSecondary" />
                        <YStack f={1}>
                          <Text fontSize="$4" color="$color">
                            {label}
                          </Text>
                          <Text fontSize="$2" color="$colorMuted">
                            {hint}
                          </Text>
                        </YStack>
                        {isPublic === value && (
                          <Check size={16} color="$accentGradientStart" />
                        )}
                      </XStack>
                    </Pressable>
                  ))}
                </YStack>
              )}
            </YStack>
          </YStack>

          <YStack pt="$5" gap="$4">
            {fields.map((field, index) => (
              <FlashcardEditItem
                key={field.fieldKey}
                control={control}
                termName={`flashcards.${index}.term`}
                definitionName={`flashcards.${index}.definition`}
                index={index}
                onRemove={handleRemove}
                showRemove={fields.length > 1}
                termRef={(node) => {
                  termRefs.current[index] = node;
                }}
                definitionRef={(node) => {
                  definitionRefs.current[index] = node;
                }}
                onFieldFocus={liftCard}
                onSubmitTerm={() => focusDefinition(index)}
                onSubmitDefinition={() => {
                  if (index + 1 < fields.length) {
                    focusTerm(index + 1);
                  } else {
                    append({
                      id: `new-${Date.now()}`,
                      term: "",
                      definition: "",
                      isNew: true,
                    });
                  }
                }}
              />
            ))}

            {flashcardsError && (
              <Text color="$statusDanger" fontSize="$2">
                {flashcardsError}
              </Text>
            )}

            {serverError && (
              <Text color="$statusDanger" fontSize="$3" textAlign="center">
                {serverError}
              </Text>
            )}

            <AppButton variant="outline" size="lg" onPress={handleAdd}>
              + Add Card
            </AppButton>
          </YStack>
        </KeyboardAwareScrollView>
      </AppSheet>
    </FormProvider>
  );
}
