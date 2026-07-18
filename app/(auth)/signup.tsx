import { FormInput } from "@/src/components/common/FormInput";
import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { useAuthStore } from "@/src/store/useAuthStore";
import { CardOrientation, ThemeMode } from "@/src/types";
import { SignupForm, signupSchema } from "@/src/validation/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Text, YStack } from "tamagui";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", username: "", password: "" },
    mode: "onTouched",
  });

  const onSubmit = async ({ email, username, password }: SignupForm) => {
    setServerError(null);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/signup`,
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
    <YStack f={1} bg="$background">
      <YStack pos="absolute" top={0} left={0} right={0} zi={100}>
        <ScreenHeader />
      </YStack>

      <YStack f={1} jc="center" ai="center" p="$4" bg="$background" gap="$4">
        <YStack ai="center">
          <Text fontSize="$8" fontWeight="bold">
            Sign Up!
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
          />
          <FormInput
            control={control}
            name="username"
            placeholder="Username"
            textContentType="username"
            autoCapitalize="none"
          />
          <FormInput
            control={control}
            name="password"
            placeholder="Password"
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            bg="$backgroundSoft"
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
              {isSubmitting ? "Signing up..." : "Sign Up"}
            </Text>
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
}
