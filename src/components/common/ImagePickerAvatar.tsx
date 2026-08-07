import { IconButton } from "@/src/components/ui/IconButton";
import { Ban, Camera, Folder } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image } from "react-native";
import { useTheme, YStack } from "tamagui";

interface ImagePickerAvatarProps {
  imageUri: string | null;
  defaultColor?: string;
  onImageSelected: (uri: string | null) => void;
}

const AVATAR_SIZE = 110;
const AVATAR_RADIUS = 25;

export const ImagePickerAvatar: React.FC<ImagePickerAvatarProps> = ({
  imageUri,
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

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <YStack ai="center" jc="center" py="$2" pos="relative">
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          accessibilityLabel="Custom Folder Image"
          style={{
            width: AVATAR_SIZE,
            height: AVATAR_SIZE,
            borderRadius: AVATAR_RADIUS,
          }}
        />
      ) : (
        <YStack
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          borderRadius={AVATAR_RADIUS}
          shadowColor="$accentGradientStart"
          shadowOpacity={0.2}
          shadowRadius={18}
          shadowOffset={{ width: 0, height: 0 }}
        >
          <LinearGradient
            colors={[theme.accentGradientStart.get(), theme.accentGradientEnd.get()]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: AVATAR_RADIUS,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Folder size={52} color={theme.onAccentText.get()} strokeWidth={1.5} />
          </LinearGradient>
        </YStack>
      )}

      <IconButton
        pos="absolute"
        right={-4}
        bottom={-4}
        variant="badge"
        size={42}
        elevation="$2"
        icon={<Camera size={18} color="$color" />}
        onPress={pickImage}
      />

      {imageUri && (
        <IconButton
          pos="absolute"
          right={-4}
          top={-4}
          variant="danger"
          size={30}
          icon={<Ban size={12} color="white" />}
          onPress={() => onImageSelected(null)}
        />
      )}
    </YStack>
  );
};
