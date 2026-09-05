import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import { ModalFormHeader } from "@/src/components/common/ModalFormHeader";
import { CardEditor } from "@/src/components/flashcards/CardEditor";
import { SortableCardList } from "@/src/components/flashcards/SortableCardList";
import { AddPill } from "@/src/components/ui/AddPill";
import { AppButton } from "@/src/components/ui/Button";
import { FieldGroup } from "@/src/components/ui/FieldGroup";
import {
  KEYBOARD_BAR_HEIGHT,
  KeyboardBar,
} from "@/src/components/ui/KeyboardBar";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { AppSheet, SheetRow, SheetRows } from "@/src/components/ui/Sheet";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { AppToast } from "@/src/components/ui/Toast";
import { Toggle } from "@/src/components/ui/Toggle";
import { useKeyboardCardLift } from "@/src/hooks/useKeyboardCardLift";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { useServerError } from "@/src/hooks/useServerError";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { ModuleForm, moduleSchema } from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  router,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import { Folder, Globe } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { Platform, TextInput, View } from "react-native";
import {
  KeyboardAwareScrollView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";

type FolderOption = { id: string; name: string };

const STICKY_ADD_HEIGHT = 46;
const STICKY_ADD_KEYBOARD_GAP = 10;
const STICKY_ADD_CLEARANCE = STICKY_ADD_HEIGHT + 20;

export default function ModuleCreate() {
  const screen = useScreenInsets();
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
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [discardCardCount, setDiscardCardCount] = useState(0);
  const navigation = useNavigation();
  const allowLeaveRef = useRef(false);
  const pendingLeaveActionRef = useRef<Readonly<{ type: string }> | null>(
    null,
  );
  const { returnFolderId } = useLocalSearchParams<{
    returnFolderId?: string;
  }>();

  const form = useForm<ModuleForm>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: "",
      description: "",
      folderId: returnFolderId,
      isPublic: false,
      flashcards: [
        { term: "", definition: "" },
        { term: "", definition: "" },
      ],
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = form;
  const [serverError, setServerError] = useServerError(form);

  const name = useWatch({ control, name: "name" });
  const folderId = useWatch({ control, name: "folderId" });
  const isPublic = useWatch({ control, name: "isPublic" });

  const flashcardsError =
    errors.flashcards?.root?.message ??
    (errors.flashcards as { message?: string } | undefined)?.message;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "flashcards",
  });

  const {
    scrollRef,
    scrollInnerRef,
    onViewportLayout,
    spacerStyle,
    liftCard,
    releaseCard,
  } = useKeyboardCardLift({
    bottomInset: STICKY_ADD_HEIGHT + STICKY_ADD_KEYBOARD_GAP,
  });

  const termRefs = useRef<(TextInput | null)[]>([]);
  const definitionRefs = useRef<(TextInput | null)[]>([]);
  const prevFieldsLength = useRef(fields.length);

  useEffect(() => {
    if (fields.length > prevFieldsLength.current) {
      termRefs.current[fields.length - 1]?.focus();
    }
    prevFieldsLength.current = fields.length;
  }, [fields.length]);

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const res = await protectedFetch(`${API_BASE_URL}/folders?limit=50`);
        if (!res.ok) return;
        const page = await res.json();
        setFolders(
          (page.data ?? []).map((f: FolderOption) => ({
            id: f.id,
            name: f.name,
          })),
        );
      } catch (err) {
        console.error("[ModuleCreate] folders error:", err);
      }
    };
    loadFolders();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (allowLeaveRef.current) return;
      const data = form.getValues();
      const filledCards = data.flashcards.filter(
        (card) => card.term.trim() || card.definition.trim(),
      ).length;
      const hasChanges =
        !!data.name?.trim() || !!data.description?.trim() || filledCards > 0;
      if (!hasChanges) return;

      e.preventDefault();
      setDiscardCardCount(filledCards);
      pendingLeaveActionRef.current = e.data.action;
      setDiscardOpen(true);
    });
    return unsubscribe;
  }, [navigation, form]);

  const confirmDiscard = () => {
    allowLeaveRef.current = true;
    setDiscardOpen(false);
    if (pendingLeaveActionRef.current) {
      navigation.dispatch(pendingLeaveActionRef.current);
    } else {
      router.back();
    }
  };

  const focusTerm = (index: number) => termRefs.current[index]?.focus();
  const focusDefinition = (index: number) =>
    definitionRefs.current[index]?.focus();

  const selectedFolder = folders.find((f) => f.id === folderId);

  const onSubmit = async (data: ModuleForm) => {
    setServerError(null);
    try {
      const response = await protectedFetch(`${API_BASE_URL}/modules`, {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          isPublic: data.isPublic,
          folderId: data.folderId,
          flashcards: data.flashcards.filter(
            (card) => card.term || card.definition,
          ),
        }),
      });
      if (!response.ok) throw new Error("Failed to create module");
      const newModule = await response.json();

      allowLeaveRef.current = true;
      if (returnFolderId) router.back();
      else
        router.replace({
          pathname: "/module/[id]",
          params: { id: newModule.id },
        });
    } catch (error) {
      console.error(error);
      setServerError("Failed to create module. Please try again");
    }
  };

  return (
    <FormProvider {...form}>
      <YStack f={1} bg="$background">
        <BackgroundMesh preset="formBright" />

        <View style={{ flex: 1 }} onLayout={onViewportLayout}>
          <KeyboardAwareScrollView
            ref={scrollRef}
            innerViewRef={scrollInnerRef}
            enabled={false}
            style={{ flex: 1 }}
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "none"}
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{
              paddingTop: screen.top,
              paddingBottom: screen.bottom + STICKY_ADD_CLEARANCE,
            }}
          >
            <YStack px="$screenX">
              <ModalFormHeader
                title="New module"
                onClose={() => router.back()}
                saveEnabled={!!name?.trim()}
                saveLoading={isSubmitting}
                onSave={() => handleSubmit(onSubmit)()}
              />

              <YStack mb={14}>
                <FieldGroup>
                  <FormInput
                    control={control}
                    name="name"
                    variant="plain"
                    placeholder="Module name"
                    onFocus={releaseCard}
                    maxLength={60}
                    showCounter
                    hideError
                  />
                  <FormInput
                    control={control}
                    name="description"
                    variant="plain"
                    placeholder="Description (optional)"
                    onFocus={releaseCard}
                    maxLength={300}
                    multiline
                    hideError
                  />
                </FieldGroup>
                {errors.name && (
                  <Text color="$dangerText" fontSize={11.5} mt={8} ml={4}>
                    {errors.name.message}
                  </Text>
                )}
              </YStack>

              <YStack mb={22}>
                <SheetRows tone="surface">
                  <SheetRow
                    icon={Folder}
                    label="Folder"
                    hint={selectedFolder?.name ?? "None"}
                    chevron
                    onPress={() => setFolderSheetOpen(true)}
                  />
                  <SheetRow
                    icon={Globe}
                    label="Public"
                    right={
                      <Toggle
                        value={!!isPublic}
                        onToggle={() => setValue("isPublic", !isPublic)}
                        size="md"
                        accessibilityLabel="Public module"
                      />
                    }
                  />
                </SheetRows>
              </YStack>

              <XStack ai="center" jc="space-between" mb={6}>
                <Text fontSize={16} fontWeight="700" color="$color">
                  Cards
                </Text>
                <Text fontSize={12.5} color="$textMuted">
                  {fields.length}
                </Text>
              </XStack>

              <SortableCardList
                ids={fields.map((field) => field.id)}
                onMove={move}
                renderItem={({ index, dragGesture, dragging }) => (
                  <CardEditor
                    control={control}
                    termName={`flashcards.${index}.term`}
                    definitionName={`flashcards.${index}.definition`}
                    index={index}
                    onRemove={remove}
                    canRemove={fields.length > 2}
                    dragGesture={dragGesture}
                    dragging={dragging}
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
                      else append({ term: "", definition: "" });
                    }}
                  />
                )}
              />

              {flashcardsError && (
                <Text color="$dangerText" fontSize={11.5} mt={8}>
                  {flashcardsError}
                </Text>
              )}
            </YStack>
            <Animated.View style={spacerStyle} />
          </KeyboardAwareScrollView>
        </View>

        <StatusBarScrim />

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
          <AddPill
            label="Add card"
            onPress={() => append({ term: "", definition: "" })}
          />
        </Animated.View>

        <KeyboardBar />

        <AppToast
          open={!!serverError}
          message={serverError ?? ""}
          onDismiss={() => setServerError(null)}
        />

        <AppSheet
          open={folderSheetOpen}
          onOpenChange={setFolderSheetOpen}
          title="Folder"
        >
          <SheetRows>
            <SheetRow
              icon={Folder}
              label="No folder"
              selected={!folderId}
              onPress={() => {
                setValue("folderId", undefined);
                setFolderSheetOpen(false);
              }}
            />
            {folders.map((folder) => (
              <SheetRow
                key={folder.id}
                icon={Folder}
                label={folder.name}
                selected={folderId === folder.id}
                onPress={() => {
                  setValue("folderId", folder.id);
                  setFolderSheetOpen(false);
                }}
              />
            ))}
          </SheetRows>
        </AppSheet>

        <AppSheet
          open={discardOpen}
          onOpenChange={(open) => {
            if (!open) setDiscardOpen(false);
          }}
          title={
            discardCardCount > 0
              ? `Discard ${discardCardCount} card${discardCardCount !== 1 ? "s" : ""}?`
              : "Discard this module?"
          }
          subtitle="This can't be undone."
          blur="strong"
        >
          <YStack gap={10}>
            <AppButton variant="danger" onPress={confirmDiscard}>
              Discard
            </AppButton>
            <AppButton
              variant="ghost"
              onPress={() => setDiscardOpen(false)}
            >
              Keep editing
            </AppButton>
          </YStack>
        </AppSheet>
      </YStack>
    </FormProvider>
  );
}
