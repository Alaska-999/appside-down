import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { router } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";
import { Button, Input, Text, YStack } from "tamagui";

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await protectedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/password`,
        {
          method: "PATCH",
          body: JSON.stringify({ oldPassword, newPassword }),
        },
      );

      if (response.status === 403) {
        setError("Current password is incorrect");
        return;
      }
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      Alert.alert("Password updated");
      router.back();
    } catch (err) {
      console.error("[ChangePasswordScreen] update error:", err);
      Alert.alert("Error", "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <YStack f={1} bg="$background">
      <ScreenHeader title="Change password" />
      <YStack f={1} px="$4" gap="$3" pt="$4">
        <Input
          placeholder="Current password"
          size="$4"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
          textContentType="password"
        />
        <Input
          placeholder="New password"
          size="$4"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          textContentType="newPassword"
        />
        <Input
          placeholder="Confirm new password"
          size="$4"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          textContentType="newPassword"
        />
        {error && (
          <Text color="$statusDanger" fontSize="$3">
            {error}
          </Text>
        )}
        <Button
          bg="$buttonBg"
          onPress={handleSubmit}
          disabled={isSubmitting}
          opacity={isSubmitting ? 0.6 : 1}
          mt="$2"
        >
          <Text color="$buttonText" fontWeight="600">
            Save
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
}
