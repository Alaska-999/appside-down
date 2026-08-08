import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import { AppButton } from "@/src/components/ui/Button";
import { AuroraBeams } from "@/src/components/ui/AuroraBeams";
import { AuthHeading } from "@/src/components/ui/AuthHeading";
import { CodeInput } from "@/src/components/ui/CodeInput";
import {
  ResetPasswordForm,
  resetPasswordSchema,
} from "@/src/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Alert, Pressable } from "react-native";
import type { TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, YStack } from "tamagui";

const MOCKUP_SCALE = 390 / 290;

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
        `${API_BASE_URL}/auth/forgot-password`,
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
        `${API_BASE_URL}/auth/reset-password`,
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
      <YStack f={1} bg="$background">
        <AuroraBeams />
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          bottomOffset={40}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 18 * MOCKUP_SCALE,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
          }}
        >
          <AuthHeading
            titlePrefix="Reset"
            titleHighlight="password"
            subtitle={
              <>
                Code sent to{" "}
                <Text color="$color" fontWeight="600">
                  {email}
                </Text>
              </>
            }
          />

          <YStack width="100%" gap={10 * MOCKUP_SCALE} mt={22 * MOCKUP_SCALE}>
            <CodeInput
              control={control}
              name="code"
              autoFocus
              onComplete={() => newPasswordRef.current?.focus()}
            />
            <FormInput
              ref={newPasswordRef}
              control={control}
              name="newPassword"
              placeholder="New password"
              variant="glass"
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
              variant="glass"
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
              <Text
                color="$statusDanger"
                fontSize={12.5 * MOCKUP_SCALE}
                textAlign="center"
              >
                {serverError}
              </Text>
            )}

            <YStack mt={10 * MOCKUP_SCALE}>
              <AppButton
                variant="soft"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
              >
                {isSubmitting ? "Resetting..." : "Reset password"}
              </AppButton>
            </YStack>

            <Pressable
              onPress={resendCode}
              disabled={resendCooldown > 0 || isResending}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
            >
              <Text
                color="$colorSecondary"
                fontSize={12.5 * MOCKUP_SCALE}
                textAlign="center"
                mt={12 * MOCKUP_SCALE}
                opacity={resendCooldown > 0 || isResending ? 0.5 : 1}
              >
                {isResending
                  ? "Sending..."
                  : resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Resend code"}
              </Text>
            </Pressable>
          </YStack>
        </KeyboardAwareScrollView>
      </YStack>
    </FormProvider>
  );
}
