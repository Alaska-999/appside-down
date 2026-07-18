import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { Toggle } from "@/src/components/common/Toggle";
import { usePreferencesStore } from "@/src/store/usePreferencesStore";
import { useAuthStore } from "@/src/store/useAuthStore";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { ChevronRight, LogOut } from "@tamagui/lucide-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ReactNode, useState } from "react";
import { Alert, Pressable } from "react-native";
import {
  Button,
  Input,
  ScrollView,
  Sheet,
  Text,
  XStack,
  YStack,
} from "tamagui";

function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <YStack
      borderWidth={1}
      borderColor="$borderColor"
      br="$4"
      overflow="hidden"
    >
      {children}
    </YStack>
  );
}

function SettingsRow({
  label,
  value,
  onPress,
  disabled,
  right,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
  right?: ReactNode;
}) {
  const content = (
    <XStack
      ai="center"
      jc="space-between"
      px="$4"
      py="$3"
      opacity={disabled ? 0.5 : 1}
      borderBottomWidth={1}
      borderColor="$borderColor"
    >
      <YStack f={1} gap="$1">
        <Text fontSize="$4" fontWeight="600" color="$color">
          {label}
        </Text>
        {value && (
          <Text fontSize="$3" color="$colorMuted">
            {value}
          </Text>
        )}
      </YStack>
      {right ??
        (onPress && !disabled && (
          <ChevronRight size={18} color="$colorMuted" />
        ))}
    </XStack>
  );

  if (!onPress || disabled) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

export default function SettingsScreen() {
  const { user } = useAuthStore();
  const {
    soundEffectsEnabled,
    hapticFeedbackEnabled,
    pushNotificationsEnabled,
    toggleSoundEffects,
    toggleHapticFeedback,
    togglePushNotifications,
  } = usePreferencesStore();

  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const logout = async () => {
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id }),
      });
    } catch (error) {
      console.error(error);
    } finally {
      useAuthStore.getState().logout();
      await SecureStore.deleteItemAsync("refreshToken");
      router.replace("/login");
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Enter your password");
      return;
    }

    setDeleteError(null);
    setIsDeleting(true);
    try {
      const response = await protectedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/account`,
        {
          method: "DELETE",
          body: JSON.stringify({ password: deletePassword }),
        },
      );

      if (response.status === 403) {
        setDeleteError("Incorrect password");
        return;
      }
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      setDeleteSheetOpen(false);
      useAuthStore.getState().logout();
      await SecureStore.deleteItemAsync("refreshToken");
      router.replace("/login");
    } catch (err) {
      console.error("[SettingsScreen] delete account error:", err);
      Alert.alert("Error", "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <YStack f={1} bg="$background">
      <ScreenHeader title="Settings" />
      <ScrollView f={1} showsVerticalScrollIndicator={false}>
        <YStack px="$4" gap="$5" pt="$2">
          <YStack gap="$2">
            <Text fontSize="$5" fontWeight="bold" color="$color">
              Personal information
            </Text>
            <SettingsCard>
              <SettingsRow
                label="Username"
                value={user?.username ?? "Unknown"}
              />
              <SettingsRow label="Email" value={user?.email ?? ""} />
              <SettingsRow
                label="Create password"
                onPress={() => router.push("/change-password")}
              />
            </SettingsCard>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$5" fontWeight="bold" color="$color">
              App version
            </Text>
            <SettingsCard>
              <SettingsRow
                label="Version"
                value={Constants.expoConfig?.version ?? "unknown"}
              />
            </SettingsCard>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$5" fontWeight="bold" color="$color">
              Preferences
            </Text>
            <SettingsCard>
              <SettingsRow
                label="Push notifications"
                right={
                  <Toggle
                    value={pushNotificationsEnabled}
                    onToggle={togglePushNotifications}
                  />
                }
              />
              <SettingsRow
                label="Sound effects"
                right={
                  <Toggle
                    value={soundEffectsEnabled}
                    onToggle={toggleSoundEffects}
                  />
                }
              />
              <SettingsRow
                label="Haptic feedback"
                right={
                  <Toggle
                    value={hapticFeedbackEnabled}
                    onToggle={toggleHapticFeedback}
                  />
                }
              />
            </SettingsCard>
          </YStack>

          <YStack gap="$2">
            <Text fontSize="$5" fontWeight="bold" color="$color">
              About
            </Text>
            <SettingsCard>
              <SettingsRow label="Privacy policy" disabled />
              <SettingsRow label="Terms of service" disabled />
              <SettingsRow label="Help Centre" disabled />
            </SettingsCard>
          </YStack>

          <YStack gap="$3" pb="$6">
            <Button
              icon={<LogOut size="$1" color="$statusDanger" />}
              bg="$buttonSecondaryBg"
              onPress={logout}
              width="100%"
            >
              <Text color="$statusDanger" fontWeight="600">
                Log Out
              </Text>
            </Button>
            <Button
              bg="$statusDanger"
              onPress={() => setDeleteSheetOpen(true)}
              width="100%"
            >
              <Text color="white" fontWeight="600">
                Delete account
              </Text>
            </Button>
          </YStack>
        </YStack>
      </ScrollView>

      <Sheet
        modal
        open={deleteSheetOpen}
        onOpenChange={(open: boolean) => {
          setDeleteSheetOpen(open);
          if (!open) {
            setDeletePassword("");
            setDeleteError(null);
          }
        }}
        snapPoints={[35]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay bg="$pureBlack" opacity={0.5} />
        <Sheet.Handle />
        <Sheet.Frame p="$4" bg="$background" gap="$3">
          <Text fontSize="$6" fontWeight="bold" color="$color">
            Delete account
          </Text>
          <Text fontSize="$3" color="$colorMuted">
            This permanently deletes your account and all your folders, modules,
            and flashcards. This cannot be undone.
          </Text>
          <Input
            placeholder="Password"
            size="$4"
            secureTextEntry
            value={deletePassword}
            onChangeText={setDeletePassword}
            textContentType="password"
          />
          {deleteError && (
            <Text color="$statusDanger" fontSize="$3">
              {deleteError}
            </Text>
          )}
          <XStack gap="$3">
            <Button f={1} onPress={() => setDeleteSheetOpen(false)}>
              <Text>Cancel</Text>
            </Button>
            <Button
              f={1}
              bg="$statusDanger"
              onPress={handleDeleteAccount}
              disabled={isDeleting}
              opacity={isDeleting ? 0.6 : 1}
            >
              <Text color="white" fontWeight="600">
                Delete
              </Text>
            </Button>
          </XStack>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}
