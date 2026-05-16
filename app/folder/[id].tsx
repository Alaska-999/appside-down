import { ImagePickerAvatar } from "@/src/components/common/ImagePickerAvatar";
import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { Tag } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { Pencil, Plus, Trash2, X } from "@tamagui/lucide-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView } from "react-native";
import {
  Avatar,
  Button,
  Input,
  Sheet,
  Text,
  XStack,
  YStack,
} from "tamagui";

type FolderModule = { id: string; name: string; itemsCount: number };

type FolderDetail = {
  id: string;
  name: string;
  icon: string;
  tags: Tag[];
  modules: FolderModule[];
};

function mapModule(raw: any): FolderModule {
  return {
    id: raw.id,
    name: raw.name,
    itemsCount: raw._count?.flashcards ?? raw.itemsCount ?? 0,
  };
}

export default function FolderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [folder, setFolder] = useState<FolderDetail | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit sheet state
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editIconUri, setEditIconUri] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // New tag state
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  useEffect(() => {
    if (!id) return;
    fetchFolder();
  }, [id]);

  const fetchFolder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await protectedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/folders/${id}`,
        { method: "GET" },
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const raw = await res.json();
      setFolder({
        id: raw.id,
        name: raw.name,
        icon: raw.icon ?? "",
        tags: raw.tags ?? [],
        modules: (raw.modules ?? []).map(mapModule),
      });
    } catch (err) {
      console.error("[FolderScreen] fetch error:", err);
      setError("Failed to load folder");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    if (!folder) return;
    setEditName(folder.name);
    setEditIconUri(folder.icon || null);
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!folder || !editName.trim()) return;
    setEditLoading(true);
    try {
      const res = await protectedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/folders/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ name: editName.trim(), icon: editIconUri ?? "" }),
        },
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      setFolder((prev) =>
        prev ? { ...prev, name: editName.trim(), icon: editIconUri ?? "" } : prev,
      );
      setEditOpen(false);
    } catch (err) {
      console.error("[FolderScreen] edit error:", err);
      Alert.alert("Error", "Failed to update folder");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete folder", "This will delete the folder. Modules won't be deleted.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await protectedFetch(
              `${process.env.EXPO_PUBLIC_API_URL}/folders/${id}`,
              { method: "DELETE" },
            );
            if (!res.ok) throw new Error(`Error: ${res.status}`);
            router.back();
          } catch (err) {
            console.error("[FolderScreen] delete error:", err);
            Alert.alert("Error", "Failed to delete folder");
          }
        },
      },
    ]);
  };

  const handleAddTag = async () => {
    if (!newTagName.trim() || !id) return;
    try {
      const res = await protectedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/folders/${id}/tags`,
        {
          method: "POST",
          body: JSON.stringify({ name: newTagName.trim() }),
        },
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const tag: Tag = await res.json();
      setFolder((prev) =>
        prev ? { ...prev, tags: [...prev.tags, tag] } : prev,
      );
      setNewTagName("");
      setShowTagInput(false);
    } catch (err) {
      console.error("[FolderScreen] add tag error:", err);
      Alert.alert("Error", "Failed to add tag");
    }
  };

  const handleDeleteTag = (tagId: string) => {
    Alert.alert("Delete tag", "Remove this tag?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await protectedFetch(
              `${process.env.EXPO_PUBLIC_API_URL}/folders/${id}/tags/${tagId}`,
              { method: "DELETE" },
            );
            if (!res.ok) throw new Error(`Error: ${res.status}`);
            setFolder((prev) =>
              prev ? { ...prev, tags: prev.tags.filter((t) => t.id !== tagId) } : prev,
            );
            if (selectedTagId === tagId) setSelectedTagId(null);
          } catch (err) {
            console.error("[FolderScreen] delete tag error:", err);
            Alert.alert("Error", "Failed to delete tag");
          }
        },
      },
    ]);
  };

  const handleRemoveModule = (moduleId: string) => {
    Alert.alert("Remove module", "Remove this module from the folder?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await protectedFetch(
              `${process.env.EXPO_PUBLIC_API_URL}/folders/${id}/modules/${moduleId}`,
              { method: "DELETE" },
            );
            if (!res.ok) throw new Error(`Error: ${res.status}`);
            setFolder((prev) =>
              prev
                ? { ...prev, modules: prev.modules.filter((m) => m.id !== moduleId) }
                : prev,
            );
          } catch (err) {
            console.error("[FolderScreen] remove module error:", err);
            Alert.alert("Error", "Failed to remove module");
          }
        },
      },
    ]);
  };

  const visibleModules = folder?.modules ?? [];

  if (loading) {
    return (
      <YStack f={1} bg="$background">
        <ScreenHeader />
        <Text color="$colorMuted" m="$4">Loading...</Text>
      </YStack>
    );
  }

  if (error || !folder) {
    return (
      <YStack f={1} bg="$background">
        <ScreenHeader />
        <Text color="$statusDanger" m="$4">{error ?? "Folder not found"}</Text>
      </YStack>
    );
  }

  return (
    <YStack f={1} bg="$background">
      <ScreenHeader />

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack px="$4" gap="$5" pb="$8">

          {/* Folder header: icon + name + actions */}
          <XStack ai="center" gap="$3" pt="$2">
            <Avatar circular size="$6" bg="$backgroundCard">
              {folder.icon ? (
                <Avatar.Image src={folder.icon} accessibilityLabel={folder.name} />
              ) : null}
              <Avatar.Fallback jc="center" ai="center">
                <Text fontSize="$7">📁</Text>
              </Avatar.Fallback>
            </Avatar>

            <Text f={1} fontSize="$7" fontWeight="bold" color="$color">
              {folder.name}
            </Text>

            <Button
              size="$3"
              circular
              icon={<Pencil size="$1" color="$color" />}
              bg="$backgroundCard"
              onPress={openEdit}
            />
            <Button
              size="$3"
              circular
              icon={<Trash2 size="$1" color="$statusDanger" />}
              bg="$backgroundCard"
              onPress={handleDelete}
            />
          </XStack>

          {/* Tags */}
          <YStack gap="$2">
            <Text fontSize="$3" color="$colorMuted" fontWeight="600" tt="uppercase">
              Tags
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="$2" ai="center">
                {folder.tags.map((tag) => (
                  <Pressable key={tag.id} onLongPress={() => handleDeleteTag(tag.id)}>
                    <XStack
                      bg={selectedTagId === tag.id ? "$buttonBg" : "$backgroundCard"}
                      br="$10"
                      px="$3"
                      py="$2"
                      onPress={() =>
                        setSelectedTagId(selectedTagId === tag.id ? null : tag.id)
                      }
                    >
                      <Text
                        fontSize="$3"
                        color={selectedTagId === tag.id ? "$buttonText" : "$color"}
                      >
                        {tag.name}
                      </Text>
                    </XStack>
                  </Pressable>
                ))}

                {showTagInput ? (
                  <XStack ai="center" gap="$2">
                    <Input
                      size="$3"
                      placeholder="Tag name"
                      value={newTagName}
                      onChangeText={setNewTagName}
                      onSubmitEditing={handleAddTag}
                      autoFocus
                      minWidth={100}
                    />
                    <Button size="$3" onPress={handleAddTag} bg="$buttonBg">
                      <Text color="$buttonText">Add</Text>
                    </Button>
                    <Button
                      size="$3"
                      circular
                      icon={<X size="$1" />}
                      bg="$backgroundCard"
                      onPress={() => { setShowTagInput(false); setNewTagName(""); }}
                    />
                  </XStack>
                ) : (
                  <Button
                    size="$3"
                    circular
                    icon={<Plus size="$1" color="$color" />}
                    bg="$backgroundCard"
                    onPress={() => setShowTagInput(true)}
                  />
                )}
              </XStack>
            </ScrollView>
          </YStack>

          {/* Modules section */}
          <YStack gap="$3">
            <XStack jc="space-between" ai="center">
              <Text fontSize="$3" color="$colorMuted" fontWeight="600" tt="uppercase">
                Modules ({visibleModules.length})
              </Text>
              {visibleModules.length > 0 && (
                <Button
                  size="$3"
                  icon={<Plus size="$1" />}
                  bg="$buttonSecondaryBg"
                  br="$10"
                  onPress={() =>
                    router.push({ pathname: "/folder/add-modules" as any, params: { folderId: id } })
                  }
                >
                  <Text color="$buttonSecondaryText" fontSize="$3">Add</Text>
                </Button>
              )}
            </XStack>

            {visibleModules.length === 0 ? (
              <YStack
                bg="$backgroundCard"
                br="$4"
                p="$6"
                ai="center"
                gap="$3"
              >
                <Text fontSize="$5" color="$colorMuted" textAlign="center">
                  No study materials yet
                </Text>
                <Button
                  bg="$buttonBg"
                  br="$10"
                  onPress={() =>
                    router.push({ pathname: "/folder/add-modules" as any, params: { folderId: id } })
                  }
                >
                  <Text color="$buttonText">Add study materials</Text>
                </Button>
              </YStack>
            ) : (
              <YStack gap="$3">
                {visibleModules.map((mod) => (
                  <XStack
                    key={mod.id}
                    bg="$backgroundCard"
                    br="$4"
                    p="$4"
                    ai="center"
                    gap="$3"
                  >
                    <Pressable
                      style={{ flex: 1 }}
                      onPress={() =>
                        router.push({ pathname: "/module/[id]", params: { id: mod.id } })
                      }
                    >
                      <YStack gap="$1">
                        <Text fontSize="$5" fontWeight="600" color="$color">
                          {mod.name}
                        </Text>
                        <Text fontSize="$3" color="$colorMuted">
                          {mod.itemsCount} card{mod.itemsCount !== 1 ? "s" : ""}
                        </Text>
                      </YStack>
                    </Pressable>
                    <Button
                      size="$3"
                      circular
                      icon={<X size="$1" color="$statusDanger" />}
                      bg="$backgroundCard"
                      onPress={() => handleRemoveModule(mod.id)}
                    />
                  </XStack>
                ))}
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>

      {/* Edit folder sheet */}
      <Sheet
        open={editOpen}
        onOpenChange={setEditOpen}
        snapPoints={[50]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame p="$4" gap="$4">
          <Text fontSize="$6" fontWeight="bold">Edit Folder</Text>

          <ImagePickerAvatar
            imageUri={editIconUri}
            defaultColor="#22222B"
            onImageSelected={setEditIconUri}
          />

          <Input
            placeholder="Folder name"
            value={editName}
            onChangeText={setEditName}
            size="$5"
          />

          <Button
            bg="$buttonBg"
            onPress={handleEdit}
            disabled={editLoading}
          >
            <Text color="$buttonText">
              {editLoading ? "Saving..." : "Save"}
            </Text>
          </Button>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}
