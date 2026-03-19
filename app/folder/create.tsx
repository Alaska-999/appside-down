import { ImagePickerAvatar } from "@/src/components/common/ImagePickerAvatar";
import { ScreenHeaderCreate } from "@/src/components/common/ScreenHeaderCreate";
import { Folder } from "@/src/types";
import { useState } from "react";
import { Input, Text, XStack, YStack } from "tamagui";

export default function FolderCreate() {
  const [name, setName] = useState("");
  const [customImageUri, setCustomImageUri] = useState<string | null>(null);

  const handleCreateFolder = () => {
    const folder: Folder = {
      id: crypto.randomUUID(),
      name: name || "Untitled Folder",
      icon: customImageUri || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "user-123",
    };

    console.log(folder);
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
