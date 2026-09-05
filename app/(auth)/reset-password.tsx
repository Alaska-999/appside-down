import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import { AuthHeading } from "@/src/components/ui/AuthHeading";
import { AppButton } from "@/src/components/ui/Button";
import { CodeInput } from "@/src/components/ui/CodeInput";
import { IconButton } from "@/src/components/ui/IconButton";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { ResetPasswordForm, resetPasswordSchema } from "@/src/validation/auth";
import { screenGutter } from "@/tamagui.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Eye, EyeOff, Lock } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { TextInput } from "react-native";
import { Alert, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";

function formatCooldown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

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
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

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
        <BackgroundMesh preset="auth" animated />
        <YStack pos="absolute" top={insets.top + 8} left={screenGutter} zIndex={10}>
          <IconButton
            variant="liquidGlass"
            icon={<ChevronLeft size={22} color="#EAF7FF" strokeWidth={1.9} />}
            onPress={() => router.back()}
          />
        </YStack>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          bottomOffset={40}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: insets.top + 62,
            paddingBottom: insets.bottom + 22,
          }}
        >
          <AuthHeading
            title="Reset"
            titleHighlight="password"
            subtitle={
              <>
                Code sent to{" "}
                <Text color="#DCEBF2" fontWeight="600">
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
              <Text fontSize={12.5} color="#5A6B7A" textAlign="center">
                {isResending ? (
                  "Sending..."
                ) : resendCooldown > 0 ? (
                  <>
                    Resend in{" "}
                    <Text fontSize={12.5} color="#7F97A6" fontWeight="600">
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
              leftElement={<Lock size={19} color="#5A6B7A" strokeWidth={1.9} />}
              secureTextEntry={!showNewPassword}
              textContentType="newPassword"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => confirmPasswordRef.current?.focus()}
              rightElement={
                <Pressable onPress={() => setShowNewPassword((prev) => !prev)} hitSlop={8}>
                  {showNewPassword ? (
                    <EyeOff size={19} color="#5A6B7A" strokeWidth={1.9} />
                  ) : (
                    <Eye size={19} color="#5A6B7A" strokeWidth={1.9} />
                  )}
                </Pressable>
              }
            />
            <FormInput
              ref={confirmPasswordRef}
              control={control}
              name="confirmPassword"
              label="Confirm new password"
              placeholder="Repeat it"
              leftElement={<Lock size={19} color="#5A6B7A" strokeWidth={1.9} />}
              secureTextEntry={!showConfirmPassword}
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={() => handleSubmit(onSubmit)()}
              rightElement={
                <Pressable onPress={() => setShowConfirmPassword((prev) => !prev)} hitSlop={8}>
                  {showConfirmPassword ? (
                    <EyeOff size={19} color="#5A6B7A" strokeWidth={1.9} />
                  ) : (
                    <Eye size={19} color="#5A6B7A" strokeWidth={1.9} />
                  )}
                </Pressable>
              }
            />
          </YStack>

          {serverError && (
            <Text color="#FCA5A5" fontSize={12.5} textAlign="center" mt={10}>
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
        </KeyboardAwareScrollView>

        <StatusBarScrim />
      </YStack>
    </FormProvider>
  );
}
