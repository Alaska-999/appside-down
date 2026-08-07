import { FormInput } from "@/src/components/common/FormInput";
import {
  ResetPasswordForm,
  resetPasswordSchema,
} from "@/src/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Alert, Keyboard } from "react-native";
import type { TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, YStack } from "tamagui";

export default function ResetPassword() {
  const insets = useSafeAreaInsets();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: "", newPassword: "", confirmPassword: "" },
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

  useEffect(() => {
    const subscription = form.watch(() => setServerError(null));
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (resendCooldown === 0) return;
    const timeout = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timeout);
  }, [resendCooldown]);

  const resendCode = async () => {
    setServerError(null);
    setIsResending(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        setServerError(data.message || "Failed to send code");
        return;
      }

      setResendCooldown(60);
    } catch (error) {
      console.error("[ResetPassword] resend error:", error);
      setServerError("Connection problem. Please try again");
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async ({ code, newPassword }: ResetPasswordForm) => {
    setServerError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code, newPassword }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        setServerError(data.message || "Failed to reset password");
        return;
      }

      Alert.alert("Password updated", "You can now log in with a new password");
      router.replace("/login");
    } catch (error) {
      console.error("[ResetPassword] request error:", error);
      setServerError("Connection problem. Please try again");
    }
  };

  return (
    <FormProvider {...form}>
      <YStack
        f={1}
        jc="center"
        ai="center"
        p="$4"
        pt={insets.top + 16}
        pb={insets.bottom + 16}
        bg="$background"
        gap="$4"
        onPress={Keyboard.dismiss}
      >
        <YStack ai="center" gap="$2">
          <Text fontSize="$8" fontWeight="bold">
            Reset password
          </Text>
          <Text color="$colorSecondary" fontSize="$3" textAlign="center">
            Enter the code we sent to {email} and choose a new password
          </Text>
        </YStack>

        <YStack width="100%" gap="$2">
          <FormInput
            control={control}
            name="code"
            placeholder="6-digit code"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => newPasswordRef.current?.focus()}
          />
          <FormInput
            ref={newPasswordRef}
            control={control}
            name="newPassword"
            placeholder="New password"
            secureTextEntry={!showNewPassword}
            textContentType="newPassword"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            rightElement={
              <Button
                pos="absolute"
                right="$2"
                size="$3"
                chromeless
                circular
                onPress={() => setShowNewPassword(!showNewPassword)}
                icon={
                  showNewPassword ? (
                    <EyeOff size="$1" color="$colorSecondary" />
                  ) : (
                    <Eye size="$1" color="$colorSecondary" />
                  )
                }
              />
            }
          />
          <FormInput
            ref={confirmPasswordRef}
            control={control}
            name="confirmPassword"
            placeholder="Confirm new password"
            secureTextEntry={!showConfirmPassword}
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={() => handleSubmit(onSubmit)()}
            rightElement={
              <Button
                pos="absolute"
                right="$2"
                size="$3"
                chromeless
                circular
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                icon={
                  showConfirmPassword ? (
                    <EyeOff size="$1" color="$colorSecondary" />
                  ) : (
                    <Eye size="$1" color="$colorSecondary" />
                  )
                }
              />
            }
          />

          {serverError && (
            <Text color="$statusDanger" fontSize="$3" textAlign="center">
              {serverError}
            </Text>
          )}

          <Button
            size="$4"
            bg="$buttonBg"
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            opacity={isSubmitting ? 0.6 : 1}
            mt="$2"
          >
            <Text color="$buttonText">
              {isSubmitting ? "Resetting..." : "Reset password"}
            </Text>
          </Button>
          <Button
            size="$4"
            chromeless
            onPress={resendCode}
            disabled={resendCooldown > 0 || isResending}
            opacity={resendCooldown > 0 || isResending ? 0.5 : 1}
          >
            <Text color="$colorSecondary">
              {isResending
                ? "Sending..."
                : resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : "Resend code"}
            </Text>
          </Button>
        </YStack>
      </YStack>
    </FormProvider>
  );
}
