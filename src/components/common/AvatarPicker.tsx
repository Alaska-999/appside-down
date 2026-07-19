import { UserAvatar } from "@/src/components/common/UserAvatar";
import { useAuthStore } from "@/src/store/useAuthStore";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { Ban, Camera } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";
import { Button, Spinner, YStack } from "tamagui";

export function AvatarPicker() {
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);

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
        `${process.env.EXPO_PUBLIC_API_URL}/users/me/avatar`,
        { method: "PATCH", body: formData },
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);

      const data = await res.json();
      useAuthStore.getState().updateAvatar(data.avatarUrl);
    } catch (err) {
      console.error("[AvatarPicker] upload error:", err);
      Alert.alert("Error", "Failed to upload photo. Please try again");
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant access to your photos in settings to upload a picture.",
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
        `${process.env.EXPO_PUBLIC_API_URL}/users/me/avatar`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      useAuthStore.getState().updateAvatar(null);
    } catch (err) {
      console.error("[AvatarPicker] remove error:", err);
      Alert.alert("Error", "Failed to remove photo. Please try again");
    } finally {
      setUploading(false);
    }
  };

  return (
    <YStack ai="center" gap="$2" py="$4">
      {/* фіксований 120x120 блок — щоб абсолютні кнопки завжди чіплялись
         до краю круга, а не до краю батьківського контейнера, ширина
         якого залежить від того, чи є ai="center" в екрана, що юзає цей компонент */}
      <YStack width={120} height={120} pos="relative">
        <UserAvatar
          avatarUrl={user?.avatarUrl}
          username={user?.username}
          size={120}
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
          right="$-2"
          bottom="$4"
          circular
          size="$3"
          bg="$background"
          bw={2}
          borderColor="$borderColor"
          elevation="$2"
          icon={<Camera size="$1" color="$colorSecondary" />}
          onPress={pickImage}
          disabled={uploading}
          pressStyle={{ scale: 0.9 }}
        />

        {user?.avatarUrl && (
          <Button
            pos="absolute"
            right="$-2"
            top="$4"
            circular
            size="$3"
            bg="$background"
            bw={2}
            borderColor="$borderColor"
            elevation="$2"
            icon={<Ban size="$1" color="$statusDanger" />}
            onPress={removeAvatar}
            disabled={uploading}
            pressStyle={{ scale: 0.9 }}
          />
        )}
      </YStack>
    </YStack>
  );
}
