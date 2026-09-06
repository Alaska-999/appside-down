import { API_BASE_URL } from "@/src/api/config";
import { AuthScreenShell } from "@/src/components/common/AuthScreenShell";
import { FormInput } from "@/src/components/common/FormInput";
import { AuthHeading } from "@/src/components/ui/AuthHeading";
import { AppButton } from "@/src/components/ui/Button";
import { CodeInput } from "@/src/components/ui/CodeInput";
import { ICON_SUBTLE, ICON_ON_GLASS } from "@/src/constants/iconColors";
import { useServerError } from "@/src/hooks/useServerError";
import { getErrorMessage } from "@/src/utils/apiError";
import { ResetPasswordForm, resetPasswordSchema } from "@/src/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Lock } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { TextInput } from "react-native";
import { Pressable } from "react-native";
import { Text, YStack } from "tamagui";

function formatCooldown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function ResetPassword() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

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
  const [serverError, setServerError] = useServerError(form);
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (resendCooldown === 0) return;
    const timeout = setTimeout(
      () => setResendCooldown(resendCooldown - 1),
      1000,
    );
    return () => clearTimeout(timeout);
  }, [resendCooldown]);

  const resendCode = async () => {
    setServerError(null);
    setIsResending(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        setServerError(getErrorMessage(data, "Failed to send code"));
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
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        setServerError(getErrorMessage(data, "Failed to reset password"));
        return;
      }

      router.replace("/login");
    } catch (error) {
      console.error("[ResetPassword] request error:", error);
      setServerError("Connection problem. Please try again");
    }
  };

  return (
    <FormProvider {...form}>
      <AuthScreenShell>
        <AuthHeading
          title="Reset"
          titleHighlight="password"
          subtitle={
            <>
              Code sent to{" "}
              <Text color={ICON_ON_GLASS} fontWeight="600">
                {email}
              </Text>
            </>
          }
        />

        <YStack width="100%" gap={14}>
          <CodeInput
            control={control}
            name="code"
            size="lg"
            autoFocus
            onComplete={() => newPasswordRef.current?.focus()}
          />

          <Pressable
            onPress={resendCode}
            disabled={resendCooldown > 0 || isResending}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text fontSize={12.5} color="$mutedDim" textAlign="center">
              {isResending ? (
                "Sending..."
              ) : resendCooldown > 0 ? (
                <>
                  Resend in{" "}
                  <Text fontSize={12.5} color="$textMuted" fontWeight="600">
                    {formatCooldown(resendCooldown)}
                  </Text>
                </>
              ) : (
                "Resend code"
              )}
            </Text>
          </Pressable>

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
            {isSubmitting ? "Resetting" : "Reset password"}
          </AppButton>
        </YStack>

        <YStack f={1} minHeight={22} />

        <Pressable
          onPress={() => router.push("/login")}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
        >
          <Text fontSize={13.5} color="$mintLight" fontWeight="700" textAlign="center">
            Back to log in
          </Text>
        </Pressable>
      </AuthScreenShell>
    </FormProvider>
  );
}
