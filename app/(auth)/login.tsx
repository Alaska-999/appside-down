import { useAuthStore } from "@/src/store/useAuthStore";
import { CardOrientation, ThemeMode } from "@/src/types";
import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { Button, Input, Text, XStack, YStack } from "tamagui";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleLogin = async () => {
    console.log(email, password, "email, password");
    if (!email || !password) {
      alert("Будь ласка, заповніть всі поля");
      return;
    }

    setIsLoading(true);

    // const mockUser: UserProfile = {
    //   id: "user-123",
    //   username: email.split("@")[0],
    //   email: email,
    //   createdAt: new Date().toISOString(),
    //   settings: {
    //     userId: "user-123",
    //     theme: "system",
    //     defaultCardOrientation: "term_first",
    //     isTtsEnabled: false,
    //     dailyStreakGoal: 10,
    //   },
    //   streak: {
    //     userId: "user-123",
    //     currentStreak: 5,
    //     lastActiveDate: new Date().toISOString(),
    //   },
    // };

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    );

    console.log(response, "response");

    const data = await response.json();
    console.log(data, "data");

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
    console.log(data);
    await SecureStore.setItemAsync("refreshToken", refreshToken);
    setAuth(user, data.access_token);

    setIsLoading(false);
    router.replace("/");
  };

  return (
    <YStack f={1} jc="center" ai="center" p="$4" bg="$background" gap="$4">
      <YStack ai="center">
        <Text fontSize="$8" fontWeight="bold">
          Welcome!
        </Text>
      </YStack>

      <YStack width="100%" gap="$2">
        <Input
          placeholder="Email"
          size="$4"
          value={email}
          onChangeText={setEmail}
          textContentType="emailAddress"
        />
        <XStack width="100%" ai="center" pos="relative">
          <Input
            placeholder="Password"
            size="$4"
            f={1}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            textContentType="password"
            bg="$backgroundSoft"
            borderColor="$borderColor"
          />
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
        </XStack>
        <Button size="$4" bg="$buttonBg" onPress={handleLogin} mt="$2">
          <Text color="$buttonText">Login</Text>
        </Button>
        <Link href="/signup" asChild>
          <Button size="$4" bg="$buttonSecondaryBg" mt="$2" width="100%">
            <Text color="$buttonSecondaryText">Sign up</Text>
          </Button>
        </Link>
      </YStack>
    </YStack>
  );
}
