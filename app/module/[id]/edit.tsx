import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import { ModalFormHeader } from "@/src/components/common/ModalFormHeader";
import { FieldGroup } from "@/src/components/ui/FieldGroup";
import { PickRow } from "@/src/components/ui/PickRow";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { AppSheet, SheetRow, SheetRows } from "@/src/components/ui/Sheet";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { AppToast } from "@/src/components/ui/Toast";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { protectedFetch } from "@/src/utils/protectedFetch";
import {
  ModuleDetailsForm,
  moduleDetailsSchema,
} from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Folder } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { YStack } from "tamagui";

type FolderOption = { id: string; name: string };

export default function ModuleEditScreen() {
  const screen = useScreenInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<FolderOption[]>([]);
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
  const folderId = useWatch({ control, name: "folderId" });
  const selectedFolder = folders.find((f) => f.id === folderId);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [moduleRes, foldersRes] = await Promise.all([
          protectedFetch(`${API_BASE_URL}/modules/${id}`),
          protectedFetch(`${API_BASE_URL}/folders?limit=50`),
        ]);
        if (!moduleRes.ok) throw new Error(`Error: ${moduleRes.status}`);
        const raw = await moduleRes.json();
        reset({
          name: raw.name ?? "",
          description: raw.description ?? "",
          folderId: raw.folders?.[0]?.id,
        });
        if (foldersRes.ok) {
          const page = await foldersRes.json();
          setFolders(
            (page.data ?? []).map((f: FolderOption) => ({
              id: f.id,
              name: f.name,
            })),
          );
        }
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
        <BackgroundMesh preset="formBright" />

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
                  <FieldGroup>
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
                  </FieldGroup>
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
