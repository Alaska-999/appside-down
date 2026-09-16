import { API_BASE_URL } from "@/src/api/config";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { IconButton } from "@/src/components/ui/IconButton";
import { ICON_ON_GLASS } from "@/src/constants/iconColors";
import { useAuthStore } from "@/src/store/useAuthStore";
import { protectedFetch } from "@/src/utils/protectedFetch";
import * as ImagePicker from "expo-image-picker";
import { Ban, Camera } from "lucide-react-native";
import { useState } from "react";
import { Alert, Linking } from "react-native";
import { Spinner, YStack } from "tamagui";

interface AvatarPickerProps {
  size?: number;
  onError?: (message: string) => void;
}

const CAMERA_BADGE = 30;
const REMOVE_BADGE = 26;
const BADGE_OFFSET_X = -12;
const BADGE_OFFSET_Y = -4;

const uriToBlob = (uri: string): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new Error("Couldn't read the selected file"));
    xhr.responseType = "blob";
    xhr.open("GET", uri, true);
    xhr.send(null);
  });

export function AvatarPicker({ size = 66, onError }: AvatarPickerProps) {
  const user = useAuthStore((state) => state.user);
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    setUploading(true);
    try {
      const blob = await uriToBlob(asset.uri);
      const formData = new FormData();
      formData.append(
        "avatar",
        blob,
        asset.fileName ?? `avatar-${Date.now()}.jpg`,
      );

      const res = await protectedFetch(`${API_BASE_URL}/users/me/avatar`, {
        method: "PATCH",
        body: formData,
      });
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
      mediaTypes: ["images"],
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
      const res = await protectedFetch(`${API_BASE_URL}/users/me/avatar`, {
        method: "DELETE",
      });
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
    <YStack ai="center">
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

        <IconButton
          variant="badge"
          size={CAMERA_BADGE}
          pos="absolute"
          right={BADGE_OFFSET_X}
          bottom={BADGE_OFFSET_Y}
          icon={<Camera size={15} color={ICON_ON_GLASS} strokeWidth={2} />}
          onPress={pickImage}
          disabled={uploading}
          accessibilityLabel="Change photo"
        />

        {user?.avatarUrl && (
          <IconButton
            variant="danger"
            size={REMOVE_BADGE}
            pos="absolute"
            right={BADGE_OFFSET_X}
            top={BADGE_OFFSET_Y}
            icon={<Ban size={13} color={ICON_ON_GLASS} strokeWidth={2.2} />}
            onPress={removeAvatar}
            disabled={uploading}
            accessibilityLabel="Remove photo"
          />
        )}
      </YStack>
    </YStack>
  );
}
