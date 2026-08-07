import { FormInput } from "@/src/components/common/FormInput";
import { ImagePickerAvatar } from "@/src/components/common/ImagePickerAvatar";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { FolderForm, folderSchema } from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Keyboard } from "react-native";
import { Text, XStack, YStack } from "tamagui";

export default function FolderCreate() {
  const [customImageUri, setCustomImageUri] = useState<string | null>(null);
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

  useEffect(() => {
    const subscription = form.watch(() => setServerError(null));
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: FolderForm) => {
    setServerError(null);

    try {
      const response = await protectedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/folders`,
        {
          method: "POST",
          body: JSON.stringify({
            name: data.name,
            icon: customImageUri || "",
            tags: [],
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to create folder");
      }

      const newFolder = await response.json();

      router.replace({
        pathname: "/folder/[id]",
        params: { id: newFolder.id },
      });
    } catch (error) {
      console.error(error);
      setServerError("Failed to create folder. Please try again");
    }
  };

  return (
    <FormProvider {...form}>
      <YStack f={1} bg="$background">
        <YStack pos="absolute" top={0} left={0} right={0} zi={100}>
          <ScreenHeader
            variant="create"
            onCreate={() => {
              if (!isSubmitting) handleSubmit(onSubmit)();
            }}
          />
        </YStack>

        <YStack
          f={1}
          jc="center"
          ai="center"
          p="$4"
          bg="$background"
          gap="$5"
          width="100%"
          onPress={Keyboard.dismiss}
        >
          <Text color="$color" fontSize={20} fontWeight="800">
            New Folder
          </Text>
          <ImagePickerAvatar
            imageUri={customImageUri}
            onImageSelected={setCustomImageUri}
          />

          <FormInput
            control={control}
            name="name"
            variant="glass"
            inputSize="lg"
            width="100%"
            placeholder="Untitled Folder"
          />

          {serverError && (
            <Text color="$statusDanger" fontSize="$3" textAlign="center">
              {serverError}
            </Text>
          )}

          <XStack
            height={50}
            marginHorizontal="$4"
            alignItems="center"
          ></XStack>
        </YStack>
      </YStack>
    </FormProvider>
  );
}
