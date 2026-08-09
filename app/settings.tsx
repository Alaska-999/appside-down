import { API_BASE_URL } from "@/src/api/config";
import { AvatarPicker } from "@/src/components/common/AvatarPicker";
import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { Toggle } from "@/src/components/common/Toggle";
import { AppButton } from "@/src/components/ui/Button";
import { GlassSheet } from "@/src/components/ui/GlassSheet";
import { GlowSurface } from "@/src/components/ui/GlowSurface";
import { SectionTitle } from "@/src/components/ui/SectionTitle";
import { usePreferencesStore } from "@/src/store/usePreferencesStore";
import { useAuthStore } from "@/src/store/useAuthStore";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { controlHeight } from "@/tamagui.config";
import { ChevronRight, LogOut } from "@tamagui/lucide-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { ReactNode, useState } from "react";
import { Alert, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Input, ScrollView, Text, XStack, YStack } from "tamagui";

function GlassCard({ children }: { children: ReactNode }) {
  return (
    <YStack
      bg="$glassBg"
      borderWidth={1}
      borderColor="$glassBorder"
      br="$cardSoft"
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
  isLast,
  right,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  disabled?: boolean;
  isLast?: boolean;
  right?: ReactNode;
}) {
  const content = (
    <XStack
      ai="center"
      jc="space-between"
      px={18}
      py={14}
      opacity={disabled ? 0.45 : 1}
      borderBottomWidth={isLast ? 0 : 1}
      borderColor="$glassBorderSubtle"
    >
      <YStack f={1} gap="$1">
        <Text fontSize={16} fontWeight="600" color="$color">
          {label}
        </Text>
        {value && (
          <Text fontSize={14} color="$colorMuted" mt={1}>
            {value}
          </Text>
        )}
      </YStack>
      {right ??
        (onPress && !disabled && (
          <ChevronRight size={16} color="$colorMuted" />
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
      const res = await protectedFetch(
        `${API_BASE_URL}/auth/logout`,
        { method: "POST" },
      );
      if (!res.ok) {
        console.error("Logout request failed");
      }
    } catch (error) {
      console.error(error);
    } finally {
      await useAuthStore.getState().logout();
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
        `${API_BASE_URL}/auth/account`,
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
      await useAuthStore.getState().logout();
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
        <YStack px="$4" gap="$5" pt="$2" pb="$8">
          <GlowSurface
            glow
            glowOpacity={0.1}
            bg="$glassBg"
            borderWidth={1}
            borderColor="$glassBorder"
            br="$cardSoft"
            px={18}
            py={18}
            fd="row"
            ai="center"
            gap={16}
          >
            <AvatarPicker size={76} />
            <YStack f={1}>
              <Text fontSize={19} fontWeight="800" color="$color">
                {user?.username ?? "Unknown"}
              </Text>
              <Text fontSize={14} color="$colorMuted" mt={3}>
                {user?.email ?? ""}
              </Text>
            </YStack>
          </GlowSurface>

          <GlassCard>
            <SettingsRow
              label="Create password"
              isLast
              onPress={() => router.push("/change-password")}
            />
          </GlassCard>

          <YStack gap="$2">
            <SectionTitle tone="eyebrow" px="$1">
              Preferences
            </SectionTitle>
            <GlassCard>
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
                isLast
                right={
                  <Toggle
                    value={hapticFeedbackEnabled}
                    onToggle={toggleHapticFeedback}
                  />
                }
              />
            </GlassCard>
          </YStack>

          <YStack gap="$2">
            <SectionTitle tone="eyebrow" px="$1">
              About
            </SectionTitle>
            <GlassCard>
              <SettingsRow label="Privacy policy" disabled />
              <SettingsRow label="Terms of service" disabled />
              <SettingsRow
                label="Version"
                value={Constants.expoConfig?.version ?? "unknown"}
                isLast
              />
            </GlassCard>
          </YStack>

          <YStack gap="$3">
            <AppButton
              variant="secondary"
              icon={<LogOut size={18} color="$statusDanger" />}
              onPress={logout}
            >
              <Text color="$statusDanger" fontWeight="600">
                Log Out
              </Text>
            </AppButton>
            <AppButton variant="danger" onPress={() => setDeleteSheetOpen(true)}>
              Delete account
            </AppButton>
          </YStack>
        </YStack>
      </ScrollView>

      <GlassSheet
        open={deleteSheetOpen}
        onOpenChange={(open: boolean) => {
          setDeleteSheetOpen(open);
          if (!open) {
            setDeletePassword("");
            setDeleteError(null);
          }
        }}
        title="Delete account"
        snapPoints={[45]}
      >
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          bottomOffset={40}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <YStack gap="$3">
            <Text fontSize={16} color="$colorMuted" lineHeight={23}>
              This permanently deletes your account and all your folders,
              modules, and flashcards. This cannot be undone.
            </Text>
            <Input
              placeholder="Password"
              height={controlHeight.md}
              px={16}
              br={16}
              bg="$glassBg"
              borderWidth={1}
              borderColor="$glassBorder"
              placeholderTextColor="$colorSecondary"
              color="$color"
              secureTextEntry
              value={deletePassword}
              onChangeText={setDeletePassword}
              textContentType="password"
            />
            {deleteError && (
              <Text color="$statusDanger" fontSize={14}>
                {deleteError}
              </Text>
            )}
            <XStack gap="$3">
              <YStack f={1}>
                <AppButton
                  variant="secondary"
                  onPress={() => setDeleteSheetOpen(false)}
                >
                  Cancel
                </AppButton>
              </YStack>
              <YStack f={1}>
                <AppButton
                  variant="danger"
                  onPress={handleDeleteAccount}
                  loading={isDeleting}
                >
                  Delete
                </AppButton>
              </YStack>
            </XStack>
          </YStack>
        </KeyboardAwareScrollView>
      </GlassSheet>
    </YStack>
  );
}
