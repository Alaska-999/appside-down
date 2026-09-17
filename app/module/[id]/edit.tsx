import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import { ModalFormHeader } from "@/src/components/common/ModalFormHeader";
import {
  KEYBOARD_BAR_HEIGHT,
  KeyboardBar,
} from "@/src/components/ui/overlays/KeyboardBar";
import { PickRow } from "@/src/components/ui/display/PickRow";
import { Rows } from "@/src/components/ui/display/Rows";
import { BackgroundMesh } from "@/src/components/ui/background/ScreenBackground";
import { Skeleton } from "@/src/components/ui/feedback/Skeleton";
import { StatusBarScrim } from "@/src/components/ui/background/StatusBarScrim";
import { AppToast } from "@/src/components/ui/feedback/Toast";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { useFolderSelectionStore } from "@/src/store/useFolderSelectionStore";
import { protectedFetch } from "@/src/utils/protectedFetch";
import {
  ModuleDetailsForm,
  moduleDetailsSchema,
} from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { Folder } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { YStack } from "tamagui";

export default function ModuleEditScreen() {
  const screen = useScreenInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [folderName, setFolderName] = useState<string | undefined>(undefined);

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

  useFocusEffect(
    useCallback(() => {
      const result = useFolderSelectionStore.getState().consumeResult();
      if (!result) return;
      setValue("folderId", result.folderId);
      setFolderName(result.folderName);
    }, [setValue]),
  );

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
        setFolderName(raw.folders?.[0]?.name);
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

        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          bottomOffset={KEYBOARD_BAR_HEIGHT}
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
                  value={folderName}
                  placeholder="Folder"
                  onPress={() =>
                    router.push({
                      pathname: "/folder/pick",
                      params: folderId ? { currentFolderId: folderId } : {},
                    })
                  }
                />
              </>
            )}
          </YStack>
        </KeyboardAwareScrollView>

        <StatusBarScrim />

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
