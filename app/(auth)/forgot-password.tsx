import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import { AppButton } from "@/src/components/ui/Button";
import { AuroraBeams } from "@/src/components/ui/AuroraBeams";
import { AuthHeading } from "@/src/components/ui/AuthHeading";
import {
  ForgotPasswordForm,
  forgotPasswordSchema,
} from "@/src/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";

const MOCKUP_SCALE = 390 / 290;

export default function ForgotPassword() {
  const insets = useSafeAreaInsets();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
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

  const onSubmit = async ({ email }: ForgotPasswordForm) => {
    setServerError(null);

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

      router.push({ pathname: "/reset-password", params: { email } });
    } catch (error) {
      console.error("[ForgotPassword] request error:", error);
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
            titlePrefix="Forgot"
            titleHighlight="password?"
            subtitle="Enter your email and we'll send you a reset code"
          />

          <YStack width="100%" gap={10 * MOCKUP_SCALE} mt={22 * MOCKUP_SCALE}>
            <FormInput
              control={control}
              name="email"
              placeholder="Email"
              variant="glass"
              textContentType="emailAddress"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={() => handleSubmit(onSubmit)()}
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
                {isSubmitting ? "Sending..." : "Send code"}
              </AppButton>
            </YStack>

            <YStack mt={10 * MOCKUP_SCALE}>
              <AppButton variant="secondary" onPress={() => router.push("/login")}>
                Back to login
              </AppButton>
            </YStack>
          </YStack>
        </KeyboardAwareScrollView>
      </YStack>
    </FormProvider>
  );
}
