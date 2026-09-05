import { API_BASE_URL } from "@/src/api/config";
import { AuthScreenShell } from "@/src/components/common/AuthScreenShell";
import { FormInput } from "@/src/components/common/FormInput";
import { PasswordStrengthMeter } from "@/src/components/common/PasswordStrengthMeter";
import { AuthHeading } from "@/src/components/ui/AuthHeading";
import { AuthSwitchLink } from "@/src/components/ui/AuthSwitchLink";
import { AppButton } from "@/src/components/ui/Button";
import { ICON_SUBTLE } from "@/src/constants/iconColors";
import { useServerError } from "@/src/hooks/useServerError";
import { useAuthStore } from "@/src/store/useAuthStore";
import { CardOrientation, ThemeMode } from "@/src/types";
import { SignupForm, signupSchema } from "@/src/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Lock, Mail, User } from "lucide-react-native";
import { useRef } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import type { TextInput } from "react-native";
import { Text, YStack } from "tamagui";

export default function Signup() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", username: "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;
  const [serverError, setServerError] = useServerError(form);
  const password = useWatch({ control, name: "password" });

  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const onSubmit = async ({ email, username, password }: SignupForm) => {
    setServerError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || "Signup failed");
        return;
      }

      const user = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        createdAt: new Date().toISOString(),
        settings: {
          userId: data.user.id,
          theme: "light" as ThemeMode,
          defaultCardOrientation: "term_first" as CardOrientation,
          isTtsEnabled: false,
          dailyStreakGoal: 10,
        },
        streak: {
          userId: data.user.id,
          currentStreak: 0,
          lastActiveDate: new Date().toISOString(),
        },
      };

      const refreshToken = data.refresh_token;
      await SecureStore.setItemAsync("refreshToken", refreshToken);
      setAuth(user, data.access_token);

      router.replace("/");
    } catch (error) {
      console.error("Network error:", error);
      setServerError("Connection problem. Please try again");
    }
  };

  return (
    <FormProvider {...form}>
      <AuthScreenShell>
        <AuthHeading
          title="Create"
          titleHighlight="an account"
          subtitle="Flashcards, streaks and progress — all yours"
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
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => usernameRef.current?.focus()}
          />
          <FormInput
            ref={usernameRef}
            control={control}
            name="username"
            label="Username"
            placeholder="Username"
            leftElement={<User size={19} color={ICON_SUBTLE} strokeWidth={1.9} />}
            textContentType="username"
            autoCapitalize="none"
            returnKeyType="next"
            blurOnSubmit={false}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <YStack>
            <FormInput
              ref={passwordRef}
              control={control}
              name="password"
              label="Password"
              placeholder="Password"
              leftElement={<Lock size={19} color={ICON_SUBTLE} strokeWidth={1.9} />}
              secureToggle
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={() => handleSubmit(onSubmit)()}
            />
            <PasswordStrengthMeter password={password ?? ""} />
          </YStack>
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
            {isSubmitting ? "Creating account" : "Create account"}
          </AppButton>
        </YStack>

        <YStack f={1} minHeight={22} />

        <AuthSwitchLink
          href="/login"
          prompt="Already have an account?"
          action="Log in"
        />
      </AuthScreenShell>
    </FormProvider>
  );
}
