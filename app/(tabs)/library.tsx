import { SegmentedControl } from "@/src/components/common/SegmentedControl";
import { Folder, Module } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import {
  AlignJustify,
  Check,
  Globe,
  Lock,
  Search,
  Star,
} from "@tamagui/lucide-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar, Input, Sheet, Text, XStack, YStack } from "tamagui";

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
    <YStack f={1} bg="$background" pt={insets.top}>
      <YStack px="$4" gap="$3" f={1}>
        {/* нативний хедер таб-бару вимкнено (headerShown: false) — тайтл тепер малює сам екран */}
        <Text fontSize="$7" fontWeight="bold" color="$color">
          Library
        </Text>
        <SegmentedControl
          options={["Folders", "Modules"]}
          selected={tab}
          onChange={setTab}
        />

        {/* Search + sort row */}
        <XStack gap="$2" ai="center">
          <XStack
            f={1}
            bg="$backgroundHover"
            br="$10"
            px="$3"
            ai="center"
            gap="$2"
            borderWidth={1}
            borderColor="$borderColor"
            h={40}
          >
            <Search size={16} color="$colorMuted" />
            <Input
              f={1}
              unstyled
              placeholder="Search..."
              value={search}
              onChangeText={setSearch}
              fontSize="$4"
              color="$color"
              placeholderTextColor="$colorMuted"
            />
          </XStack>

          <Pressable onPress={() => setSortSheetOpen(true)}>
            <XStack
              bg="$backgroundHover"
              borderWidth={1}
              borderColor="$borderColor"
              br="$10"
              px="$3"
              h={40}
              ai="center"
              gap="$1"
            >
              <AlignJustify size={14} color="$colorMuted" />
              <Text fontSize="$3" color="$colorMuted">
                {currentSortLabel}
              </Text>
            </XStack>
          </Pressable>
        </XStack>

        {loading && <Text color="$colorMuted">Loading...</Text>}
        {error && <Text color="$statusDanger">{error}</Text>}

        {tab === 0 ? (
          <FlatList
            data={filteredFolders}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
            ListEmptyComponent={
              !loading ? (
                <Text color="$colorMuted">
                  {search ? "No folders match your search" : "No folders yet"}
                </Text>
              ) : null
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
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Avatar circular size="$4" bg="$backgroundCard">
                    {item.icon ? (
                      <Avatar.Image
                        src={item.icon}
                        accessibilityLabel={item.name}
                      />
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
            data={filteredModules}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
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
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/module/[id]",
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
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <YStack f={1} gap="$1">
                    <Text fontSize="$5" fontWeight="600" color="$color">
                      {item.name}
                    </Text>
                    <XStack ai="center" gap="$1.5">
                      <Text fontSize="$3" color="$colorMuted">
                        {item.itemsCount} card{item.itemsCount !== 1 ? "s" : ""}
                      </Text>
                      <Text color="$borderColor">·</Text>
                      {item.isPublic ? (
                        <Globe size={12} color="$colorMuted" />
                      ) : (
                        <Lock size={12} color="$colorMuted" />
                      )}
                      <Text fontSize="$3" color="$colorMuted">
                        {item.isPublic ? "Public" : "Private"}
                      </Text>
                      {item.user?.username && (
                        <>
                          <Text color="$borderColor">·</Text>
                          <Text fontSize="$3" color="$colorMuted">
                            by {item.user.username}
                          </Text>
                        </>
                      )}
                    </XStack>
                  </YStack>
                  {item.isFavorite && (
                    <Star
                      size={16}
                      color="$statusWarning"
                      fill="$statusWarning"
                    />
                  )}
                </XStack>
              </Pressable>
            )}
          />
        )}
      </YStack>

      <Sheet
        modal
        open={sortSheetOpen}
        onOpenChange={setSortSheetOpen}
        snapPoints={[30]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay bg="$pureBlack" opacity={0.5} />
        <Sheet.Handle />
        <Sheet.Frame p="$4" bg="$background" gap="$4">
          <Text fontSize="$6" fontWeight="bold">
            Sort by
          </Text>
          <YStack gap="$2">
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
                    bg="$buttonSecondaryBg"
                    br="$4"
                    px="$4"
                    py="$3"
                    ai="center"
                  >
                    <Text f={1} fontSize="$5" color="$color">
                      {option.label}
                    </Text>
                    {sortOrder === option.key && (
                      <Check size={18} color="$color" />
                    )}
                  </XStack>
                </Pressable>
              ),
            )}
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </YStack>
  );
}
