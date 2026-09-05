import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import { CardEditor } from "@/src/components/flashcards/CardEditor";
import { SortableCardList } from "@/src/components/flashcards/SortableCardList";
import { AddPill } from "@/src/components/ui/AddPill";
import { FieldGroup } from "@/src/components/ui/FieldGroup";
import { IconButton } from "@/src/components/ui/IconButton";
import { KeyboardBar } from "@/src/components/ui/KeyboardBar";
import { SavePill } from "@/src/components/ui/SavePill";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { AppSheet, SheetRow, SheetRows } from "@/src/components/ui/Sheet";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { AppToast } from "@/src/components/ui/Toast";
import { Toggle } from "@/src/components/ui/Toggle";
import { useKeyboardCardLift } from "@/src/hooks/useKeyboardCardLift";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { ModuleForm, moduleSchema } from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Folder, Globe, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import { Platform, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";

type FolderOption = { id: string; name: string };

export default function ModuleCreate() {
  const screen = useScreenInsets();
  const [serverError, setServerError] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);
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
  } = useKeyboardCardLift();

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
    const subscription = form.watch(() => setServerError(null));
    return () => subscription.unsubscribe();
  }, [form]);

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

        <View
          style={{ flex: 1 }}
          onLayout={onViewportLayout}
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
              paddingBottom: screen.bottom,
            }}
          >
            <YStack px="$screenX">
              <XStack ai="center" gap={14} mb={18}>
                <IconButton
                  variant="liquidGlass"
                  icon={<X size={22} color="#EAF7FF" strokeWidth={1.9} />}
                  onPress={() => router.back()}
                  accessibilityLabel="Close"
                />
                <Text f={1} fontSize={20} fontWeight="800" color="$color">
                  New module
                </Text>
                <SavePill
                  enabled={!!name?.trim()}
                  loading={isSubmitting}
                  onPress={() => handleSubmit(onSubmit)()}
                />
              </XStack>

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
                <SheetRows>
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
                        onChange={(next) => setValue("isPublic", next)}
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
                <Text fontSize={12.5} color="#8FA8B8">
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

              <YStack mt={16}>
                <AddPill
                  label="Add card"
                  onPress={() => append({ term: "", definition: "" })}
                />
              </YStack>
            </YStack>
            <Animated.View style={spacerStyle} />
          </KeyboardAwareScrollView>
        </View>

        <StatusBarScrim />

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
      </YStack>
    </FormProvider>
  );
}
