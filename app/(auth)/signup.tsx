import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { useAuthStore } from "@/src/store/useAuthStore";
import { CardOrientation, ThemeMode, UserProfile } from "@/src/types";
import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import { Button, Input, Text, XStack, YStack } from "tamagui";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSignup = async () => {
    if (!email || !password || !username) {
      alert("Please fill in all fields");
      return;
    }

    console.log(email, password, username);
    setIsLoading(true);

    const mockUser: UserProfile = {
      id: "user-123",
      username: username,
      email: email,
      createdAt: new Date().toISOString(),
      settings: {
        userId: "user-123",
        theme: "system",
        defaultCardOrientation: "term_first",
        isTtsEnabled: false,
        dailyStreakGoal: 10,
      },
      streak: {
        userId: "user-123",
        currentStreak: 5,
        lastActiveDate: new Date().toISOString(),
      },
    };

    console.log(`${process.env.EXPO_PUBLIC_API_URL}/auth/signup`);
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/auth/signup`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      },
    );

    console.log(response);

    const data = await response.json();
    const user = {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      createdAt: new Date().toISOString(),
      settings: {
        userId: data.id,
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

    setIsLoading(false);
    router.replace("/");
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
          <Input
            placeholder="Email"
            size="$4"
            value={email}
            onChangeText={setEmail}
            textContentType="emailAddress"
          />
          <Input
            placeholder="Username"
            size="$4"
            value={username}
            onChangeText={setUsername}
            textContentType="username"
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

          <Button size="$4" bg="$buttonBg" onPress={handleSignup} mt="$2">
            <Text color="$buttonText">Sign Up</Text>
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
}
