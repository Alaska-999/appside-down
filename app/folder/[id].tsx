import { FormInput } from "@/src/components/common/FormInput";
import { ImagePickerAvatar } from "@/src/components/common/ImagePickerAvatar";
import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { AppButton } from "@/src/components/ui/Button";
import { AppCard } from "@/src/components/ui/Card";
import { GlassSheet } from "@/src/components/ui/GlassSheet";
import { IconButton } from "@/src/components/ui/IconButton";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { ChevronLeft, Pencil, Plus, Trash2, X } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Image, Pressable, ScrollView } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, useTheme, XStack, YStack } from "tamagui";

type FolderModule = {
  id: string;
  name: string;
  itemsCount: number;
  authorUsername?: string;
};

type FolderDetail = {
  id: string;
  name: string;
  icon: string;
  tags: string[];
  modules: FolderModule[];
};

function mapModule(raw: any): FolderModule {
  return {
    id: raw.id,
    name: raw.name,
    itemsCount: raw._count?.flashcards ?? raw.itemsCount ?? 0,
    authorUsername: raw.user?.username,
  };
}

export default function FolderScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [folder, setFolder] = useState<FolderDetail | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editIconUri, setEditIconUri] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const editForm = useForm<{ name: string }>({ defaultValues: { name: "" } });

  const [showTagInput, setShowTagInput] = useState(false);
  const tagForm = useForm<{ tag: string }>({ defaultValues: { tag: "" } });

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      fetchFolder();
    }, [id]),
  );

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
      const tags: string[] = raw.tags ?? [];
      setFolder({
        id: raw.id,
        name: raw.name,
        icon: raw.icon ?? "",
        tags,
        modules: (raw.modules ?? []).map(mapModule),
      });
      setSelectedTag((prev) => prev ?? tags[0] ?? null);
    } catch (err) {
      console.error("[FolderScreen] fetch error:", err);
      setError("Failed to load folder");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = () => {
    if (!folder) return;
    editForm.reset({ name: folder.name });
    setEditIconUri(folder.icon || null);
    setEditOpen(true);
  };

  const handleEdit = async () => {
    const name = editForm.getValues("name").trim();
    if (!folder || !name) return;
    setEditLoading(true);
    try {
      const res = await protectedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/folders/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name,
            icon: editIconUri ?? "",
          }),
        },
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      setFolder((prev) =>
        prev ? { ...prev, name, icon: editIconUri ?? "" } : prev,
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
    Alert.alert(
      "Delete folder",
      "This will delete the folder. Modules won't be deleted.",
      [
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
      ],
    );
  };

  const patchTags = async (newTags: string[]) => {
    const res = await protectedFetch(
      `${process.env.EXPO_PUBLIC_API_URL}/folders/${id}`,
      { method: "PATCH", body: JSON.stringify({ tags: newTags }) },
    );
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    return newTags;
  };

  const handleAddTag = async () => {
    const trimmed = tagForm.getValues("tag").trim();
    if (!trimmed || !folder) return;
    if (folder.tags.includes(trimmed)) return;
    try {
      const newTags = await patchTags([...folder.tags, trimmed]);
      setFolder((prev) => (prev ? { ...prev, tags: newTags } : prev));
      tagForm.reset({ tag: "" });
      setShowTagInput(false);
    } catch (err) {
      console.error("[FolderScreen] add tag error:", err);
      Alert.alert("Error", "Failed to add tag");
    }
  };

  const handleDeleteTag = (tag: string) => {
    Alert.alert("Delete tag", "Remove this tag?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!folder) return;
          try {
            const newTags = await patchTags(
              folder.tags.filter((t) => t !== tag),
            );
            setFolder((prev) => (prev ? { ...prev, tags: newTags } : prev));
            if (selectedTag === tag) setSelectedTag(newTags[0] ?? null);
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
              `${process.env.EXPO_PUBLIC_API_URL}/folders/${id}/modules/remove`,
              {
                method: "PATCH",
                body: JSON.stringify({ moduleIds: [moduleId] }),
              },
            );
            if (!res.ok) throw new Error(`Error: ${res.status}`);
            setFolder((prev) =>
              prev
                ? {
                    ...prev,
                    modules: prev.modules.filter((m) => m.id !== moduleId),
                  }
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
        <Text color="$colorMuted" m="$4">
          Loading...
        </Text>
      </YStack>
    );
  }

  if (error || !folder) {
    return (
      <YStack f={1} bg="$background">
        <ScreenHeader />
        <Text color="$statusDanger" m="$4">
          {error ?? "Folder not found"}
        </Text>
      </YStack>
    );
  }

  return (
    <YStack f={1} bg="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack px="$4" gap="$5" pb="$8">
          <YStack gap="$3" pt={insets.top + 10}>
            <XStack jc="space-between" ai="center">
              <IconButton
                icon={<ChevronLeft size="$1" color="$color" />}
                onPress={() => router.back()}
              />
              <XStack gap="$2">
                <IconButton
                  icon={<Pencil size="$1" color="$color" />}
                  onPress={openEdit}
                />
                <IconButton
                  icon={<Trash2 size="$1" color="$statusDanger" />}
                  onPress={handleDelete}
                />
              </XStack>
            </XStack>

            <YStack ai="center" gap="$2">
              <YStack
                width={102}
                height={102}
                br={30}
                overflow="hidden"
                bg="$backgroundStrong"
                ai="center"
                jc="center"
              >
                {folder.icon ? (
                  <Image
                    source={{ uri: folder.icon }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                    accessibilityLabel={folder.name}
                  />
                ) : (
                  <Text fontSize="$8">📁</Text>
                )}
              </YStack>
              <Text fontSize="$7" fontWeight="bold" color="$color">
                {folder.name}
              </Text>
              <Text fontSize="$3" color="$colorMuted">
                {folder.modules.length} module
                {folder.modules.length !== 1 ? "s" : ""}
              </Text>
            </YStack>
          </YStack>

          {/* Tags */}
          <YStack gap="$2">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            >
              <XStack gap="$2.5" ai="center">
                {folder.tags.map((tag) => {
                  const isOn = selectedTag === tag;
                  const tagContent = (
                    <>
                      <Text
                        fontSize="$4"
                        fontWeight={isOn ? "800" : "700"}
                        color={isOn ? "$onAccentText" : "$colorSecondary"}
                      >
                        {tag}
                      </Text>
                      <Pressable
                        hitSlop={8}
                        onPress={() => handleDeleteTag(tag)}
                      >
                        <X
                          size={13}
                          color={isOn ? "$onAccentText" : "$colorMuted"}
                        />
                      </Pressable>
                    </>
                  );
                  return (
                    <Pressable
                      key={tag}
                      onPress={() => setSelectedTag(isOn ? null : tag)}
                    >
                      {isOn ? (
                        <LinearGradient
                          colors={[
                            theme.accentGradientStart.get(),
                            theme.accentGradientEnd.get(),
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            borderRadius: 999,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                          }}
                        >
                          {tagContent}
                        </LinearGradient>
                      ) : (
                        <XStack
                          bg="$glassBg"
                          borderWidth={1}
                          borderColor="$glassBorder"
                          br="$10"
                          px="$4"
                          py="$2"
                          ai="center"
                          gap="$2"
                        >
                          {tagContent}
                        </XStack>
                      )}
                    </Pressable>
                  );
                })}

                <Pressable onPress={() => setShowTagInput(true)}>
                  <XStack
                    bg="$glassBg"
                    borderWidth={1}
                    borderColor="$glassBorder"
                    br="$10"
                    w={44}
                    h={44}
                    ai="center"
                    jc="center"
                  >
                    <Plus size={16} color="$colorMuted" />
                  </XStack>
                </Pressable>
              </XStack>
            </ScrollView>
          </YStack>

          <YStack gap="$3">
            <XStack jc="space-between" ai="center">
              <Text
                fontSize="$3"
                color="$auroraMuted"
                fontWeight="600"
                tt="uppercase"
              >
                Modules ({visibleModules.length})
              </Text>
              {visibleModules.length > 0 && (
                <AppButton
                  variant="secondary"
                  size="sm"
                  icon={<Plus size={16} color="$color" />}
                  onPress={() =>
                    router.push({
                      pathname: "/folder/add-modules" as any,
                      params: { folderId: id },
                    })
                  }
                >
                  Add
                </AppButton>
              )}
            </XStack>

            {visibleModules.length === 0 ? (
              <YStack bg="$backgroundCard" br="$4" p="$6" ai="center" gap="$3">
                <Text fontSize="$5" color="$colorMuted" textAlign="center">
                  No study materials yet
                </Text>
                <AppButton
                  onPress={() =>
                    router.push({
                      pathname: "/folder/add-modules" as any,
                      params: { folderId: id },
                    })
                  }
                >
                  Add study materials
                </AppButton>
              </YStack>
            ) : (
              <YStack gap="$3">
                {visibleModules.map((mod) => (
                  <AppCard
                    key={mod.id}
                    variant="glass"
                    size="sm"
                    fd="row"
                    ai="center"
                    gap="$3"
                  >
                    <Pressable
                      style={{ flex: 1 }}
                      onPress={() =>
                        router.push({
                          pathname: "/module/[id]",
                          params: { id: mod.id },
                        })
                      }
                    >
                      <YStack gap="$1">
                        <Text fontSize="$5" fontWeight="600" color="$color">
                          {mod.name}
                        </Text>
                        <Text fontSize="$3" color="$colorMuted">
                          {mod.itemsCount} card{mod.itemsCount !== 1 ? "s" : ""}
                          {mod.authorUsername
                            ? ` · by ${mod.authorUsername}`
                            : ""}
                        </Text>
                      </YStack>
                    </Pressable>
                    <IconButton
                      size="$2"
                      icon={<X size="$1" color="$statusDanger" />}
                      onPress={() => handleRemoveModule(mod.id)}
                    />
                  </AppCard>
                ))}
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>

      {/* Edit folder sheet */}
      <GlassSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit Folder"
        snapPoints={[50]}
      >
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          bottomOffset={40}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ gap: 16 }}
        >
          <ImagePickerAvatar
            imageUri={editIconUri}
            defaultColor="#22222B"
            onImageSelected={setEditIconUri}
          />

          <FormInput
            control={editForm.control}
            name="name"
            variant="glass"
            inputSize="lg"
            placeholder="Folder name"
          />

          <AppButton onPress={handleEdit} disabled={editLoading}>
            {editLoading ? "Saving..." : "Save"}
          </AppButton>
        </KeyboardAwareScrollView>
      </GlassSheet>

      {/* Add tag sheet */}
      <GlassSheet
        open={showTagInput}
        onOpenChange={(open: boolean) => {
          setShowTagInput(open);
          if (!open) tagForm.reset({ tag: "" });
        }}
        title="Add Tag"
        snapPoints={[30]}
      >
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          bottomOffset={40}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ gap: 16 }}
        >
          <FormInput
            control={tagForm.control}
            name="tag"
            variant="glass"
            inputSize="sm"
            placeholder="Tag name"
            onSubmitEditing={handleAddTag}
            autoFocus
          />

          <AppButton onPress={handleAddTag}>Add</AppButton>
        </KeyboardAwareScrollView>
      </GlassSheet>
    </YStack>
  );
}
