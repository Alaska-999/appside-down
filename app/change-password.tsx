import { API_BASE_URL } from "@/src/api/config";
import { AuthScreenShell } from "@/src/components/common/AuthScreenShell";
import { FormInput } from "@/src/components/common/FormInput";
import { AuthHeading } from "@/src/components/ui/AuthHeading";
import { AppButton } from "@/src/components/ui/Button";
import { ICON_SUBTLE } from "@/src/constants/iconColors";
import { useServerError } from "@/src/hooks/useServerError";
import { protectedFetch } from "@/src/utils/protectedFetch";
import {
  ChangePasswordForm,
  changePasswordSchema,
} from "@/src/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Lock } from "lucide-react-native";
import { useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { TextInput } from "react-native";
import { Text, YStack } from "tamagui";

export default function ChangePasswordScreen() {
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

      router.back();
    } catch (err) {
      console.error("[ChangePasswordScreen] update error:", err);
      setServerError("Failed to update password. Please try again");
    }
  };

  return (
    <FormProvider {...form}>
      <AuthScreenShell>
        <AuthHeading
          title="Change"
          titleHighlight="password"
          subtitle="Enter your current password and choose a new one"
        />

        <YStack width="100%" gap={14}>
          <FormInput
            control={control}
            name="oldPassword"
            label="Current password"
            placeholder="Current password"
            leftElement={<Lock size={19} color={ICON_SUBTLE} strokeWidth={1.9} />}
            secureToggle
            textContentType="password"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => newPasswordRef.current?.focus()}
          />
          <FormInput
            ref={newPasswordRef}
            control={control}
            name="newPassword"
            label="New password"
            placeholder="New password"
            leftElement={<Lock size={19} color={ICON_SUBTLE} strokeWidth={1.9} />}
            secureToggle
            textContentType="newPassword"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />
          <FormInput
            ref={confirmPasswordRef}
            control={control}
            name="confirmPassword"
            label="Confirm new password"
            placeholder="Repeat it"
            leftElement={<Lock size={19} color={ICON_SUBTLE} strokeWidth={1.9} />}
            secureToggle
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={() => handleSubmit(onSubmit)()}
          />
        </YStack>

        {serverError && (
          <Text color="$roseSoft" fontSize={12.5} textAlign="center" mt={10}>
            {serverError}
          </Text>
        )}

        <YStack width="100%" mt={20}>
          <AppButton
            variant="primary"
            size="lg"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
          >
            {isSubmitting ? "Saving" : "Save"}
          </AppButton>
        </YStack>
      </AuthScreenShell>
    </FormProvider>
  );
}
