import { Ban, Camera, Folder } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import { Avatar, Button, Theme, useTheme, YStack } from "tamagui";

interface ImagePickerAvatarProps {
  imageUri: string | null;
  defaultColor: string;
  onImageSelected: (uri: string | null) => void;
}

export const ImagePickerAvatar: React.FC<ImagePickerAvatarProps> = ({
  imageUri,
  defaultColor,
  onImageSelected,
}) => {
  const theme = useTheme();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert(
        "Please grant access to the gallery in settings to upload a photo.",
      );
      return;
    }

    // 2. Відкриваємо галерею
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Тільки фото
      allowsEditing: true, // Дозволити обрізання/редагування
      aspect: [1, 1], // Квадратне співвідношення (як для аватара)
      quality: 0.8, // Якість (від 0 до 1)
    });

    // 3. Якщо юзер обрав фото, оновлюємо стан
    if (!result.canceled && result.assets && result.assets.length > 0) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <YStack ai="center" gap="$2" py="$4" pos="relative">
      {/* Основний контейнер аватара.
         Він використовує нативний Image, якщо uri існує,
         або дефолтний Circle з іконкою, якщо uri === null.
      */}
      <Theme name="light">
        <Avatar
          circular
          size={120}
          elevation="$4"
          bg={defaultColor}
          bw={2}
          borderColor="$borderColor"
        >
          {imageUri ? (
            <Avatar.Image
              src={imageUri}
              accessibilityLabel="Custom Folder Image"
            />
          ) : (
            <Avatar.Fallback jc="center" ai="center">
              <Folder size={60} color="white" />
            </Avatar.Fallback>
          )}
        </Avatar>
      </Theme>

      {/* Кнопка "Редагувати" (маленьке коло з камерою) */}
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
        pressStyle={{ scale: 0.9 }}
      />

      {/* Кнопка "Видалити", якщо є кастомне зображення */}
      {imageUri && (
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
          icon={<Ban size="$1" color="$colorSecondary" />}
          onPress={() => onImageSelected(null)}
          pressStyle={{ scale: 0.9 }}
        />
      )}
    </YStack>
  );
};
