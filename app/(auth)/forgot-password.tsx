import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import { AuthHeading } from "@/src/components/ui/AuthHeading";
import { AppButton } from "@/src/components/ui/Button";
import { IconButton } from "@/src/components/ui/IconButton";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import {
  ForgotPasswordForm,
  forgotPasswordSchema,
} from "@/src/validation/auth";
import { screenGutter } from "@/tamagui.config";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { ChevronLeft, Mail } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";

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

      router.push({ pathname: "/reset-password", params: { email } });
    } catch (error) {
      console.error("[ForgotPassword] request error:", error);
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
            title="Forgot"
            titleHighlight="password?"
            subtitle="Enter your email and we'll send you a 6-digit code"
          />

          <YStack width="100%" gap={14}>
            <FormInput
              control={control}
              name="email"
              label="Email"
              placeholder="Email"
              leftElement={<Mail size={19} color="#5A6B7A" strokeWidth={1.9} />}
              textContentType="emailAddress"
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={() => handleSubmit(onSubmit)()}
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
              {isSubmitting ? "Sending" : "Send code"}
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
      </YStack>
    </FormProvider>
  );
}
