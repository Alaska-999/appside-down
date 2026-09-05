import { API_BASE_URL } from "@/src/api/config";
import { FolderCard, FolderCardModule } from "@/src/components/cards/FolderCard";
import { ModuleCard } from "@/src/components/cards/ModuleCard";
import { SegmentedControl } from "@/src/components/common/SegmentedControl";
import { FadeTabPanes, useFadeTabs } from "@/src/components/ui/FadeTabPanes";
import { IconButton } from "@/src/components/ui/IconButton";
import { ScreenBackground } from "@/src/components/ui/ScreenBackground";
import { SearchField } from "@/src/components/ui/SearchField";
import { AppSheet, SheetRow, SheetRows } from "@/src/components/ui/Sheet";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StateCard } from "@/src/components/ui/StateCard";
import { SearchEmptyState } from "@/src/components/common/SearchEmptyState";
import { Folder, Module } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { usePaginatedCursorList } from "@/src/hooks/usePaginatedCursorList";
import { TAB_BAR_CLEARANCE_GAP, TAB_BAR_HEIGHT } from "@/app/(tabs)/_layout";
import { screenGutter } from "@/tamagui.config";
import {
  AlertTriangle,
  ArrowDownAZ,
  ArrowDownUp,
  Captions,
  Clock,
  FolderPlus,
  Search,
  Star,
} from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import { ComponentType, memo, useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl } from "react-native";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { Spinner, Text, useTheme, XStack, YStack } from "tamagui";

type SortOption = "date" | "az" | "favs";

const SORT_OPTIONS: {
  key: SortOption;
  label: string;
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}[] = [
  { key: "date", label: "Date added", icon: Clock },
  { key: "az", label: "A–Z", icon: ArrowDownAZ },
  { key: "favs", label: "Favorites", icon: Star },
];

type FolderModulesState = {
  items: FolderCardModule[];
  loading: boolean;
};

function LoadMoreFooter({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <YStack py="$3" ai="center">
      <Spinner size="small" color="$mint" />
    </YStack>
  );
}

function LibrarySkeletonList({ height }: { height: number }) {
  return (
    <YStack pt={4} gap={11}>
      <Skeleton height={height} borderRadius={23} />
      <Skeleton height={height} borderRadius={23} />
      <Skeleton height={height} borderRadius={23} />
    </YStack>
  );
}

const MemoModuleCard = memo(
  ModuleCard,
  (prev, next) => prev.module === next.module,
);

const LIST_STYLE = { flex: 1 } as const;

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
  expandedId,
  folderModules,
  onToggle,
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
  expandedId: string | null;
  folderModules: Record<string, FolderModulesState>;
  onToggle: (folder: Folder) => void;
}) {
  const theme = useTheme();
  const contentContainerStyle = useMemo(
    () => ({ paddingHorizontal: screenGutter, gap: 13, paddingBottom: bottomPadding }),
    [bottomPadding],
  );

  const renderFolder = useCallback(
    ({ item, index }: { item: Folder; index: number }) => {
      const state = folderModules[item.id];
      return (
        <FolderCard
          folder={item}
          index={index}
          expanded={expandedId === item.id}
          modules={state?.items}
          modulesLoading={state?.loading}
          onToggle={() => onToggle(item)}
          onPress={() =>
            router.push({ pathname: "/folder/[id]", params: { id: item.id } })
          }
          onModulePress={(moduleId) =>
            router.push({ pathname: "/module/[id]", params: { id: moduleId } })
          }
          onAddModule={() =>
            router.push({
              pathname: "/folder/add-modules",
              params: { folderId: item.id },
            })
          }
          onSettings={() =>
            router.push({ pathname: "/folder/[id]", params: { id: item.id } })
          }
        />
      );
    },
    [expandedId, folderModules, onToggle],
  );

  return (
    <FlatList
      data={items}
      style={LIST_STYLE}
      keyExtractor={keyById}
      showsVerticalScrollIndicator={false}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      initialNumToRender={5}
      contentContainerStyle={contentContainerStyle}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={theme.accentGradientStart.get()}
        />
      }
      ListEmptyComponent={
        initialLoading ? (
          <LibrarySkeletonList height={92} />
        ) : error ? (
          <StateCard
            tone="error"
            icon={AlertTriangle}
            title="Couldn't load folders"
            subtitle="Looks like a connection hiccup. Your data is safe — try again."
            buttonLabel="Retry"
            onButtonPress={retry}
          />
        ) : (
          search ? (
            <SearchEmptyState
              query={search}
              noun="folders"
              onCreate={() => router.push("/folder/create")}
            />
          ) : (
            <StateCard
              tone="empty"
              icon={FolderPlus}
              title="No folders yet"
              subtitle="Group your modules by topic, course or exam."
              buttonLabel="Create a folder"
              onButtonPress={() => router.push("/folder/create")}
            />
          )
        )
      }
      ListFooterComponent={<LoadMoreFooter visible={loading && !initialLoading} />}
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
    () => ({ paddingHorizontal: screenGutter, gap: 11, paddingBottom: bottomPadding }),
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
      initialNumToRender={6}
      contentContainerStyle={contentContainerStyle}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          tintColor={theme.accentGradientStart.get()}
        />
      }
      ListEmptyComponent={
        initialLoading ? (
          <LibrarySkeletonList height={74} />
        ) : error ? (
          <StateCard
            tone="error"
            icon={AlertTriangle}
            title="Couldn't load modules"
            subtitle="Looks like a connection hiccup. Your data is safe — try again."
            buttonLabel="Retry"
            onButtonPress={retry}
          />
        ) : (
          search ? (
            <SearchEmptyState
              query={search}
              noun="modules"
              onCreate={() => router.push("/module/create")}
            />
          ) : sortOrder === "favs" ? (
            <StateCard
              tone="empty"
              icon={Star}
              title="No favorites yet"
              subtitle="Star a module and it will show up here."
            />
          ) : (
            <StateCard
              tone="empty"
              icon={Captions}
              title="No modules yet"
              subtitle="Your first deck is one tap away."
              buttonLabel="Create a module"
              onButtonPress={() => router.push("/module/create")}
            />
          )
        )
      }
      ListFooterComponent={<LoadMoreFooter visible={loading && !initialLoading} />}
      renderItem={renderModule}
    />
  );
});

