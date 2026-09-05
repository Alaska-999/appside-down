import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { useServerError } from "@/src/hooks/useServerError";
import { AppButton } from "@/src/components/ui/Button";
import { protectedFetch } from "@/src/utils/protectedFetch";
import {
  ChangePasswordForm,
  changePasswordSchema,
} from "@/src/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Alert, Keyboard } from "react-native";
import type { TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Text, YStack } from "tamagui";

export default function ChangePasswordScreen() {
  const screen = useScreenInsets();

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
  const [serverError, setServerError] = useServerError(form);

  const onSubmit = async ({ oldPassword, newPassword }: ChangePasswordForm) => {
    setServerError(null);

    try {
      const response = await protectedFetch(
        `${API_BASE_URL}/auth/password`,
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
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          bottomOffset={40}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: screen.bottom }}
        >
          <YStack gap={13.45} onPress={Keyboard.dismiss}>
            <FormInput
              control={control}
              name="oldPassword"
              placeholder="Current password"
              variant="glass"
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
              variant="glass"
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
              variant="glass"
              secureTextEntry
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={() => handleSubmit(onSubmit)()}
            />

            {serverError && (
              <Text color="$statusDanger" fontSize={16.81} textAlign="center">
                {serverError}
              </Text>
            )}

            <YStack mt={13.45}>
              <AppButton
                variant="soft"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </AppButton>
            </YStack>
          </YStack>
        </KeyboardAwareScrollView>
      </YStack>
    </FormProvider>
  );
}
