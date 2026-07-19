import { FormInput } from "@/src/components/common/FormInput";
import { FlashcardEditItem } from "@/src/components/flashcards/FlashcardEditItem";
import { Flashcard } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { EditModuleForm, editModuleSchema } from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronDown,
  Globe,
  Lock,
  Plus,
  X,
} from "@tamagui/lucide-icons";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { Pressable } from "react-native";
import type { TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button, Sheet, Text, XStack, YStack } from "tamagui";

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

  // keyName: наші картки мають власне поле id, тому ключ рендеру
  // useFieldArray кладе в окреме поле fieldKey, щоб не перетерти id
  const { fields, append, remove } = useFieldArray({
    control,
    name: "flashcards",
    keyName: "fieldKey",
  });

  const termRefs = useRef<Array<TextInput | null>>([]);
  const definitionRefs = useRef<Array<TextInput | null>>([]);
  const prevFieldsLength = useRef(fields.length);

  // фокус на нову картку тільки коли масив реально виріс (не при кожному рендері)
  useEffect(() => {
    if (fields.length > prevFieldsLength.current) {
      termRefs.current[fields.length - 1]?.focus();
    }
    prevFieldsLength.current = fields.length;
  }, [fields.length]);

  const focusTerm = (index: number) => termRefs.current[index]?.focus();
  const focusDefinition = (index: number) => definitionRefs.current[index]?.focus();

  // серверна помилка зникає, щойно юзер щось міняє у формі
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

    // повністю порожні картки не зберігаємо: нові — просто випадають,
    // існуючі, які юзер стер повністю, — видаляються з бази
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
            protectedFetch(
              `${process.env.EXPO_PUBLIC_API_URL}/flashcards/${cardId}`,
              {
                method: "DELETE",
              },
            ),
          ),
        ),
        Promise.all(
          keptCards
            .filter((c) => !c.isNew)
            .map((c) =>
              protectedFetch(
                `${process.env.EXPO_PUBLIC_API_URL}/flashcards/${c.id}`,
                {
                  method: "PATCH",
                  body: JSON.stringify({
                    term: c.term,
                    definition: c.definition,
                  }),
                },
              ).then((r) => r.json()),
            ),
        ),
        Promise.all(
          keptCards
            .filter((c) => c.isNew)
            .map((c) =>
              protectedFetch(`${process.env.EXPO_PUBLIC_API_URL}/flashcards`, {
                method: "POST",
                body: JSON.stringify({
                  term: c.term,
                  definition: c.definition,
                  moduleId,
                }),
              }).then((r) => r.json()),
            ),
        ),
        protectedFetch(
          `${process.env.EXPO_PUBLIC_API_URL}/modules/${moduleId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              name: data.name,
              description: data.description,
              isPublic,
            }),
          },
        ),
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
      <Sheet
        modal
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={[90]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay bg="$pureBlack" opacity={0.5} />
        <Sheet.Handle />
        <Sheet.Frame bg="$background">
          <XStack
            px="$4"
            pt="$3"
            pb="$3"
            ai="center"
            jc="space-between"
            borderBottomWidth={1}
            borderColor="$borderColor"
          >
            <Pressable hitSlop={8} onPress={() => onOpenChange(false)}>
              <X size={20} color="$colorMuted" />
            </Pressable>
            <Text fontSize="$5" fontWeight="bold" color="$color">
              Edit cards
            </Text>
            <Button
              size="$3"
              bg="$buttonBg"
              br="$10"
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              opacity={isSubmitting ? 0.6 : 1}
            >
              <Text color="$buttonText" fontSize="$3">
                {isSubmitting ? "Saving..." : "Save"}
              </Text>
            </Button>
          </XStack>

          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            bottomOffset={40}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          >
            <FormInput
              control={control}
              name="name"
              placeholder="Untitled Module"
              size="$5"
            />

            <FormInput
              control={control}
              name="description"
              placeholder="Description (optional)"
              size="$4"
              bg="transparent"
            />

            {/* Privacy dropdown */}
            <YStack px="$4" pt="$3">
              <Pressable onPress={() => setPrivacyOpen((prev) => !prev)}>
                <XStack
                  bg="$backgroundHover"
                  br="$4"
                  px="$4"
                  py="$3"
                  ai="center"
                  jc="space-between"
                  borderWidth={1}
                  borderColor="$borderColor"
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
                  bg="$backgroundHover"
                  br="$4"
                  mt="$1"
                  borderWidth={1}
                  borderColor="$borderColor"
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
                          <Check size={16} color="$color" />
                        )}
                      </XStack>
                    </Pressable>
                  ))}
                </YStack>
              )}
            </YStack>

            <YStack px="$4" py="$4" gap="$6">
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
                  onSubmitTerm={() => focusDefinition(index)}
                  onSubmitDefinition={() => {
                    if (index + 1 < fields.length) {
                      focusTerm(index + 1);
                    } else {
                      append({ id: `new-${Date.now()}`, term: "", definition: "", isNew: true });
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

              <Button
                icon={<Plus size="$1" />}
                onPress={handleAdd}
                bg="$buttonSecondaryBg"
                br="$10"
              >
                <Text color="$buttonSecondaryText">Add Card</Text>
              </Button>
            </YStack>
          </KeyboardAwareScrollView>
        </Sheet.Frame>
      </Sheet>
    </FormProvider>
  );
}
