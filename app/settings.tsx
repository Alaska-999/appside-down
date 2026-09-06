import { API_BASE_URL } from "@/src/api/config";
import { AvatarPicker } from "@/src/components/common/AvatarPicker";
import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { AppButton } from "@/src/components/ui/Button";
import { GlassCard, GlassRow, GlassRows } from "@/src/components/ui/GlassRows";
import { ScreenBackground } from "@/src/components/ui/ScreenBackground";
import { SectionTitle } from "@/src/components/ui/SectionTitle";
import { AppSheet } from "@/src/components/ui/Sheet";
import { AppToast } from "@/src/components/ui/Toast";
import { Toggle } from "@/src/components/ui/Toggle";
import { ICON_ROSE_SOFT } from "@/src/constants/iconColors";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { useAuthStore } from "@/src/store/useAuthStore";
import { usePreferencesStore } from "@/src/store/usePreferencesStore";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { controlHeight } from "@/tamagui.config";
import { LogOut } from "@tamagui/lucide-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Input, ScrollView, Text, XStack, YStack } from "tamagui";

export default function SettingsScreen() {
  const screen = useScreenInsets();
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
  const [toast, setToast] = useState<string | null>(null);

  const logout = async () => {
    try {
      const res = await protectedFetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
      });
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
      const response = await protectedFetch(`${API_BASE_URL}/auth/account`, {
        method: "DELETE",
        body: JSON.stringify({ password: deletePassword }),
      });

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
      setToast("Couldn't delete the account. Try again");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ScreenBackground preset="home">
      <ScreenHeader title="Settings" />

      <ScrollView f={1} showsVerticalScrollIndicator={false}>
        <YStack px="$screenX" gap={18} pt="$2" pb={screen.bottom}>
          <GlassCard p={16}>
            <XStack ai="center" gap={14}>
              <AvatarPicker size={66} onError={setToast} />
              <YStack f={1}>
                <Text fontSize={17} fontWeight="800" color="$color">
                  {user?.username ?? "Unknown"}
                </Text>
                <Text fontSize={13} color="$colorMuted" mt={2}>
                  {user?.email ?? ""}
                </Text>
              </YStack>
            </XStack>
          </GlassCard>

          <GlassRows>
            <GlassRow
              label="Create password"
              onPress={() => router.push("/change-password")}
            />
          </GlassRows>

          <YStack gap="$2">
            <SectionTitle tone="eyebrow" px={4}>
              Preferences
            </SectionTitle>
            <GlassRows>
              <GlassRow
                label="Push notifications"
                right={
                  <Toggle
                    size="lg"
                    value={pushNotificationsEnabled}
                    onToggle={togglePushNotifications}
                  />
                }
              />
              <GlassRow
                label="Sound effects"
                right={
                  <Toggle
                    size="lg"
                    value={soundEffectsEnabled}
                    onToggle={toggleSoundEffects}
                  />
                }
              />
              <GlassRow
                label="Haptic feedback"
                right={
                  <Toggle
                    size="lg"
                    value={hapticFeedbackEnabled}
                    onToggle={toggleHapticFeedback}
                  />
                }
              />
            </GlassRows>
          </YStack>

          <YStack gap="$2">
            <SectionTitle tone="eyebrow" px={4}>
              About
            </SectionTitle>
            <GlassRows>
              <GlassRow label="Privacy policy" disabled />
              <GlassRow label="Terms of service" disabled />
              <GlassRow
                label="Version"
                value={Constants.expoConfig?.version ?? "unknown"}
              />
            </GlassRows>
          </YStack>

          <YStack gap={9}>
            <AppButton
              variant="secondary"
              icon={<LogOut size={18} color={ICON_ROSE_SOFT} />}
              onPress={logout}
            >
              <Text color="$roseSoft" fontWeight="600">
                Log Out
              </Text>
            </AppButton>
            <AppButton
              variant="danger"
              onPress={() => setDeleteSheetOpen(true)}
            >
              Delete account
            </AppButton>
          </YStack>
        </YStack>
      </ScrollView>

      <AppSheet
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
              br="$control"
              bg="$glassBg"
              borderWidth={1}
              borderColor="$borderColor"
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
      </AppSheet>

      <AppToast
        open={!!toast}
        message={toast ?? ""}
        onDismiss={() => setToast(null)}
      />
    </ScreenBackground>
  );
}
