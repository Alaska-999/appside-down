import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import { AppButton } from "@/src/components/ui/Button";
import { AuroraBeams } from "@/src/components/ui/AuroraBeams";
import { AuthHeading } from "@/src/components/ui/AuthHeading";
import { AuthSwitchLink } from "@/src/components/ui/AuthSwitchLink";
import { useAuthStore } from "@/src/store/useAuthStore";
import { CardOrientation, ThemeMode } from "@/src/types";
import { SignupForm, signupSchema } from "@/src/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { TextInput } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, YStack } from "tamagui";

const MOCKUP_SCALE = 390 / 290;

export default function Signup() {
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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

  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    const subscription = form.watch(() => setServerError(null));
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async ({ email, username, password }: SignupForm) => {
    setServerError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, username }),
        },
      );

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
            titlePrefix="Create"
            titleHighlight="account"
            subtitle="Flashcards, streaks and progress — all yours"
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
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => usernameRef.current?.focus()}
            />
            <FormInput
              ref={usernameRef}
              control={control}
              name="username"
              placeholder="Username"
              variant="glass"
              textContentType="username"
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <FormInput
              ref={passwordRef}
              control={control}
              name="password"
              placeholder="Password"
              variant="glass"
              secureTextEntry={!showPassword}
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
                  onPress={() => setShowPassword(!showPassword)}
                  icon={
                    showPassword ? (
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
                {isSubmitting ? "Signing up..." : "Sign up"}
              </AppButton>
            </YStack>

            <AuthSwitchLink
              href="/login"
              prompt="Already have an account?"
              action="Log in"
            />
          </YStack>
        </KeyboardAwareScrollView>
      </YStack>
    </FormProvider>
  );
}
