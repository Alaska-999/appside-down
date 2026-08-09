import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import { AuroraBeams } from "@/src/components/ui/AuroraBeams";
import { AuthHeading } from "@/src/components/ui/AuthHeading";
import { AuthSwitchLink } from "@/src/components/ui/AuthSwitchLink";
import { AppButton } from "@/src/components/ui/Button";
import { useAuthStore } from "@/src/store/useAuthStore";
import { CardOrientation, ThemeMode } from "@/src/types";
import { LoginForm, loginSchema } from "@/src/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { TextInput } from "react-native";
import { Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, YStack } from "tamagui";

const MOCKUP_SCALE = 390 / 290;

export default function Login() {
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const setAuth = useAuthStore((state) => state.setAuth);
  const sessionExpired = useAuthStore((state) => state.sessionExpired);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
    reValidateMode: "onSubmit",
  });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    const subscription = form.watch(() => setServerError(null));
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async ({ email, password }: LoginForm) => {
    setServerError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || "Login failed");
        return;
      }

      const user = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        createdAt: data.user.createdAt || new Date().toISOString(),
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
            titlePrefix="Welcome"
            titleHighlight="back"
            subtitle="Log in to keep your streak alive"
          />

          <YStack width="100%" gap={10 * MOCKUP_SCALE} mt={22 * MOCKUP_SCALE}>
            {sessionExpired && (
              <YStack
                width="100%"
                bg="$mintGlassBg"
                borderWidth={1}
                borderColor="$mintGlassBorder"
                br={16 * MOCKUP_SCALE}
                px={13 * MOCKUP_SCALE}
                py={11 * MOCKUP_SCALE}
              >
                <Text
                  color="#c9e8e0"
                  fontSize={12 * MOCKUP_SCALE}
                  lineHeight={12 * MOCKUP_SCALE * 1.45}
                  textAlign="center"
                >
                  Your session has expired. Please log in again.
                </Text>
              </YStack>
            )}

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
              inputSize="lg"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
            <FormInput
              ref={passwordRef}
              control={control}
              name="password"
              placeholder="Password"
              variant="glass"
              secureTextEntry={!showPassword}
              textContentType="password"
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

            <Link href="/forgot-password" asChild>
              <Pressable hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}>
                <Text
                  color="$mint"
                  fontSize={12.5 * MOCKUP_SCALE}
                  fontWeight="600"
                  textAlign="right"
                  mt={2 * MOCKUP_SCALE}
                >
                  Forgot password?
                </Text>
              </Pressable>
            </Link>

            {serverError && (
              <Text
                color="$statusDanger"
                fontSize={12.5 * MOCKUP_SCALE}
                textAlign="center"
              >
                {serverError}
              </Text>
            )}

            <YStack gap={10 * MOCKUP_SCALE} mt={10 * MOCKUP_SCALE}>
              <AppButton
                variant="soft"
                size="lg"
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Log in"}
              </AppButton>

              <AuthSwitchLink
                href="/signup"
                prompt="New here?"
                action="Create account"
              />
            </YStack>
          </YStack>
        </KeyboardAwareScrollView>
      </YStack>
    </FormProvider>
  );
}
