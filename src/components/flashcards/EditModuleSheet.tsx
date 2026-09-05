import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import { AppButton } from "@/src/components/ui/Button";
import { FieldLabel } from "@/src/components/ui/FieldLabel";
import { PickRow } from "@/src/components/ui/PickRow";
import {
  AppSheet,
  SheetCrossfade,
  SheetRow,
  SheetRows,
} from "@/src/components/ui/Sheet";
import { Module } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import {
  ModuleDetailsForm,
  moduleDetailsSchema,
} from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { Folder } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Text, XStack, YStack } from "tamagui";

type FolderOption = { id: string; name: string };
type SheetView = "form" | "folder";

interface EditModuleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: Module;
  onSaved: (module: Module) => void;
}

export function EditModuleSheet({
  open,
  onOpenChange,
  module,
  onSaved,
}: EditModuleSheetProps) {
  const [view, setView] = useState<SheetView>("form");
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ModuleDetailsForm>({
    resolver: zodResolver(moduleDetailsSchema),
    defaultValues: {
      name: module.name,
      description: module.description ?? "",
      folderId: module.folderIds?.[0],
    },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { isSubmitting },
  } = form;
  const folderId = useWatch({ control, name: "folderId" });

  useEffect(() => {
    if (!open) return;
    reset({
      name: module.name,
      description: module.description ?? "",
      folderId: module.folderIds?.[0],
    });
    setView("form");
    setServerError(null);
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
        console.error("[EditModuleSheet] folders error:", err);
      }
    };
    loadFolders();
  }, [open, module, reset]);

  const selectedFolder = folders.find((f) => f.id === folderId);

  const onSubmit = async (data: ModuleDetailsForm) => {
    setServerError(null);
    try {
      const res = await protectedFetch(`${API_BASE_URL}/modules/${module.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          folderId: data.folderId ?? null,
        }),
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const updated = await res.json();
      onSaved({
        ...module,
        name: updated.name ?? data.name,
        description: updated.description ?? data.description,
        updatedAt: updated.updatedAt ?? module.updatedAt,
        folderIds: data.folderId ? [data.folderId] : [],
      });
      onOpenChange(false);
    } catch (err) {
      console.error("[EditModuleSheet] save error:", err);
      setServerError("Couldn't save the module. Try again");
    }
  };

  return (
    <FormProvider {...form}>
      <AppSheet
        open={open}
        onOpenChange={onOpenChange}
        title={view === "form" ? "Edit module" : "Folder"}
        blur="strong"
      >
        <SheetCrossfade activeKey={view}>
          {view === "form" ? (
            <YStack>
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

              <YStack mb={22}>
                <FieldLabel label="Folder" hint="optional" />
                <PickRow
                  icon={Folder}
                  value={selectedFolder?.name}
                  placeholder="No folder"
                  onPress={() => setView("folder")}
                />
              </YStack>

              {serverError && (
                <Text
                  color="$dangerText"
                  fontSize={12.5}
                  textAlign="center"
                  mb={12}
                >
                  {serverError}
                </Text>
              )}

              <XStack gap={10}>
                <YStack f={1}>
                  <AppButton
                    variant="secondary"
                    onPress={() => onOpenChange(false)}
                  >
                    Cancel
                  </AppButton>
                </YStack>
                <YStack f={1.4}>
                  <AppButton
                    variant="primary"
                    loading={isSubmitting}
                    onPress={() => handleSubmit(onSubmit)()}
                  >
                    Save
                  </AppButton>
                </YStack>
              </XStack>
            </YStack>
          ) : (
            <SheetRows>
              <SheetRow
                icon={Folder}
                label="No folder"
                selected={!folderId}
                onPress={() => {
                  setValue("folderId", undefined);
                  setView("form");
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
                    setView("form");
                  }}
                />
              ))}
            </SheetRows>
          )}
        </SheetCrossfade>
      </AppSheet>
    </FormProvider>
  );
}
