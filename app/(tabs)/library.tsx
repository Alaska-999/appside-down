import { FolderCard } from "@/src/components/cards/FolderCard";
import { ModuleCard } from "@/src/components/cards/ModuleCard";
import { SegmentedControl } from "@/src/components/common/SegmentedControl";
import { ScreenBackground } from "@/src/components/ui/ScreenBackground";
import { SearchField } from "@/src/components/ui/SearchField";
import { AppSheet } from "@/src/components/ui/Sheet";
import { TEXT } from "@/src/constants/typography";
import { Folder, Module } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { usePaginatedCursorList } from "@/src/hooks/usePaginatedCursorList";
import { AlignJustify, Check } from "@tamagui/lucide-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";

type SortOption = "date" | "az" | "favs";

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "date", label: "Date added" },
  { key: "az", label: "A–Z" },
  { key: "favs", label: "Favorites" },
];

function LoadMoreFooter({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <YStack py="$3" ai="center">
      <ActivityIndicator />
    </YStack>
  );
}

export default function Library() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOption>("date");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);

  const fetchModulesPage = async (cursor: string | null) => {
    const params = new URLSearchParams({ limit: "20", sort: sortOrder });
    if (search) params.set("search", search);
    if (cursor) params.set("cursor", cursor);
    const res = await protectedFetch(
      `${process.env.EXPO_PUBLIC_API_URL}/modules?${params.toString()}`,
    );
    if (!res.ok) throw new Error(`Modules error: ${res.status}`);
    const page = await res.json();
    return {
      data: page.data.map((m: any) => ({
        ...m,
        itemsCount: m._count?.flashcards ?? 0,
        folderIds: m.folderId ? [m.folderId] : [],
      })),
      nextCursor: page.nextCursor,
    };
  };

  const modulesList = usePaginatedCursorList<Module>(
    fetchModulesPage,
    `${search}|${sortOrder}`,
  );

  const fetchFoldersPage = async (cursor: string | null) => {
    const params = new URLSearchParams({ limit: "20" });
    if (search) params.set("search", search);
    if (cursor) params.set("cursor", cursor);
    const res = await protectedFetch(
      `${process.env.EXPO_PUBLIC_API_URL}/folders?${params.toString()}`,
    );
    if (!res.ok) throw new Error(`Folders error: ${res.status}`);
    return res.json();
  };

  const foldersList = usePaginatedCursorList<Folder>(fetchFoldersPage, search);

  useFocusEffect(
    useCallback(() => {
      modulesList.refresh();
      foldersList.refresh();
    }, [modulesList.refresh, foldersList.refresh]),
  );

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
            <SearchField value={search} onChangeText={setSearch} f={1} />

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
        </YStack>

        {tab === 0 ? (
          <FlatList
            data={foldersList.items}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            onEndReached={foldersList.loadMore}
            onEndReachedThreshold={0.4}
            initialNumToRender={4}
            getItemLayout={(_, index) => ({
              length: 83,
              offset: 93 * index,
              index,
            })}
            contentContainerStyle={{
              paddingHorizontal: 19,
              gap: 10,
              paddingBottom: 32,
            }}
            ListEmptyComponent={
              !foldersList.initialLoading ? (
                <Text color="$colorMuted">
                  {search ? "No folders match your search" : "No folders yet"}
                </Text>
              ) : null
            }
            ListFooterComponent={
              <LoadMoreFooter
                visible={foldersList.loading && !foldersList.initialLoading}
              />
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
            data={modulesList.items}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            onEndReached={modulesList.loadMore}
            onEndReachedThreshold={0.4}
            initialNumToRender={4}
            getItemLayout={(_, index) => ({
              length: 83,
              offset: 93 * index,
              index,
            })}
            contentContainerStyle={{
              paddingHorizontal: 19,
              gap: 10,
              paddingBottom: 32,
            }}
            ListEmptyComponent={
              !modulesList.initialLoading ? (
                <Text color="$colorMuted">
                  {search
                    ? "No modules match your search"
                    : sortOrder === "favs"
                      ? "No favorite modules yet"
                      : "No modules yet"}
                </Text>
              ) : null
            }
            ListFooterComponent={
              <LoadMoreFooter
                visible={modulesList.loading && !modulesList.initialLoading}
              />
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
