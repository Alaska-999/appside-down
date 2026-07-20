import { SectionTitle } from "@/app/(tabs)/index";
import { FormInput } from "@/src/components/common/FormInput";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { AppButton } from "@/src/components/ui/Button";
import { FlashcardEditItem } from "@/src/components/flashcards/FlashcardEditItem";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { ModuleForm, moduleSchema } from "@/src/validation/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import type { TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";

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

  const termRefs = useRef<Array<TextInput | null>>([]);
  const definitionRefs = useRef<Array<TextInput | null>>([]);
  const prevFieldsLength = useRef(fields.length);

  useEffect(() => {
    if (fields.length > prevFieldsLength.current) {
      termRefs.current[fields.length - 1]?.focus();
    }
    prevFieldsLength.current = fields.length;
  }, [fields.length]);

  const focusTerm = (index: number) => termRefs.current[index]?.focus();
  const focusDefinition = (index: number) =>
    definitionRefs.current[index]?.focus();

  useEffect(() => {
    const subscription = form.watch(() => setServerError(null));
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: ModuleForm) => {
    setServerError(null);

    const module = {
      name: data.name,
      description: data.description,
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
          <ScreenHeader
            variant="create"
            onCreate={() => {
              if (!isSubmitting) handleSubmit(onSubmit)();
            }}
          />
        </YStack>

        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          bottomOffset={40}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingTop: 100,
            paddingBottom: insets.bottom + 40,
            paddingHorizontal: 0,
          }}
        >
          <YStack width="100%" px="$screenX">
            <Text
              color="$color"
              fontSize={26}
              fontWeight="800"
              textAlign="center"
              mb={24}
            >
              New Module
            </Text>

            <YStack mb={14}>
              <FormInput
                control={control}
                name="name"
                placeholder="Untitled Module"
                bg="$glassBg"
                borderColor="$glassBorder"
                borderWidth={1}
                fontSize={16}
                color="$color"
                br="$control"
                height={50}
                px={20}
              />
            </YStack>

            <YStack mb={24}>
              <FormInput
                control={control}
                name="description"
                placeholder="Description (optional)"
                bg="$glassBg"
                borderColor="$glassBorder"
                borderWidth={1}
                fontSize={16}
                color="$color"
                br="$control"
                height={50}
                px={20}
              />
            </YStack>

            <SectionTitle>FLASHCARDS</SectionTitle>

            <YStack gap={16} mt={11}>
              {fields.map((field, index) => (
                <FlashcardEditItem
                  key={field.id}
                  control={control}
                  termName={`flashcards.${index}.term`}
                  definitionName={`flashcards.${index}.definition`}
                  index={index}
                  onRemove={remove}
                  showRemove={fields.length > 1}
                  termRef={(node) => {
                    termRefs.current[index] = node;
                  }}
                  definitionRef={(node) => {
                    definitionRefs.current[index] = node;
                  }}
                  onSubmitTerm={() => focusDefinition(index)}
                  onSubmitDefinition={() => {
                    if (index + 1 < fields.length) {
                      focusTerm(index + 1);
                    } else {
                      append({ term: "", definition: "" });
                    }
                  }}
                />
              ))}
            </YStack>

            {flashcardsError && (
              <Text color="$statusDanger" fontSize="$2" mt="$2">
                {flashcardsError}
              </Text>
            )}

            {serverError && (
              <Text
                color="$statusDanger"
                fontSize="$3"
                textAlign="center"
                mt="$2"
              >
                {serverError}
              </Text>
            )}

            <YStack mt={22}>
              <AppButton
                variant="outline"
                size="lg"
                onPress={() => append({ term: "", definition: "" })}
              >
                + Add Card
              </AppButton>
            </YStack>
          </YStack>
        </KeyboardAwareScrollView>
      </YStack>
    </FormProvider>
  );
}
