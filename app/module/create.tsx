import { API_BASE_URL } from "@/src/api/config";
import { CardEditor } from "@/src/components/flashcards/CardEditor";
import { SortableCardList } from "@/src/components/flashcards/SortableCardList";
import { FormInput } from "@/src/components/common/FormInput";
import { SegmentedControl } from "@/src/components/common/SegmentedControl";
import { AddPill } from "@/src/components/ui/AddPill";
import { FieldLabel } from "@/src/components/ui/FieldLabel";
import { IconButton } from "@/src/components/ui/IconButton";
import { PickRow } from "@/src/components/ui/PickRow";
import { SavePill } from "@/src/components/ui/SavePill";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { AppSheet, SheetRow, SheetRows } from "@/src/components/ui/Sheet";
import { AppToast } from "@/src/components/ui/Toast";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { ModuleForm, moduleSchema } from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { Folder, Globe, Lock, X } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm, useWatch } from "react-hook-form";
import type { TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { Text, XStack, YStack } from "tamagui";

type FolderOption = { id: string; name: string };

const VISIBILITY_ICONS = [Lock, Globe];

export default function ModuleCreate() {
  const screen = useScreenInsets();
  const [serverError, setServerError] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);
  const { returnFolderId } = useLocalSearchParams<{ returnFolderId?: string }>();

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
          (page.data ?? []).map((f: FolderOption) => ({ id: f.id, name: f.name })),
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
        <BackgroundMesh preset="form" />

        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          bottomOffset={40}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: screen.top,
            paddingBottom: screen.bottom + 16,
          }}
        >
          <YStack px="$screenX">
            <XStack ai="center" gap={10} mb={18}>
              <IconButton
                variant="liquidGlass"
                icon={<X size={22} color="#EAF7FF" strokeWidth={1.9} />}
                onPress={() => router.back()}
                accessibilityLabel="Close"
              />
              <Text f={1} fontSize={19} fontWeight="800" color="$color">
                New module
              </Text>
              <SavePill
                enabled={!!name?.trim()}
                loading={isSubmitting}
                onPress={() => handleSubmit(onSubmit)()}
              />
            </XStack>

            <YStack mb={18}>
              <FieldLabel label="Name" />
              <FormInput
                control={control}
                name="name"
                placeholder="Untitled module"
                maxLength={60}
                showCounter
              />
            </YStack>

            <YStack mb={18}>
              <FieldLabel label="Description" hint="optional" />
              <FormInput
                control={control}
                name="description"
                placeholder="What is this module about?"
                maxLength={300}
                multiline
              />
            </YStack>

            <YStack mb={18}>
              <FieldLabel label="Folder" hint="optional" />
              <PickRow
                icon={Folder}
                value={selectedFolder?.name}
                placeholder="No folder"
                onPress={() => setFolderSheetOpen(true)}
              />
            </YStack>

            <YStack mb={18}>
              <FieldLabel label="Visibility" />
              <SegmentedControl
                options={["Private", "Public"]}
                selected={isPublic ? 1 : 0}
                onChange={(index) => setValue("isPublic", index === 1)}
                renderIcon={(index, active) => {
                  const Icon = VISIBILITY_ICONS[index];
                  return (
                    <Icon
                      size={16}
                      strokeWidth={1.9}
                      color={active ? "#0D1117" : "#8FA8B8"}
                    />
                  );
                }}
              />
            </YStack>

            <XStack ai="center" jc="space-between" mt={4} mb={11}>
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
              <Text color="#FCA5A5" fontSize={11.5} mt={8}>
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
        </KeyboardAwareScrollView>

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
