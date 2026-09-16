import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import { ModalFormHeader } from "@/src/components/common/ModalFormHeader";
import { PickRow } from "@/src/components/ui/PickRow";
import { Rows } from "@/src/components/ui/Rows";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { AppSheet, SheetRow, SheetRows } from "@/src/components/ui/Sheet";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { AppToast } from "@/src/components/ui/Toast";
import { usePaginatedCursorList } from "@/src/hooks/usePaginatedCursorList";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { protectedFetch } from "@/src/utils/protectedFetch";
import {
  ModuleDetailsForm,
  moduleDetailsSchema,
} from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronDown, Folder } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { YStack } from "tamagui";

type FolderOption = { id: string; name: string };

export default function ModuleEditScreen() {
  const screen = useScreenInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const form = useForm<ModuleDetailsForm>({
    resolver: zodResolver(moduleDetailsSchema),
    defaultValues: { name: "", description: "", folderId: undefined },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    shouldFocusError: false,
  });
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = form;
  const fetchFoldersPage = useCallback(async (cursor: string | null) => {
    const params = new URLSearchParams({ limit: "30" });
    if (cursor) params.set("cursor", cursor);
    const res = await protectedFetch(
      `${API_BASE_URL}/folders?${params.toString()}`,
    );
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    const page = await res.json();
    return {
      data: (page.data ?? []).map((f: FolderOption) => ({
        id: f.id,
        name: f.name,
      })),
      nextCursor: page.nextCursor,
    };
  }, []);

  const foldersList = usePaginatedCursorList<FolderOption>(
    fetchFoldersPage,
    "folders",
  );

  const folderId = useWatch({ control, name: "folderId" });
  const selectedFolder = foldersList.items.find((f) => f.id === folderId);

  useEffect(() => {
    if (foldersList.error) setToast("Couldn't load folders");
  }, [foldersList.error]);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const res = await protectedFetch(`${API_BASE_URL}/modules/${id}`);
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const raw = await res.json();
        reset({
          name: raw.name ?? "",
          description: raw.description ?? "",
          folderId: raw.folders?.[0]?.id,
        });
      } catch (err) {
        console.error("[ModuleEdit] load error:", err);
        setToast("Couldn't load the module");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, reset]);

  const onSubmit = async (data: ModuleDetailsForm) => {
    try {
      const res = await protectedFetch(`${API_BASE_URL}/modules/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          folderId: data.folderId ?? null,
        }),
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      router.back();
    } catch (err) {
      console.error("[ModuleEdit] save error:", err);
      setToast("Couldn't save the module. Try again");
    }
  };

  return (
    <FormProvider {...form}>
      <YStack f={1} bg="$background">
        <BackgroundMesh preset="auroraDrift" />
        {/* <BackgroundMesh preset="auroraTeal" /> */}

        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "none"}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{
            paddingTop: screen.top,
            paddingBottom: screen.bottom + 24,
          }}
        >
          <YStack px="$screenX">
            <ModalFormHeader
              title="Edit module"
              saveVariant="primary"
              onClose={() => router.back()}
              saveEnabled={!loading}
              saveLoading={isSubmitting}
              onSave={() =>
                handleSubmit(onSubmit, (errors) =>
                  setToast(errors.name?.message ?? null),
                )()
              }
            />

            {loading ? (
              <YStack gap={16}>
                <Skeleton height={118} borderRadius={20} />
                <Skeleton height={52} borderRadius={16} />
              </YStack>
            ) : (
              <>
                <YStack mb={14}>
                  <Rows variant="well">
                    <FormInput
                      control={control}
                      name="name"
                      variant="plain"
                      placeholder="Module name"
                      maxLength={60}
                      showCounter
                      hideError
                    />
                    <FormInput
                      control={control}
                      name="description"
                      variant="plain"
                      placeholder="Description (optional)"
                      maxLength={300}
                      multiline
                      hideError
                    />
                  </Rows>
                </YStack>

                <PickRow
                  icon={Folder}
                  value={selectedFolder?.name}
                  placeholder="Folder"
                  onPress={() => setFolderSheetOpen(true)}
                />
              </>
            )}
          </YStack>
        </KeyboardAwareScrollView>

        <StatusBarScrim />

        <AppToast
          placement="top"
          open={!!toast}
          message={toast ?? ""}
          onDismiss={() => setToast(null)}
          size="lg"
        />

        <AppSheet
          open={folderSheetOpen}
          onOpenChange={setFolderSheetOpen}
          title="Folder"
        >
          <SheetRows tone="surface">
            <SheetRow
              icon={Folder}
              label="No folder"
              selected={!folderId}
              onPress={() => {
                setValue("folderId", undefined);
                setFolderSheetOpen(false);
              }}
            />
            {foldersList.items.map((folder) => (
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
            {foldersList.hasMore && (
              <SheetRow
                icon={ChevronDown}
                label={foldersList.loading ? "Loading…" : "Load more folders"}
                disabled={foldersList.loading}
                onPress={foldersList.loadMore}
              />
            )}
          </SheetRows>
        </AppSheet>
      </YStack>
    </FormProvider>
  );
}
