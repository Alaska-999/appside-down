import { API_BASE_URL } from "@/src/api/config";
import { FolderCover } from "@/src/components/common/FolderCover";
import { FormInput } from "@/src/components/common/FormInput";
import { ModalFormHeader } from "@/src/components/common/ModalFormHeader";
import { TagEditor } from "@/src/components/common/TagEditor";
import { AppButton } from "@/src/components/ui/Button";
import { FieldLabel } from "@/src/components/ui/FieldLabel";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { AppSheet } from "@/src/components/ui/Sheet";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { AppToast } from "@/src/components/ui/Toast";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { FolderForm, folderSchema } from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useNavigation } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Text, YStack } from "tamagui";

export default function FolderCreate() {
  const screen = useScreenInsets();
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const navigation = useNavigation();
  const allowLeaveRef = useRef(false);
  const pendingLeaveActionRef = useRef<Readonly<{ type: string }> | null>(null);

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

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (allowLeaveRef.current) return;
      const hasChanges =
        !!form.getValues("name")?.trim() || tags.length > 0 || !!coverUri;
      if (!hasChanges) return;

      e.preventDefault();
      pendingLeaveActionRef.current = e.data.action;
      setDiscardOpen(true);
    });
    return unsubscribe;
  }, [navigation, form, tags, coverUri]);

  const confirmDiscard = () => {
    allowLeaveRef.current = true;
    setDiscardOpen(false);
    if (pendingLeaveActionRef.current) {
      navigation.dispatch(pendingLeaveActionRef.current);
    } else {
      router.back();
    }
  };

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
      allowLeaveRef.current = true;
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

            <YStack ai="center" pt={14} pb={24}>
              <FolderCover imageUri={coverUri} onChange={setCoverUri} />
            </YStack>

            <YStack gap={18}>
              <YStack>
                <FieldLabel label="Name" />
                <FormInput
                  control={control}
                  name="name"
                  placeholder="Untitled folder"
                  maxLength={40}
                  showCounter
                  autoFocus
                />
              </YStack>

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

        <AppSheet
          open={discardOpen}
          onOpenChange={(open) => {
            if (!open) setDiscardOpen(false);
          }}
          title="Discard this folder?"
          subtitle="This can't be undone."
        >
          <YStack gap={10}>
            <AppButton variant="danger" onPress={confirmDiscard}>
              Discard
            </AppButton>
            <AppButton variant="ghost" onPress={() => setDiscardOpen(false)}>
              Keep editing
            </AppButton>
          </YStack>
        </AppSheet>
      </YStack>
    </FormProvider>
  );
}
