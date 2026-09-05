import { API_BASE_URL } from "@/src/api/config";
import { FormInput } from "@/src/components/common/FormInput";
import { AuthHeading } from "@/src/components/ui/AuthHeading";
import { AuthSwitchLink } from "@/src/components/ui/AuthSwitchLink";
import { AppButton } from "@/src/components/ui/Button";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { AppToast } from "@/src/components/ui/Toast";
import { ICON_SUBTLE } from "@/src/constants/iconColors";
import { useAuthStore } from "@/src/store/useAuthStore";
import { CardOrientation, ThemeMode } from "@/src/types";
import { LoginForm, loginSchema } from "@/src/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Lock, Mail } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { TextInput } from "react-native";
import { Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, YStack } from "tamagui";

export default function Login() {
  const insets = useSafeAreaInsets();
  const [toastOpen, setToastOpen] = useState(false);

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
    setError,
    formState: { isSubmitting },
  } = form;
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    if (sessionExpired) setToastOpen(true);
  }, [sessionExpired]);

  const onSubmit = async ({ email, password }: LoginForm) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError("password", { message: data.message || "Wrong email or password" });
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
      setError("password", { message: "Connection problem. Please try again" });
    }
  };

  return (
    <FormProvider {...form}>
      <YStack f={1} bg="$background">
        <BackgroundMesh preset="auth" animated />
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          bottomOffset={40}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingTop: insets.top + 34,
            paddingBottom: insets.bottom + 22,
          }}
        >
          <AuthHeading
            title="Welcome"
            titleHighlight="back"
            subtitle="Log in to keep your streak alive"
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
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={() => handleSubmit(onSubmit)()}
              />
              <Pressable
                onPress={() => router.push("/forgot-password")}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={{ alignSelf: "flex-end", marginTop: 10 }}
              >
                <Text color="$mintLight" fontSize={12.5} fontWeight="600">
                  Forgot password?
                </Text>
              </Pressable>
            </YStack>
          </YStack>

          <YStack width="100%" mt={20}>
            <AppButton
              variant="primary"
              size="lg"
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
            >
              {isSubmitting ? "Logging in" : "Log in"}
            </AppButton>
          </YStack>

          <YStack f={1} minHeight={22} />

          <AuthSwitchLink href="/signup" prompt="New here?" action="Create an account" />
        </KeyboardAwareScrollView>

        <StatusBarScrim />

        <AppToast
          open={toastOpen}
          message="Session expired"
          description="Log in again to continue"
          onDismiss={() => setToastOpen(false)}
        />
      </YStack>
    </FormProvider>
  );
}
