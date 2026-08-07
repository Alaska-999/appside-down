import { FormInput } from "@/src/components/common/FormInput";
import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { protectedFetch } from "@/src/utils/protectedFetch";
import {
  ChangePasswordForm,
  changePasswordSchema,
} from "@/src/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Alert, Keyboard } from "react-native";
import type { TextInput } from "react-native";
import { Button, Text, YStack } from "tamagui";

export default function ChangePasswordScreen() {
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  // серверна помилка зникає, щойно юзер щось міняє у формі
  useEffect(() => {
    const subscription = form.watch(() => setServerError(null));
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async ({ oldPassword, newPassword }: ChangePasswordForm) => {
    setServerError(null);

    try {
      const response = await protectedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/password`,
        {
          method: "PATCH",
          body: JSON.stringify({ oldPassword, newPassword }),
        },
      );

      if (response.status === 403) {
        setServerError("Current password is incorrect");
        return;
      }
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      Alert.alert("Password updated");
      router.back();
    } catch (err) {
      console.error("[ChangePasswordScreen] update error:", err);
      setServerError("Failed to update password. Please try again");
    }
  };

  return (
    <FormProvider {...form}>
      <YStack f={1} bg="$background">
        <ScreenHeader title="Change password" />
        <YStack f={1} px="$4" gap="$3" pt="$4" onPress={Keyboard.dismiss}>
          <FormInput
            control={control}
            name="oldPassword"
            placeholder="Current password"
            secureTextEntry
            textContentType="password"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => newPasswordRef.current?.focus()}
          />
          <FormInput
            ref={newPasswordRef}
            control={control}
            name="newPassword"
            placeholder="New password"
            secureTextEntry
            textContentType="newPassword"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
          <FormInput
            ref={confirmPasswordRef}
            control={control}
            name="confirmPassword"
            placeholder="Confirm new password"
            secureTextEntry
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={() => handleSubmit(onSubmit)()}
          />

          {serverError && (
            <Text color="$statusDanger" fontSize="$3">
              {serverError}
            </Text>
          )}

          <Button
            bg="$buttonBg"
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            opacity={isSubmitting ? 0.6 : 1}
            mt="$2"
          >
            <Text color="$buttonText" fontWeight="600">
              {isSubmitting ? "Saving..." : "Save"}
            </Text>
          </Button>
        </YStack>
      </YStack>
    </FormProvider>
  );
}
