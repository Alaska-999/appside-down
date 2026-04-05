import { ImagePickerAvatar } from "@/src/components/common/ImagePickerAvatar";
import { ScreenHeaderCreate } from "@/src/components/common/ScreenHeaderCreate";
import { useAuthStore } from "@/src/store/useAuthStore";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { router } from "expo-router";
import { useState } from "react";
import { Input, Text, XStack, YStack } from "tamagui";

export default function FolderCreate() {
  const [name, setName] = useState("");
  const [customImageUri, setCustomImageUri] = useState<string | null>(null);

  const handleCreateFolder = async () => {
    const token = useAuthStore.getState().token;
    const user = useAuthStore.getState().user;

    if (!token || !user) {
      alert("Login to create a folder");
      return;
    }
    console.log(`${process.env.EXPO_PUBLIC_API_URL}/folders`);
    try {
      const response = await protectedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/folders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: name || "Untitled Folder",
            icon: customImageUri || "",
            tags: [],
          }),
        },
      );
      console.log("Мій токен:", token);
      console.log(response);
      if (!response.ok) {
        console.log(response);

        throw new Error("Failed to create folder");
      }

      const newFolder = await response.json();

      router.push({
        pathname: "/folder/[id]",
        params: { id: newFolder.id },
      });
    } catch (error) {
      console.error(error);
      alert("Error creating folder");
    }
  };

  return (
    <YStack f={1} bg="$background">
      <YStack pos="absolute" top={0} left={0} right={0} zi={100}>
        <ScreenHeaderCreate onCreate={handleCreateFolder} />
      </YStack>

      <YStack
        f={1}
        jc="center"
        ai="center"
        p="$4"
        bg="$background"
        gap="$4"
        width="100%"
      >
        <Text fontSize="$6" fontWeight="bold">
          New Folder
        </Text>
        <ImagePickerAvatar
          imageUri={customImageUri}
          defaultColor={"#22222B"}
          onImageSelected={setCustomImageUri}
        />
        <Input
          placeholder="Untitled Folder"
          value={name}
          onChangeText={setName}
          width="100%"
          height={50}
        />
        <XStack height={50} marginHorizontal="$4" alignItems="center"></XStack>
      </YStack>
    </YStack>
  );
}
