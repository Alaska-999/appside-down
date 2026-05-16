import { SegmentedControl } from "@/src/components/common/SegmentedControl";
import { Folder, Module } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable } from "react-native";
import { Avatar, Text, XStack, YStack } from "tamagui";

export default function Library() {
  const [tab, setTab] = useState(0);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [foldersRes, modulesRes] = await Promise.all([
        protectedFetch(`${process.env.EXPO_PUBLIC_API_URL}/folders`, {
          method: "GET",
        }),
        protectedFetch(`${process.env.EXPO_PUBLIC_API_URL}/modules`, {
          method: "GET",
        }),
      ]);

      if (!foldersRes.ok)
        throw new Error(`Folders error: ${foldersRes.status}`);
      if (!modulesRes.ok)
        throw new Error(`Modules error: ${modulesRes.status}`);

      const [foldersData, modulesData] = await Promise.all([
        foldersRes.json() as Promise<Folder[]>,
        modulesRes.json() as Promise<any[]>,
      ]);

      setFolders(foldersData);
      setModules(
        modulesData.map((m) => ({
          ...m,
          itemsCount: m._count?.flashcards ?? 0,
          folderIds: m.folderId ? [m.folderId] : [],
        })),
      );
    } catch (err) {
      console.error("[Library] fetch error:", err);
      setError("Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack f={1} bg="$background" pt="$4">
      <YStack px="$4" gap="$4" f={1}>
        <SegmentedControl
          options={["Folders", "Modules"]}
          selected={tab}
          onChange={setTab}
        />

        {loading && <Text color="$colorMuted">Loading...</Text>}
        {error && <Text color="$statusDanger">{error}</Text>}

        {tab === 0 ? (
          <FlatList
            data={folders}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
            ListEmptyComponent={
              !loading ? <Text color="$colorMuted">No folders yet</Text> : null
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/folder/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <XStack
                  bg="$backgroundHover"
                  br="$4"
                  p="$4"
                  ai="center"
                  gap="$3"
                >
                  <Avatar circular size="$4" bg="$backgroundCard">
                    {item.icon ? (
                      <Avatar.Image src={item.icon} accessibilityLabel={item.name} />
                    ) : null}
                    <Avatar.Fallback jc="center" ai="center">
                      <Text fontSize="$5">📂</Text>
                    </Avatar.Fallback>
                  </Avatar>
                  <YStack f={1}>
                    <Text fontSize="$5" fontWeight="600" color="$color">
                      {item.name}
                    </Text>
                    {item.moduleIds && item.moduleIds.length > 0 && (
                      <Text fontSize="$3" color="$colorMuted">
                        {item.moduleIds.length} module
                        {item.moduleIds.length !== 1 ? "s" : ""}
                      </Text>
                    )}
                  </YStack>
                </XStack>
              </Pressable>
            )}
          />
        ) : (
          <FlatList
            data={modules}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
            ListEmptyComponent={
              !loading ? <Text color="$colorMuted">No modules yet</Text> : null
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/module/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <YStack bg="$backgroundHover" br="$4" p="$4" gap="$1">
                  <Text fontSize="$5" fontWeight="600" color="$color">
                    {item.name}
                  </Text>
                  <Text fontSize="$3" color="$colorMuted">
                    {item.itemsCount} card{item.itemsCount !== 1 ? "s" : ""}
                  </Text>
                </YStack>
              </Pressable>
            )}
          />
        )}
      </YStack>
    </YStack>
  );
}