export default function Library() {
  const screen = useScreenInsets();
  const tabs = useFadeTabs(0);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const [searchOpen, setSearchOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOption>("date");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [folderModules, setFolderModules] = useState<
    Record<string, FolderModulesState>
  >({});
  const tabBarClearance = TAB_BAR_HEIGHT + screen.insets.bottom + TAB_BAR_CLEARANCE_GAP;

  const fetchModulesPage = async (cursor: string | null) => {
    const params = new URLSearchParams({ limit: "20", sort: sortOrder });
    if (debouncedSearch) params.set("search", debouncedSearch);
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
        known: m.progress?.known ?? 0,
        total: m.progress?.total ?? 0,
        folderIds: (m.folders ?? []).map((f: { id: string }) => f.id),
      })),
      nextCursor: page.nextCursor,
    };
  };

  const modulesList = usePaginatedCursorList<Module>(
    fetchModulesPage,
    `${debouncedSearch}|${sortOrder}`,
  );

  const fetchFoldersPage = async (cursor: string | null) => {
    const params = new URLSearchParams({ limit: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (cursor) params.set("cursor", cursor);
    const res = await protectedFetch(
      `${API_BASE_URL}/folders?${params.toString()}`,
    );
    if (!res.ok) throw new Error(`Folders error: ${res.status}`);
    return res.json();
  };

  const foldersList = usePaginatedCursorList<Folder>(fetchFoldersPage, debouncedSearch);

  useFocusEffect(
    useCallback(() => {
      modulesList.reload();
      foldersList.reload();
      setFolderModules({});
    }, [modulesList.reload, foldersList.reload]),
  );

  const loadFolderModules = useCallback(async (folderId: string) => {
    setFolderModules((prev) => ({
      ...prev,
      [folderId]: { items: prev[folderId]?.items ?? [], loading: true },
    }));
    try {
      const res = await protectedFetch(`${API_BASE_URL}/folders/${folderId}`);
      if (!res.ok) throw new Error(`Folder error: ${res.status}`);
      const data = await res.json();
      const items: FolderCardModule[] = (data.modules ?? []).map((m: any) => ({
        id: m.id,
        name: m.name,
        itemsCount: m._count?.flashcards ?? 0,
        isFavorite: m.isFavorite,
      }));
      setFolderModules((prev) => ({
        ...prev,
        [folderId]: { items, loading: false },
      }));
    } catch (err) {
      console.error("[Library] folder modules error:", err);
      setFolderModules((prev) => ({
        ...prev,
        [folderId]: { items: prev[folderId]?.items ?? [], loading: false },
      }));
    }
  }, []);

  const toggleFolder = useCallback(
    (folder: Folder) => {
      setExpandedId((current) => (current === folder.id ? null : folder.id));
      if (expandedId !== folder.id && !folderModules[folder.id]?.items.length) {
        loadFolderModules(folder.id);
      }
    },
    [expandedId, folderModules, loadFolderModules],
  );

  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) setSearch("");
      return !open;
    });
  };

  return (
    <ScreenBackground preset="home">
      <YStack f={1} pt={screen.top}>
        <YStack px="$screenX">
          <XStack ai="center" jc="space-between" gap={12}>
            <Text fontSize={31} fontWeight="800" letterSpacing={-0.62} color="$color">
              Library
            </Text>
            <XStack gap={8}>
              <IconButton
                variant="liquidGlass"
                icon={<Search size={22} color="#EAF7FF" strokeWidth={1.9} />}
                onPress={toggleSearch}
                accessibilityLabel="Search library"
              />
              <IconButton
                variant="liquidGlass"
                icon={<ArrowDownUp size={22} color="#EAF7FF" strokeWidth={1.9} />}
                onPress={() => setSortSheetOpen(true)}
                accessibilityLabel="Sort library"
              />
            </XStack>
          </XStack>

          {searchOpen && (
            <YStack pt={14}>
              <SearchField
                value={search}
                onChangeText={setSearch}
                placeholder="Search your library"
                autoFocus
              />
            </YStack>
          )}

          <YStack pt={14}>
            <SegmentedControl
              options={["Folders", "Modules"]}
              selected={tabs.index}
              onChange={tabs.onChange}
            />
          </YStack>
          <YStack h={22} />
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
            search={debouncedSearch}
            bottomPadding={tabBarClearance}
            expandedId={expandedId}
            folderModules={folderModules}
            onToggle={toggleFolder}
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
            search={debouncedSearch}
            sortOrder={sortOrder}
            bottomPadding={tabBarClearance}
          />
        </FadeTabPanes>
      </YStack>

      <AppSheet open={sortSheetOpen} onOpenChange={setSortSheetOpen} title="Sort by">
        <SheetRows>
          {SORT_OPTIONS.map((option) =>
            tabs.index === 0 && option.key === "favs" ? null : (
              <SheetRow
                key={option.key}
                icon={option.icon}
                label={option.label}
                selected={sortOrder === option.key}
                onPress={() => {
                  setSortOrder(option.key);
                  setSortSheetOpen(false);
                }}
              />
            ),
          )}
        </SheetRows>
      </AppSheet>
    </ScreenBackground>
  );
}
