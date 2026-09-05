import { API_BASE_URL } from "@/src/api/config";
import { AuthScreenShell } from "@/src/components/common/AuthScreenShell";
import { FormInput } from "@/src/components/common/FormInput";
import { AuthHeading } from "@/src/components/ui/AuthHeading";
import { AppButton } from "@/src/components/ui/Button";
import { ICON_SUBTLE } from "@/src/constants/iconColors";
import { useServerError } from "@/src/hooks/useServerError";
import { getErrorMessage } from "@/src/utils/apiError";
import {
  ForgotPasswordForm,
  forgotPasswordSchema,
} from "@/src/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Mail } from "lucide-react-native";
import { FormProvider, useForm } from "react-hook-form";
import { Pressable } from "react-native";
import { Text, YStack } from "tamagui";

export default function ForgotPassword() {
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
  const [serverError, setServerError] = useServerError(form);

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
        setServerError(getErrorMessage(data, "Failed to send code"));
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
      <AuthScreenShell>
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
            leftElement={<Mail size={19} color={ICON_SUBTLE} strokeWidth={1.9} />}
            textContentType="emailAddress"
            autoCapitalize="none"
            keyboardType="email-address"
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
      </AuthScreenShell>
    </FormProvider>
  );
}
