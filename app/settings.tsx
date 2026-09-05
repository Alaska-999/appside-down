import { API_BASE_URL } from "@/src/api/config";
import { AvatarPicker } from "@/src/components/common/AvatarPicker";
import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { AppCard } from "@/src/components/ui/Card";
import { GlowTone } from "@/src/components/ui/GlowSurface";
import { Toggle } from "@/src/components/ui/Toggle";
import { AppButton } from "@/src/components/ui/Button";
import { AppSheet } from "@/src/components/ui/Sheet";
import { AppToast } from "@/src/components/ui/Toast";
import { usePreferencesStore } from "@/src/store/usePreferencesStore";
import { useAuthStore } from "@/src/store/useAuthStore";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { controlHeight } from "@/tamagui.config";
import { ChevronRight, LogOut } from "@tamagui/lucide-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Children, ReactNode, useState } from "react";
import { Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Input, ScrollView, Text, XStack, YStack } from "tamagui";

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <Text
      fontSize={11}
      fontWeight="700"
      letterSpacing={0.99}
      textTransform="uppercase"
      color="$colorMuted"
      px="$1"
    >
      {children}
    </Text>
  );
}

function Rows({ tone, children }: { tone: GlowTone; children: ReactNode }) {
  const items = Children.toArray(children);
  return (
    <AppCard variant="glow" tone={tone} px={0} py={0}>
      {items.map((child, index) => (
        <YStack key={index} pos="relative">
          {index > 0 && (
            <YStack
              pos="absolute"
              t={0}
              l={48}
              r={0}
              h={1}
              bg="rgba(220,255,245,0.09)"
            />
          )}
          {child}
        </YStack>
      ))}
    </AppCard>
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
    <XStack ai="center" jc="space-between" px={17} py={14} opacity={disabled ? 0.45 : 1}>
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
          <ChevronRight size={16} color="$mutedDim" />
        ))}
    </XStack>
  );

  if (!onPress || disabled) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

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
      setToast("Couldn't delete the account. Try again");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <YStack f={1} bg="$background">
      <ScreenHeader title="Settings" />

      <ScrollView f={1} showsVerticalScrollIndicator={false}>
        <YStack px="$4" gap="$5" pt="$2" pb={screen.bottom}>
          <AppCard variant="glow" tone="mint" px={16} py={16}>
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
          </AppCard>

          <Rows tone="mint">
            <SettingsRow
              label="Create password"
              onPress={() => router.push("/change-password")}
            />
          </Rows>

          <YStack gap="$2">
            <Eyebrow>Preferences</Eyebrow>
            <Rows tone="lime">
              <SettingsRow
                label="Push notifications"
                right={
                  <Toggle
                    size="md"
                    value={pushNotificationsEnabled}
                    onToggle={togglePushNotifications}
                  />
                }
              />
              <SettingsRow
                label="Sound effects"
                right={
                  <Toggle
                    size="md"
                    value={soundEffectsEnabled}
                    onToggle={toggleSoundEffects}
                  />
                }
              />
              <SettingsRow
                label="Haptic feedback"
                right={
                  <Toggle
                    size="md"
                    value={hapticFeedbackEnabled}
                    onToggle={toggleHapticFeedback}
                  />
                }
              />
            </Rows>
          </YStack>

          <YStack gap="$2">
            <Eyebrow>About</Eyebrow>
            <Rows tone="indigo">
              <SettingsRow label="Privacy policy" disabled />
              <SettingsRow label="Terms of service" disabled />
              <SettingsRow
                label="Version"
                value={Constants.expoConfig?.version ?? "unknown"}
              />
            </Rows>
          </YStack>

          <YStack gap={9}>
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
      </AppSheet>

      <AppToast
        open={!!toast}
        message={toast ?? ""}
        onDismiss={() => setToast(null)}
      />
    </YStack>
  );
}
