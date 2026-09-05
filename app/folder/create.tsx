import { API_BASE_URL } from "@/src/api/config";
import { FolderCover } from "@/src/components/common/FolderCover";
import { FormInput } from "@/src/components/common/FormInput";
import { ModalFormHeader } from "@/src/components/common/ModalFormHeader";
import { TagEditor } from "@/src/components/common/TagEditor";
import { FieldLabel } from "@/src/components/ui/FieldLabel";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { AppToast } from "@/src/components/ui/Toast";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { FolderForm, folderSchema } from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Text, XStack, YStack } from "tamagui";

export default function FolderCreate() {
  const screen = useScreenInsets();
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FolderForm>({
    resolver: zodResolver(folderSchema),
    defaultValues: { name: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;
  const name = useWatch({ control, name: "name" });

  const onSubmit = async (data: FolderForm) => {
    setServerError(null);
    try {
      const response = await protectedFetch(`${API_BASE_URL}/folders`, {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          icon: coverUri ?? "",
          tags,
        }),
      });
      if (!response.ok) throw new Error("Failed to create folder");
      const folder = await response.json();
      router.replace({ pathname: "/folder/[id]", params: { id: folder.id } });
    } catch (error) {
      console.error(error);
      setServerError("Couldn't create the folder. Try again");
    }
  };

  return (
    <FormProvider {...form}>
      <YStack f={1} bg="$background">
        <BackgroundMesh preset="form" />

        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          bottomOffset={70}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: screen.top,
            paddingBottom: screen.bottom + 16,
          }}
        >
          <YStack px="$screenX">
            <ModalFormHeader
              title="New folder"
              onClose={() => router.back()}
              saveEnabled={!!name?.trim()}
              saveLoading={isSubmitting}
              onSave={() => handleSubmit(onSubmit)()}
            />

            <YStack gap={22}>
              <XStack ai="center" gap={14}>
                <FolderCover imageUri={coverUri} onChange={setCoverUri} />
                <YStack f={1}>
                  <FormInput
                    control={control}
                    name="name"
                    placeholder="Folder name"
                    inputSize="lg"
                    textRole="title"
                    maxLength={40}
                    showCounter
                    autoFocus
                  />
                </YStack>
              </XStack>

              <YStack>
                <FieldLabel label="Tags" hint="optional" />
                <TagEditor
                  mode="draft"
                  tags={tags.map((tag) => ({ id: tag, name: tag }))}
                  onAdd={(name) => setTags((prev) => [...prev, name])}
                  onRemove={(tag) =>
                    setTags((prev) => prev.filter((t) => t !== tag.name))
                  }
                />
                <Text fontSize={11.5} color="$mutedDim" mt={8} ml={4}>
                  Tags work as subfolders inside this folder
                </Text>
              </YStack>
            </YStack>
          </YStack>
        </KeyboardAwareScrollView>

        <StatusBarScrim />

        <AppToast
          open={!!serverError}
          message={serverError ?? ""}
          onDismiss={() => setServerError(null)}
        />
      </YStack>
    </FormProvider>
  );
}
