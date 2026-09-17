import { API_BASE_URL } from "@/src/api/config";
import { SearchEmptyState } from "@/src/components/common/SearchEmptyState";
import { IconButton } from "@/src/components/ui/IconButton";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { ScrollToTopButton } from "@/src/components/ui/ScrollToTopButton";
import { SearchField } from "@/src/components/ui/SearchField";
import { SheetRow } from "@/src/components/ui/Sheet";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StateCard } from "@/src/components/ui/StateCard";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { ICON_ON_GLASS } from "@/src/constants/iconColors";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { usePaginatedCursorList } from "@/src/hooks/usePaginatedCursorList";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { useFolderSelectionStore } from "@/src/store/useFolderSelectionStore";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { screenGutter } from "@/tamagui.config";
import { router, useLocalSearchParams } from "expo-router";
import { AlertTriangle, Folder, X } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { Spinner, Text, XStack, YStack } from "tamagui";

type FolderOption = { id: string; name: string };

function LoadMoreFooter({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <YStack py="$3" ai="center">
      <Spinner size="small" color="$mint" />
    </YStack>
  );
}

export default function FolderPick() {
  const screen = useScreenInsets();
  const { currentFolderId } = useLocalSearchParams<{
    currentFolderId?: string;
  }>();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const listRef = useRef<FlatList<FolderOption>>(null);
  const scrollY = useSharedValue(0);

  const fetchFoldersPage = useCallback(
    async (cursor: string | null) => {
      const params = new URLSearchParams({ limit: "30" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (cursor) params.set("cursor", cursor);
      const res = await protectedFetch(
        `${API_BASE_URL}/folders?${params.toString()}`,
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const page = await res.json();
      return {
        data: (page.data ?? []).map((f: FolderOption) => ({
          id: f.id,
          name: f.name,
        })),
        nextCursor: page.nextCursor,
      };
    },
    [debouncedSearch],
  );

  const foldersList = usePaginatedCursorList<FolderOption>(
    fetchFoldersPage,
    debouncedSearch,
  );

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = event.nativeEvent.contentOffset.y;
    },
    [scrollY],
  );

  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const selectFolder = (folder: FolderOption | null) => {
    useFolderSelectionStore.getState().setResult({
      folderId: folder?.id,
      folderName: folder?.name,
    });
    router.back();
  };

  const bottomPadding = Math.max(screen.insets.bottom, 18) + 16;

  return (
    <YStack f={1} bg="$background">
      <BackgroundMesh preset="twilightDuoLime" />

      <YStack f={1} pt={screen.top}>
        <XStack px="$screenX" mb={18} ai="center" gap={10}>
          <IconButton
            variant="liquidGlass"
            icon={<X size={22} color={ICON_ON_GLASS} strokeWidth={1.9} />}
            onPress={() => router.back()}
            accessibilityLabel="Close"
          />
          <Text
            f={1}
            fontSize={19}
            fontWeight="800"
            color="$color"
            numberOfLines={1}
          >
            Folder
          </Text>
        </XStack>

        <XStack px="$screenX" mb={14}>
          <SearchField
            f={1}
            value={search}
            onChangeText={setSearch}
            placeholder="Search your folders"
          />
        </XStack>

        {foldersList.initialLoading ? (
          <YStack px="$screenX" gap={10}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={62} borderRadius="$cardSoft" />
            ))}
          </YStack>
        ) : foldersList.error ? (
          <YStack px="$screenX">
            <StateCard
              tone="error"
              icon={AlertTriangle}
              title="Couldn't load folders"
              subtitle="Looks like a connection hiccup. Your data is safe — try again."
              buttonLabel="Try again"
              onButtonPress={foldersList.retry}
            />
          </YStack>
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList
              ref={listRef}
              data={foldersList.items}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              onScroll={onScroll}
              scrollEventThrottle={16}
              onEndReached={foldersList.loadMore}
              onEndReachedThreshold={0.4}
              contentContainerStyle={{
                paddingHorizontal: screenGutter,
                paddingBottom: bottomPadding,
                gap: 10,
              }}
              ListHeaderComponent={
                <YStack
                  br="$cardSoft"
                  overflow="hidden"
                  mb={10}
                  pos="relative"
                >
                  <SheetRow
                    icon={Folder}
                    label="No folder"
                    tone="surface"
                    selected={!currentFolderId}
                    onPress={() => selectFolder(null)}
                  />
                </YStack>
              }
              ListEmptyComponent={
                debouncedSearch ? (
                  <SearchEmptyState
                    mt={20}
                    query={debouncedSearch}
                    noun="folders"
                  />
                ) : (
                  <StateCard
                    tone="empty"
                    icon={Folder}
                    mt={20}
                    title="No folders yet"
                    subtitle="Group your modules by topic, course or exam."
                  />
                )
              }
              renderItem={({ item }) => (
                <YStack br="$cardSoft" overflow="hidden" pos="relative">
                  <SheetRow
                    icon={Folder}
                    label={item.name}
                    tone="surface"
                    selected={currentFolderId === item.id}
                    onPress={() => selectFolder(item)}
                  />
                </YStack>
              )}
              ListFooterComponent={
                <LoadMoreFooter
                  visible={
                    foldersList.loading && !foldersList.initialLoading
                  }
                />
              }
            />
            <ScrollToTopButton
              scrollY={scrollY}
              bottomOffset={bottomPadding}
              onPress={scrollToTop}
            />
          </View>
        )}
      </YStack>

      <StatusBarScrim />
    </YStack>
  );
}
