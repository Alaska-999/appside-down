import { API_BASE_URL } from "@/src/api/config";
import { ModalFormHeader } from "@/src/components/common/ModalFormHeader";
import { CardEditor } from "@/src/components/flashcards/CardEditor";
import { AddPill } from "@/src/components/ui/AddPill";
import {
  KEYBOARD_BAR_HEIGHT,
  KeyboardBar,
} from "@/src/components/ui/KeyboardBar";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { AppToast } from "@/src/components/ui/Toast";
import { useKeyboardCardLift } from "@/src/hooks/useKeyboardCardLift";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { Flashcard } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { EditCardsForm, editCardsSchema } from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { Platform, TextInput, View } from "react-native";
import {
  KeyboardAwareScrollView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";

const STICKY_ADD_HEIGHT = 46;
const STICKY_ADD_KEYBOARD_GAP = 10;
const STICKY_ADD_CLEARANCE = STICKY_ADD_HEIGHT + 20;

const newCard = () => ({
  id: `new-${Date.now()}`,
  term: "",
  definition: "",
  isNew: true,
});

export default function ModuleCardsEditScreen() {
  const screen = useScreenInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const stickyAdd =
    screen.top + contentHeight + STICKY_ADD_CLEARANCE > viewportHeight;

  const { height: keyboardOffset, progress: keyboardProgress } =
    useReanimatedKeyboardAnimation();
  const stickyAddStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY:
          keyboardOffset.value -
          keyboardProgress.value *
            (KEYBOARD_BAR_HEIGHT + STICKY_ADD_KEYBOARD_GAP - screen.bottom),
      },
    ],
  }));

  const form = useForm<EditCardsForm>({
    resolver: zodResolver(editCardsSchema),
    defaultValues: { flashcards: [] },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    shouldFocusError: false,
  });
  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { isSubmitting },
  } = form;

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
  } = useKeyboardCardLift({
    bottomInset: STICKY_ADD_HEIGHT + STICKY_ADD_KEYBOARD_GAP,
  });
  const termRefs = useRef<(TextInput | null)[]>([]);
  const definitionRefs = useRef<(TextInput | null)[]>([]);
  const focusAppendedRef = useRef(false);

  useEffect(() => {
    if (!focusAppendedRef.current) return;
    focusAppendedRef.current = false;
    termRefs.current[fields.length - 1]?.focus();
  }, [fields.length]);

  const addCard = () => {
    focusAppendedRef.current = true;
    append(newCard());
  };

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await protectedFetch(
          `${API_BASE_URL}/flashcards/module/${id}`,
        );
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const cards = (await res.json()) as Flashcard[];
        reset({
          flashcards: cards.map((c) => ({
            id: c.id,
            term: c.term,
            definition: c.definition,
          })),
        });
      } catch (err) {
        console.error("[ModuleCardsEdit] load error:", err);
        setToast("Couldn't load the cards");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, reset]);

  const focusTerm = (index: number) => termRefs.current[index]?.focus();
  const focusDefinition = (index: number) =>
    definitionRefs.current[index]?.focus();

  const handleRemove = (index: number) => {
    const card = getValues(`flashcards.${index}`);
    if (!card.isNew) {
      setRemovedIds((prev) => [...prev, card.id]);
    }
    remove(index);
  };

  const onSubmit = async (data: EditCardsForm) => {
    const isEmpty = (card: { term: string; definition: string }) =>
      !card.term && !card.definition;
    const keptCards = data.flashcards.filter((c) => !isEmpty(c));
    const emptiedExistingIds = data.flashcards
      .filter((c) => !c.isNew && isEmpty(c))
      .map((c) => c.id);
    const idsToDelete = [...removedIds, ...emptiedExistingIds];

    const ensureOk = (res: Response) => {
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      return res;
    };

    try {
      await Promise.all([
        ...idsToDelete.map((cardId) =>
          protectedFetch(`${API_BASE_URL}/flashcards/${cardId}`, {
            method: "DELETE",
          }).then(ensureOk),
        ),
        ...keptCards
          .filter((c) => !c.isNew)
          .map((c) =>
            protectedFetch(`${API_BASE_URL}/flashcards/${c.id}`, {
              method: "PATCH",
              body: JSON.stringify({
                term: c.term,
                definition: c.definition,
              }),
            }).then(ensureOk),
          ),
        ...keptCards
          .filter((c) => c.isNew)
          .map((c) =>
            protectedFetch(`${API_BASE_URL}/flashcards`, {
              method: "POST",
              body: JSON.stringify({
                term: c.term,
                definition: c.definition,
                moduleId: id,
              }),
            }).then(ensureOk),
          ),
      ]);
      router.back();
    } catch (err) {
      console.error("[ModuleCardsEdit] save error:", err);
      setToast("Couldn't save the cards. Try again");
    }
  };

  return (
    <FormProvider {...form}>
      <YStack f={1} bg="$background">
        <BackgroundMesh preset="formBright" />

        <View
          style={{ flex: 1 }}
          onLayout={(e) => {
            setViewportHeight(e.nativeEvent.layout.height);
            onViewportLayout(e);
          }}
        >
          <KeyboardAwareScrollView
            ref={scrollRef}
            innerViewRef={scrollInnerRef}
            enabled={false}
            style={{ flex: 1 }}
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "none"}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{
              paddingTop: screen.top,
              paddingBottom:
                screen.bottom + (stickyAdd ? STICKY_ADD_CLEARANCE : 24),
            }}
          >
            <YStack
              px="$screenX"
              onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
            >
              <ModalFormHeader
                title="Edit cards"
                saveVariant="primary"
                onClose={() => router.back()}
                saveEnabled={!loading}
                saveLoading={isSubmitting}
                onSave={() =>
                  handleSubmit(onSubmit, (errors) =>
                    setToast(
                      errors.flashcards?.root?.message ??
                        (errors.flashcards as { message?: string } | undefined)
                          ?.message ??
                        null,
                    ),
                  )()
                }
              />

              <XStack ai="center" jc="space-between" mb={10} pr={10} pl={6}>
                <Text fontSize={16} fontWeight="600" color="$color">
                  Cards
                </Text>
                {!loading && (
                  <Text fontSize={14.5} color="$textMuted">
                    {fields.length}
                  </Text>
                )}
              </XStack>

              {loading ? (
                <YStack gap={10}>
                  <Skeleton height={140} borderRadius="$cardSoft" />
                  <Skeleton height={140} borderRadius="$cardSoft" />
                  <Skeleton height={140} borderRadius="$cardSoft" />
                </YStack>
              ) : (
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
                        else addCard();
                      }}
                    />
                  ))}
                </YStack>
              )}
            </YStack>
            {!loading && !stickyAdd && (
              <YStack ai="center" mt={18}>
                <AddPill label="Add card" onPress={addCard} />
              </YStack>
            )}
            <Animated.View style={spacerStyle} />
          </KeyboardAwareScrollView>
        </View>

        <StatusBarScrim />

        {!loading && stickyAdd && (
          <Animated.View
            pointerEvents="box-none"
            style={[
              {
                position: "absolute",
                left: 0,
                right: 0,
                bottom: screen.bottom,
                alignItems: "center",
              },
              stickyAddStyle,
            ]}
          >
            <AddPill label="Add card" onPress={addCard} />
          </Animated.View>
        )}

        <KeyboardBar />

        <AppToast
          placement="top"
          open={!!toast}
          message={toast ?? ""}
          onDismiss={() => setToast(null)}
          size="lg"
        />
      </YStack>
    </FormProvider>
  );
}
