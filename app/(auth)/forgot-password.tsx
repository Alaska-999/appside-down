import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import {
  ForgotPasswordForm,
  forgotPasswordSchema,
} from "@/src/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, YStack } from "tamagui";

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
            Forgot password?
          </Text>
          <Text color="$colorSecondary" fontSize="$3" textAlign="center">
            Enter your email and we will send you a reset code
          </Text>
        </YStack>

        <YStack width="100%" gap="$2">
          <FormInput
            control={control}
            name="email"
            placeholder="Email"
            textContentType="emailAddress"
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="done"
            onSubmitEditing={() => handleSubmit(onSubmit)()}
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
              {isSubmitting ? "Sending..." : "Send code"}
            </Text>
          </Button>
          <Link href="/login" asChild>
            <Button size="$4" bg="$buttonSecondaryBg" mt="$2" width="100%">
              <Text color="$buttonSecondaryText">Back to login</Text>
            </Button>
          </Link>
        </YStack>
      </YStack>
    </FormProvider>
  );
}
