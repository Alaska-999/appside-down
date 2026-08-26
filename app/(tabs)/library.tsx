import { API_BASE_URL } from "@/src/api/config";
import { FolderCard } from "@/src/components/cards/FolderCard";
import { ModuleCard } from "@/src/components/cards/ModuleCard";
import { SegmentedControl } from "@/src/components/common/SegmentedControl";
import {
  FadeTabPanes,
  useFadeTabs,
} from "@/src/components/ui/FadeTabPanes";
import { ScreenBackground } from "@/src/components/ui/ScreenBackground";
import { SearchField } from "@/src/components/ui/SearchField";
import { AppSheet } from "@/src/components/ui/Sheet";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StateCard } from "@/src/components/ui/StateCard";
import { TEXT } from "@/src/constants/typography";
import { Folder, Module } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { usePaginatedCursorList } from "@/src/hooks/usePaginatedCursorList";
import { TAB_BAR_CLEARANCE_GAP, TAB_BAR_HEIGHT } from "@/app/(tabs)/_layout";
import { screenGutter, topPaddingBoost } from "@/tamagui.config";
import { AlignJustify, Check } from "@tamagui/lucide-icons";
import { router, useFocusEffect } from "expo-router";
import { memo, useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spinner, Text, useTheme, XStack, YStack } from "tamagui";

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
      <Spinner size="small" color="$mint" />
    </YStack>
  );
}

function LibrarySkeletonRow() {
  return (
    <XStack height={83} px={screenGutter} py={17} ai="center" gap={16} mb={10}>
      <Skeleton width={40} height={40} borderRadius={13} />
      <YStack f={1} gap={6}>
        <Skeleton height={TEXT.cardTitle} width="70%" />
        <Skeleton height={TEXT.cardMeta} width="45%" />
      </YStack>
    </XStack>
  );
}

function LibrarySkeletonList() {
  return (
    <YStack pt={16}>
      <LibrarySkeletonRow />
      <LibrarySkeletonRow />
      <LibrarySkeletonRow />
    </YStack>
  );
}

const MemoFolderCard = memo(
  FolderCard,
  (prev, next) => prev.folder === next.folder && prev.index === next.index,
);
const MemoModuleCard = memo(
  ModuleCard,
  (prev, next) => prev.module === next.module,
);

const LIST_STYLE = { flex: 1 } as const;

const LIST_CONTENT_STYLE = {
  paddingHorizontal: screenGutter,
  gap: 10,
};

const getRowLayout = (_: unknown, index: number) => ({
  length: 83,
  offset: 93 * index,
  index,
});

const keyById = (item: { id: string }) => item.id;

const FoldersPane = memo(function FoldersPane({
  items,
  loading,
  initialLoading,
  refreshing,
  error,
  loadMore,
  refresh,
  retry,
  search,
  bottomPadding,
}: {
  items: Folder[];
  loading: boolean;
  initialLoading: boolean;
  refreshing: boolean;
  error: boolean;
  loadMore: () => void;
  refresh: () => void;
  retry: () => void;
  search: string;
  bottomPadding: number;
}) {
  const theme = useTheme();
  const contentContainerStyle = useMemo(
    () => ({ ...LIST_CONTENT_STYLE, paddingBottom: bottomPadding }),
    [bottomPadding],
  );
  const renderFolder = useCallback(
    ({ item, index }: { item: Folder; index: number }) => (
      <MemoFolderCard
        folder={item}
        index={index}
        onPress={() =>
          router.push({ pathname: "/folder/[id]", params: { id: item.id } })
        }
      />
    ),
    [],
  );

  return (
    <FlatList
      data={items}
      style={LIST_STYLE}
      keyExtractor={keyById}
      showsVerticalScrollIndicator={false}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      initialNumToRender={4}
      getItemLayout={getRowLayout}
      contentContainerStyle={contentContainerStyle}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.accentGradientStart.get()} />
      }
      ListEmptyComponent={
        initialLoading ? (
          <LibrarySkeletonList />
        ) : error ? (
          <StateCard
            variant="error"
            title="Couldn't load folders"
            subtitle="Looks like a connection hiccup. Your data is safe — try again."
            buttonLabel="Retry"
            onButtonPress={retry}
          />
        ) : (
          <Text color="$colorMuted">
            {search ? "No folders match your search" : "No folders yet"}
          </Text>
        )
      }
      ListFooterComponent={
        <LoadMoreFooter visible={loading && !initialLoading} />
      }
      renderItem={renderFolder}
    />
  );
});

