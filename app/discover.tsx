import { API_BASE_URL } from "@/src/api/config";
import {
  PublicModuleResult,
  PublicModuleRow,
} from "@/src/components/cards/PublicModuleRow";
import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { SearchEmptyState } from "@/src/components/common/SearchEmptyState";
import { ScreenBackground } from "@/src/components/ui/background/ScreenBackground";
import { AppButton } from "@/src/components/ui/controls/Button";
import { IconButton } from "@/src/components/ui/controls/IconButton";
import { ScrollToTopButton } from "@/src/components/ui/controls/ScrollToTopButton";
import { FilterChip } from "@/src/components/ui/display/FilterChip";
import { Skeleton } from "@/src/components/ui/feedback/Skeleton";
import { StateCard } from "@/src/components/ui/feedback/StateCard";
import { SearchField } from "@/src/components/ui/fields/SearchField";
import { KeyboardBar } from "@/src/components/ui/overlays/KeyboardBar";
import { ICON_SUBTLE } from "@/src/constants/iconColors";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { usePaginatedCursorList } from "@/src/hooks/usePaginatedCursorList";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { screenGutter } from "@/tamagui.config";
import { router } from "expo-router";
import { AlertTriangle, ArrowDownUp, Compass } from "lucide-react-native";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { useTheme, XStack, YStack } from "tamagui";

const SIZE_FILTERS = ["Short", "Medium", "Large"] as const;

const SKELETON_HEIGHT = 92;

function DiscoverSkeletonList() {
  return (
    <YStack pt={4} gap={11}>
      <Skeleton height={SKELETON_HEIGHT} borderRadius="$card" />
      <Skeleton height={SKELETON_HEIGHT} borderRadius="$card" />
      <Skeleton height={SKELETON_HEIGHT} borderRadius="$card" />
    </YStack>
  );
}

function LoadMoreFooter({
  visible,
  loading,
  onPress,
}: {
  visible: boolean;
  loading: boolean;
  onPress: () => void;
}) {
  if (!visible) return null;
  return (
    <YStack py="$3" ai="center">
      <AppButton variant="glass" size="sm" loading={loading} onPress={onPress}>
        Show more
      </AppButton>
    </YStack>
  );
}

export default function DiscoverScreen() {
  const screen = useScreenInsets();
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const searchPending = search.trim() !== debouncedSearch;
  const scrollY = useSharedValue(0);
  const listRef = useRef<FlatList<PublicModuleResult>>(null);

  const fetchPage = useCallback(
    async (cursor: string | null) => {
      const params = new URLSearchParams({ limit: "20", excludeOwn: "true" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (cursor) params.set("cursor", cursor);
      const res = await protectedFetch(
        `${API_BASE_URL}/modules/public?${params.toString()}`,
      );
      if (!res.ok) throw new Error(`Public error: ${res.status}`);
      return res.json();
    },
    [debouncedSearch],
  );

  const list = usePaginatedCursorList<PublicModuleResult>(
    fetchPage,
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

  const openModule = (id: string) => {
    router.push({ pathname: "/module/[id]", params: { id } });
  };

  return (
    <ScreenBackground preset="twilightDuoLime">
      <YStack f={1}>
        <ScreenHeader title="Discover" />

        <YStack px="$screenX" gap={14}>
          <SearchField
            value={search}
            onChangeText={setSearch}
            placeholder="Search public modules"
          />

          <XStack ai="center" jc="space-between" gap={8} pt={8} pb={8}>
            <XStack ai="center" gap={8} flexWrap="wrap" f={1}>
              {SIZE_FILTERS.map((label) => (
                <FilterChip key={label} label={label} disabled />
              ))}
            </XStack>
            <IconButton
              variant="liquidGlass"
              disabled
              icon={
                <ArrowDownUp size={20} color={ICON_SUBTLE} strokeWidth={1.9} />
              }
              accessibilityLabel="Sort discover, coming soon"
            />
          </XStack>
        </YStack>

        <YStack f={1} pos="relative">
          <FlatList
            ref={listRef}
            data={list.items}
            keyExtractor={(m) => m.id}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScroll={onScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingHorizontal: screenGutter,
              gap: 11,
              paddingTop: 4,
              paddingBottom: screen.bottom,
            }}
            renderItem={({ item }) => (
              <PublicModuleRow
                module={item}
                onPress={() => openModule(item.id)}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={list.refreshing}
                onRefresh={list.refresh}
                tintColor={theme.accentGradientStart.get()}
              />
            }
            ListEmptyComponent={
              list.initialLoading || searchPending ? (
                <DiscoverSkeletonList />
              ) : list.error ? (
                <StateCard
                  tone="error"
                  icon={AlertTriangle}
                  title="Couldn't load modules"
                  subtitle="Looks like a connection hiccup. Your data is safe — try again."
                  buttonLabel="Try again"
                  onButtonPress={list.retry}
                />
              ) : debouncedSearch ? (
                <SearchEmptyState query={debouncedSearch} noun="modules" />
              ) : (
                <StateCard
                  tone="empty"
                  icon={Compass}
                  title="Nothing to discover yet"
                  subtitle="Public modules from other learners will show up here."
                />
              )
            }
            ListFooterComponent={
              <LoadMoreFooter
                visible={list.hasMore && !list.initialLoading}
                loading={list.loading}
                onPress={list.loadMore}
              />
            }
          />
          <ScrollToTopButton
            scrollY={scrollY}
            bottomOffset={screen.bottom}
            onPress={scrollToTop}
          />
        </YStack>
      </YStack>
      <KeyboardBar />
    </ScreenBackground>
  );
}
