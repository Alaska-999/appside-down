import { API_BASE_URL } from "@/src/api/config";
import { FolderCover } from "@/src/components/common/FolderCover";
import { FormInput } from "@/src/components/common/FormInput";
import { AppButton } from "@/src/components/ui/Button";
import { FieldLabel } from "@/src/components/ui/FieldLabel";
import { IconButton } from "@/src/components/ui/IconButton";
import { SavePill } from "@/src/components/ui/SavePill";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { AppSheet } from "@/src/components/ui/Sheet";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { TagChip } from "@/src/components/ui/TagChip";
import { AppToast } from "@/src/components/ui/Toast";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { FolderForm, folderSchema } from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { X } from "lucide-react-native";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Text, XStack, YStack } from "tamagui";

const TAG_MAX_LENGTH = 30;

export default function FolderCreate() {
  const screen = useScreenInsets();
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagSheetOpen, setTagSheetOpen] = useState(false);
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

  const tagForm = useForm<{ tag: string }>({ defaultValues: { tag: "" } });

  const closeTagSheet = (open: boolean) => {
    setTagSheetOpen(open);
    if (!open) tagForm.reset({ tag: "" });
  };

  const addTag = () => {
    const value = tagForm.getValues("tag").trim();
    if (!value) return;
    if (tags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      tagForm.setError("tag", { message: "This tag already exists" });
      return;
    }
    setTags((prev) => [...prev, value]);
    closeTagSheet(false);
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
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
            <XStack ai="center" gap={14} mb={18}>
              <IconButton
                variant="liquidGlass"
                icon={<X size={22} color="#EAF7FF" strokeWidth={1.9} />}
                onPress={() => router.back()}
                accessibilityLabel="Close"
              />
              <Text f={1} fontSize={20} fontWeight="800" color="$color">
                New folder
              </Text>
              <SavePill
                enabled={!!name?.trim()}
                loading={isSubmitting}
                onPress={() => handleSubmit(onSubmit)()}
              />
            </XStack>

            <YStack ai="center" pt={16} pb={26}>
              <FolderCover imageUri={coverUri} onChange={setCoverUri} />
            </YStack>

            <YStack mb={18}>
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

            <YStack mb={18}>
              <FieldLabel label="Tags" hint="optional" />
              <XStack gap={7} flexWrap="wrap">
                {tags.map((tag) => (
                  <TagChip
                    key={tag}
                    label={tag}
                    onRemove={() => removeTag(tag)}
                  />
                ))}
                <TagChip
                  label="Add tag"
                  variant="add"
                  onPress={() => setTagSheetOpen(true)}
                />
              </XStack>
            </YStack>
          </YStack>
        </KeyboardAwareScrollView>

        <StatusBarScrim />

        <AppSheet
          open={tagSheetOpen}
          onOpenChange={closeTagSheet}
          title="Add tag"
        >
          <YStack gap={16}>
            <FormInput
              control={tagForm.control}
              name="tag"
              placeholder="Tag name"
              maxLength={TAG_MAX_LENGTH}
              showCounter
              autoFocus
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={addTag}
            />
            <AppButton variant="primary" onPress={addTag}>
              Add
            </AppButton>
          </YStack>
        </AppSheet>

        <AppToast
          open={!!serverError}
          message={serverError ?? ""}
          onDismiss={() => setServerError(null)}
        />
      </YStack>
    </FormProvider>
  );
}
