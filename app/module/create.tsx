import { FormInput } from "@/src/components/common/FormInput";
import { ScreenHeaderCreate } from "@/src/components/common/ScreenHeaderCreate";
import { FlashcardEditItem } from "@/src/components/flashcards/FlashcardEditItem";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { ModuleForm, moduleSchema } from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "@tamagui/lucide-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, ScrollView, Text, YStack } from "tamagui";

export default function ModuleCreate() {
  const insets = useSafeAreaInsets();
  const [serverError, setServerError] = useState<string | null>(null);
  const { returnFolderId } = useLocalSearchParams<{
    returnFolderId?: string;
  }>();

  const form = useForm<ModuleForm>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: "",
      description: "",
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
    formState: { errors, isSubmitting },
  } = form;

  const flashcardsError =
    errors.flashcards?.root?.message ??
    (errors.flashcards as { message?: string } | undefined)?.message;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "flashcards",
  });

  // серверна помилка зникає, щойно юзер щось міняє у формі
  useEffect(() => {
    const subscription = form.watch(() => setServerError(null));
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: ModuleForm) => {
    setServerError(null);

    const module = {
      name: data.name,
      description: data.description,
      // повністю порожні рядки-заготовки не відправляємо;
      // наполовину заповнені — контент юзера, зберігаємо як є
      flashcards: data.flashcards.filter(
        (card) => card.term || card.definition,
      ),
    };

    try {
      const response = await protectedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/modules`,
        {
          method: "POST",
          body: JSON.stringify(module),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to create module");
      }
      const newModule = await response.json();
      if (returnFolderId) {
        await protectedFetch(
          `${process.env.EXPO_PUBLIC_API_URL}/folders/${returnFolderId}/modules`,
          {
            method: "POST",
            body: JSON.stringify({ moduleId: newModule.id }),
          },
        );
        router.back();
      } else {
        router.replace({
          pathname: "/module/[id]",
          params: { id: newModule.id },
        });
      }
    } catch (error) {
      console.error(error);
      setServerError("Failed to create module. Please try again");
    }
  };

  return (
    <FormProvider {...form}>
      <YStack f={1} bg="$background">
        <YStack pos="absolute" top={0} left={0} right={0} zi={100}>
          <ScreenHeaderCreate
            onCreate={() => {
              if (!isSubmitting) handleSubmit(onSubmit)();
            }}
          />
        </YStack>
        <ScrollView
          f={1}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: 100,
            paddingBottom: insets.bottom + 40,
            paddingHorizontal: 16,
          }}
        >
          <YStack gap="$4" width="100%">
            <Text
              fontSize="$8"
              fontWeight="bold"
              textAlign="center"
              mb="$2"
              mt="$4"
            >
              New Module
            </Text>

            <FormInput
              control={control}
              name="name"
              placeholder="Untitled Module"
              size="$5"
            />

            <FormInput
              control={control}
              name="description"
              placeholder="Description (optional)"
              size="$4"
              bg="transparent"
            />

            <YStack gap="$6" mt="$6">
              {fields.map((field, index) => (
                <FlashcardEditItem
                  key={field.id}
                  control={control}
                  termName={`flashcards.${index}.term`}
                  definitionName={`flashcards.${index}.definition`}
                  index={index}
                  onRemove={remove}
                  showRemove={fields.length > 1}
                />
              ))}
            </YStack>

            {flashcardsError && (
              <Text color="$statusDanger" fontSize="$2">
                {flashcardsError}
              </Text>
            )}

            {serverError && (
              <Text color="$statusDanger" fontSize="$3" textAlign="center">
                {serverError}
              </Text>
            )}

            <Button
              icon={<Plus size="$1" />}
              onPress={() => append({ term: "", definition: "" })}
              mt="$4"
              bg="$buttonSecondaryBg"
              br="$10"
            >
              <Text color="$buttonSecondaryText">Add Card</Text>
            </Button>
          </YStack>
        </ScrollView>
      </YStack>
    </FormProvider>
  );
}
