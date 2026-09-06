import { API_BASE_URL } from "@/src/api/config";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { ICON_DANGER, ICON_ON_GLASS } from "@/src/constants/iconColors";
import { useAuthStore } from "@/src/store/useAuthStore";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { Ban, Camera } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Linking } from "react-native";
import { Button, Spinner, YStack } from "tamagui";

interface AvatarPickerProps {
  size?: number;
  onError?: (message: string) => void;
}

export function AvatarPicker({ size = 120, onError }: AvatarPickerProps) {
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const isDefaultSize = size === 120;
  const scale = size / 120;
  const badgeSize = Math.round(36 * scale);
  const badgeIconSize = Math.round(16 * scale);
  const badgeOffset = Math.round(-6 * scale);

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", {
        uri: asset.uri,
        name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      } as unknown as Blob);

      const res = await protectedFetch(
        `${API_BASE_URL}/users/me/avatar`,
        { method: "PATCH", body: formData },
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const data = await res.json();
      useAuthStore.getState().updateAvatar(data.avatarUrl);
    } catch (err) {
      console.error("[AvatarPicker] upload error:", err);
      onError?.("Couldn't upload photo. Try again");
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Grant access to your photos in Settings to upload a picture.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await uploadAvatar(result.assets[0]);
    }
  };

  const removeAvatar = async () => {
    setUploading(true);
    try {
      const res = await protectedFetch(
        `${API_BASE_URL}/users/me/avatar`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      useAuthStore.getState().updateAvatar(null);
    } catch (err) {
      console.error("[AvatarPicker] remove error:", err);
      onError?.("Couldn't remove photo. Try again");
    } finally {
      setUploading(false);
    }
  };

  return (
    <YStack ai="center" gap="$2" py={isDefaultSize ? "$4" : 0}>
      <YStack width={size} height={size} pos="relative">
        <UserAvatar
          avatarUrl={user?.avatarUrl}
          username={user?.username}
          size={size}
        />

        {uploading && (
          <YStack
            pos="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            ai="center"
            jc="center"
            bg="$pureBlack"
            opacity={0.4}
            br={999}
          >
            <Spinner color="white" />
          </YStack>
        )}

        <Button
          pos="absolute"
          right={isDefaultSize ? "$-2" : badgeOffset}
          bottom={isDefaultSize ? "$4" : badgeOffset}
          circular
          size={isDefaultSize ? "$3" : badgeSize}
          bg="$background"
          bw={2}
          borderColor="$borderColor"
          elevation="$2"
          icon={
            <Camera
              size={isDefaultSize ? "$1" : badgeIconSize}
              color={ICON_ON_GLASS}
            />
          }
          onPress={pickImage}
          disabled={uploading}
          pressStyle={{ scale: 0.9 }}
        />

        {user?.avatarUrl && (
          <Button
            pos="absolute"
            right={isDefaultSize ? "$-2" : badgeOffset}
            top={isDefaultSize ? "$4" : badgeOffset}
            circular
            size={isDefaultSize ? "$3" : badgeSize}
            bg="$background"
            bw={2}
            borderColor="$borderColor"
            elevation="$2"
            icon={
              <Ban
                size={isDefaultSize ? "$1" : badgeIconSize}
                color={ICON_DANGER}
              />
            }
            onPress={removeAvatar}
            disabled={uploading}
            pressStyle={{ scale: 0.9 }}
          />
        )}
      </YStack>
    </YStack>
  );
}