const ModulesPane = memo(function ModulesPane({
  items,
  loading,
  initialLoading,
  refreshing,
  error,
  loadMore,
  refresh,
  retry,
  search,
  sortOrder,
  bottomPadding,
}: {
  items: Module[];
  loading: boolean;
  initialLoading: boolean;
  refreshing: boolean;
  error: boolean;
  loadMore: () => void;
  refresh: () => void;
  retry: () => void;
  search: string;
  sortOrder: SortOption;
  bottomPadding: number;
}) {
  const theme = useTheme();
  const contentContainerStyle = useMemo(
    () => ({ ...LIST_CONTENT_STYLE, paddingBottom: bottomPadding }),
    [bottomPadding],
  );
  const renderModule = useCallback(
    ({ item }: { item: Module }) => (
      <MemoModuleCard
        module={item}
        onPress={() =>
          router.push({ pathname: "/module/[id]", params: { id: item.id } })
        }
      />
    ),
    [],
  );

  return (
    <FlatList
      data={items}
      style={LIST_STYLE}
      keyExtractor={keyById}
      showsVerticalScrollIndicator={false}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      initialNumToRender={4}
      getItemLayout={getRowLayout}
      contentContainerStyle={contentContainerStyle}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.accentGradientStart.get()} />
      }
      ListEmptyComponent={
        initialLoading ? (
          <LibrarySkeletonList />
        ) : error ? (
          <StateCard
            variant="error"
            title="Couldn't load modules"
            subtitle="Looks like a connection hiccup. Your data is safe — try again."
            buttonLabel="Retry"
            onButtonPress={retry}
          />
        ) : (
          <Text color="$colorMuted">
            {search
              ? "No modules match your search"
              : sortOrder === "favs"
                ? "No favorite modules yet"
                : "No modules yet"}
          </Text>
        )
      }
      ListFooterComponent={
        <LoadMoreFooter visible={loading && !initialLoading} />
      }
      renderItem={renderModule}
    />
  );
});

export default function Library() {
  const insets = useSafeAreaInsets();
  const tabs = useFadeTabs(0);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOption>("date");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const tabBarClearance = TAB_BAR_HEIGHT + insets.bottom + TAB_BAR_CLEARANCE_GAP;

  const fetchModulesPage = async (cursor: string | null) => {
    const params = new URLSearchParams({ limit: "20", sort: sortOrder });
    if (search) params.set("search", search);
    if (cursor) params.set("cursor", cursor);
    const res = await protectedFetch(
      `${API_BASE_URL}/modules?${params.toString()}`,
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
      `${API_BASE_URL}/folders?${params.toString()}`,
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
      <YStack f={1} gap="$3" pt={insets.top + topPaddingBoost}>
        <YStack px="$screenX" gap="$3">
          <Text fontSize={TEXT.pageTitle} fontWeight="800" color="$color">
            Library
          </Text>

          <SegmentedControl
            options={["Folders", "Modules"]}
            selected={tabs.index}
            onChange={tabs.onChange}
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

        <FadeTabPanes controller={tabs}>
          <FoldersPane
            items={foldersList.items}
            loading={foldersList.loading}
            initialLoading={foldersList.initialLoading}
            refreshing={foldersList.refreshing}
            error={foldersList.error}
            loadMore={foldersList.loadMore}
            refresh={foldersList.refresh}
            retry={foldersList.retry}
            search={search}
            bottomPadding={tabBarClearance}
          />
          <ModulesPane
            items={modulesList.items}
            loading={modulesList.loading}
            initialLoading={modulesList.initialLoading}
            refreshing={modulesList.refreshing}
            error={modulesList.error}
            loadMore={modulesList.loadMore}
            refresh={modulesList.refresh}
            retry={modulesList.retry}
            search={search}
            sortOrder={sortOrder}
            bottomPadding={tabBarClearance}
          />
        </FadeTabPanes>
      </YStack>

      <AppSheet
        open={sortSheetOpen}
        onOpenChange={setSortSheetOpen}
        title="Sort by"
      >
        <YStack gap="$2" p="$4">
          {SORT_OPTIONS.map((option) =>
            tabs.index === 0 && option.key === "favs" ? null : (
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
