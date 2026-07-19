import { FolderCard } from "@/src/components/cards/FolderCard";
import { ModuleCard } from "@/src/components/cards/ModuleCard";
import { SegmentedControl } from "@/src/components/common/SegmentedControl";
import { ScreenBackground } from "@/src/components/ui/ScreenBackground";
import { AppSheet } from "@/src/components/ui/Sheet";
import { TEXT } from "@/src/constants/typography";
import { Folder, Module } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { AlignJustify, Check, Search } from "@tamagui/lucide-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Input, Text, XStack, YStack } from "tamagui";

type SortOption = "date" | "az" | "favs";

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "date", label: "Date added" },
  { key: "az", label: "A–Z" },
  { key: "favs", label: "Favorites" },
];

export default function Library() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(0);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOption>("date");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

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
      setError(null);
    } catch (err) {
      console.error("[Library] fetch error:", err);
      setError("Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  const filteredFolders = useMemo(() => {
    let result = folders.filter((f) =>
      f.name.toLowerCase().includes(search.toLowerCase()),
    );
    if (sortOrder === "az")
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    if (sortOrder === "date")
      result = [...result].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    return result;
  }, [folders, search, sortOrder]);

  const filteredModules = useMemo(() => {
    let result = modules.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()),
    );
    if (sortOrder === "az")
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    if (sortOrder === "date")
      result = [...result].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    if (sortOrder === "favs") result = result.filter((m) => m.isFavorite);
    return result;
  }, [modules, search, sortOrder]);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.key === sortOrder)?.label ?? "Sort";

  return (
    <ScreenBackground>
      <YStack f={1} gap="$3" pt={insets.top}>
        <YStack px="$screenX" gap="$3">
          <Text fontSize={TEXT.pageTitle} fontWeight="800" color="$color">
            Library
          </Text>

          <SegmentedControl
            options={["Folders", "Modules"]}
            selected={tab}
            onChange={setTab}
          />

          <XStack gap="$2" ai="center">
            <XStack
              f={1}
              bg="$glassBg"
              br={999}
              px={19}
              py={14}
              ai="center"
              gap={9}
              borderWidth={1}
              borderColor="$glassBorder"
            >
              <Search size={20} color="$colorMuted" opacity={0.6} />
              <Input
                f={1}
                unstyled
                placeholder="Search..."
                value={search}
                onChangeText={setSearch}
                fontSize={TEXT.pill}
                color="$color"
                placeholderTextColor="$colorMuted"
              />
            </XStack>

            <Pressable onPress={() => setSortSheetOpen(true)}>
              <XStack
                bg="$glassBg"
                br={999}
                px={14}
                py={14}
                ai="center"
                gap={7}
                borderWidth={1}
                borderColor="$glassBorder"
              >
                <AlignJustify size={16} color="$color" />
                <Text fontSize={TEXT.pill} fontWeight="600" color="$color">
                  {currentSortLabel}
                </Text>
              </XStack>
            </Pressable>
          </XStack>

          {loading && <Text color="$colorMuted">Loading...</Text>}
          {error && <Text color="$statusDanger">{error}</Text>}
        </YStack>

        {tab === 0 ? (
          <FlatList
            data={filteredFolders}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 19, gap: 10, paddingBottom: 32 }}
            ListEmptyComponent={
              !loading ? (
                <Text color="$colorMuted">
                  {search ? "No folders match your search" : "No folders yet"}
                </Text>
              ) : null
            }
            renderItem={({ item, index }) => (
              <FolderCard
                folder={item}
                index={index}
                onPress={() =>
                  router.push({
                    pathname: "/folder/[id]",
                    params: { id: item.id },
                  })
                }
              />
            )}
          />
        ) : (
          <FlatList
            data={filteredModules}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 19, gap: 10, paddingBottom: 32 }}
            ListEmptyComponent={
              !loading ? (
                <Text color="$colorMuted">
                  {search
                    ? "No modules match your search"
                    : sortOrder === "favs"
                      ? "No favorite modules yet"
                      : "No modules yet"}
                </Text>
              ) : null
            }
            renderItem={({ item }) => (
              <ModuleCard
                module={item}
                onPress={() =>
                  router.push({
                    pathname: "/module/[id]",
                    params: { id: item.id },
                  })
                }
              />
            )}
          />
        )}
      </YStack>

      <AppSheet
        open={sortSheetOpen}
        onOpenChange={setSortSheetOpen}
        title="Sort by"
        snapPoints={[30]}
        plain
      >
        <YStack gap="$2" p="$4">
          {SORT_OPTIONS.map((option) =>
            tab === 0 && option.key === "favs" ? null : (
              <Pressable
                key={option.key}
                onPress={() => {
                  setSortOrder(option.key);
                  setSortSheetOpen(false);
                }}
              >
                <XStack
                  bg={
                    sortOrder === option.key ? "$glassBgStrong" : "transparent"
                  }
                  br={19}
                  px={19}
                  py={16}
                  ai="center"
                  jc="space-between"
                >
                  <Text fontSize="$5" fontWeight="600" color="$color">
                    {option.label}
                  </Text>
                  {sortOrder === option.key && (
                    <Check size={18} color="$accentGradientStart" />
                  )}
                </XStack>
              </Pressable>
            ),
          )}
        </YStack>
      </AppSheet>
    </ScreenBackground>
  );
}
