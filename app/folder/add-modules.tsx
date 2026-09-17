import { API_BASE_URL } from "@/src/api/config";
import { SelectableModuleRow } from "@/src/components/cards/SelectableModuleRow";
import { SearchEmptyState } from "@/src/components/common/SearchEmptyState";
import { AppButton } from "@/src/components/ui/controls/Button";
import { IconButton } from "@/src/components/ui/controls/IconButton";
import { LiquidGlass } from "@/src/components/ui/surface/LiquidGlass";
import { BackgroundMesh } from "@/src/components/ui/background/ScreenBackground";
import { SearchField } from "@/src/components/ui/fields/SearchField";
import { Skeleton } from "@/src/components/ui/feedback/Skeleton";
import { StarGlyph } from "@/src/components/ui/controls/StarGlyph";
import { StateCard } from "@/src/components/ui/feedback/StateCard";
import { StatusBarScrim } from "@/src/components/ui/background/StatusBarScrim";
import { TagChip } from "@/src/components/ui/display/TagChip";
import { AppToast } from "@/src/components/ui/feedback/Toast";
import { ICON_MINT_LIGHT, ICON_ON_GLASS } from "@/src/constants/iconColors";
import {
  LIQUID_GLASS_DARK_BG,
  SCRIM_BASE_MAX,
  SCRIM_BASE_TRANSPARENT,
} from "@/src/constants/rawColors";
import { SURFACE_GLASS_BG_STRONG } from "@/src/constants/surfaceAlpha";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { usePaginatedCursorList } from "@/src/hooks/usePaginatedCursorList";
import { useResourceOnFocus } from "@/src/hooks/useResourceOnFocus";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { hapticTap } from "@/src/utils/haptics";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { screenGutter } from "@/tamagui.config";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { AlertTriangle, Captions, Plus, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import { Spinner, Text, XStack, YStack } from "tamagui";
import { KeyboardBar } from "@/src/components/ui/overlays/KeyboardBar";

type ModuleItem = {
  id: string;
  name: string;
  itemsCount: number;
  starred: boolean;
  folderCount: number;
  inThisFolder: boolean;
};

type Filter = "all" | "noFolder" | "starred";

const ADD_BAR_HEIGHT = 102;
const ADD_FADE_HEIGHT = 56;

function mapModule(raw: any, folderId: string | undefined): ModuleItem {
  const folders: { id: string }[] = raw.folders ?? [];
  return {
    id: raw.id,
    name: raw.name,
    itemsCount: raw._count?.flashcards ?? raw.itemsCount ?? 0,
    starred: !!raw.isFavorite,
    folderCount: folders.length,
    inThisFolder: !!folderId && folders.some((f) => f.id === folderId),
  };
}

function LoadMoreFooter({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <YStack py="$3" ai="center">
      <Spinner size="small" color="$mint" />
    </YStack>
  );
}

export default function AddModules() {
  const screen = useScreenInsets();
  const { folderId, folderName } = useLocalSearchParams<{
    folderId: string;
    folderName?: string;
  }>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const filterInitRef = useRef(false);

  const fetchModulesPage = useCallback(
    async (cursor: string | null) => {
      const params = new URLSearchParams({ limit: "30" });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (cursor) params.set("cursor", cursor);
      const res = await protectedFetch(
        `${API_BASE_URL}/modules?${params.toString()}`,
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const page: { data: any[]; nextCursor: string | null } =
        await res.json();
      return {
        data: (page.data ?? []).map((m) => mapModule(m, folderId)),
        nextCursor: page.nextCursor,
      };
    },
    [debouncedSearch, folderId],
  );

  const modulesList = usePaginatedCursorList<ModuleItem>(
    fetchModulesPage,
    `${folderId}|${debouncedSearch}`,
  );

  useResourceOnFocus([modulesList.reload], () => modulesList.reload(), {
    skipFirstFocus: true,
  });

  useEffect(() => {
    if (filterInitRef.current) return;
    if (modulesList.initialLoading || modulesList.error) return;
    filterInitRef.current = true;
    setFilter(
      modulesList.items.some((m) => m.folderCount === 0 && !m.inThisFolder)
        ? "noFolder"
        : "all",
    );
  }, [modulesList.initialLoading, modulesList.error, modulesList.items]);

  const counts = useMemo(
    () => ({
      all: modulesList.items.length,
      noFolder: modulesList.items.filter((m) => m.folderCount === 0).length,
      starred: modulesList.items.filter((m) => m.starred).length,
    }),
    [modulesList.items],
  );

  const visible = useMemo(() => {
    return modulesList.items.filter((m) => {
      if (filter === "noFolder") return m.folderCount === 0;
      if (filter === "starred") return m.starred;
      return true;
    });
  }, [modulesList.items, filter]);

  const toggleModule = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCount = selectedIds.size;

  const goCreate = () =>
    router.push({
      pathname: "/module/create",
      params: { returnFolderId: folderId, returnFolderName: folderName },
    });

  const handleAdd = async () => {
    if (selectedCount === 0 || !folderId) return;
    setSaving(true);
    try {
      const res = await protectedFetch(
        `${API_BASE_URL}/folders/${folderId}/modules`,
        {
          method: "PATCH",
          body: JSON.stringify({ moduleIds: [...selectedIds] }),
        },
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      router.back();
    } catch (err) {
      console.error("[AddModules] add error:", err);
      setToast("Couldn't add modules. Try again");
    } finally {
      setSaving(false);
    }
  };

  const title = folderName ? `Add to ${folderName}` : "Add modules";
  const chips: {
    key: Filter;
    label: string;
    count: number;
    leading?: boolean;
  }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "noFolder", label: "Not in a folder", count: counts.noFolder },
    { key: "starred", label: "Starred", count: counts.starred, leading: true },
  ];

  return (
    <YStack f={1} bg="$background">
      {/* <BackgroundMesh preset="twilightDuo" /> */}
      {/* <BackgroundMesh preset="finishWarm" /> */}
      {/* <BackgroundMesh preset="crossBeams" /> */}
      {/* <BackgroundMesh preset="tealBeam" /> */}
      <BackgroundMesh preset="twilightDuoLime" />
      {/* <BackgroundMesh preset="auroraTeal" /> */}

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
            {title}
          </Text>
        </XStack>

        <XStack px="$screenX" mb={14} gap={7} flexWrap="wrap">
          {chips.map((chip) => (
            <TagChip
              key={chip.key}
              label={chip.label}
              count={chip.count}
              leading={chip.leading ? <StarGlyph /> : undefined}
              variant={filter === chip.key ? "on" : "default"}
              onPress={() => {
                hapticTap();
                setFilter(chip.key);
              }}
            />
          ))}
        </XStack>

        <XStack px="$screenX" mb={14}>
          <SearchField
            f={1}
            value={search}
            onChangeText={setSearch}
            placeholder="Search your modules"
          />
        </XStack>

        {modulesList.initialLoading ? (
          <YStack px="$screenX" gap={11}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={74} borderRadius="$card" />
            ))}
          </YStack>
        ) : modulesList.error ? (
          <YStack px="$screenX">
            <StateCard
              tone="error"
              icon={AlertTriangle}
              title="Couldn't load modules"
              subtitle="Looks like a connection hiccup. Your data is safe — try again."
              buttonLabel="Try again"
              onButtonPress={modulesList.retry}
            />
          </YStack>
        ) : (
          <FlatList
            data={visible}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onEndReached={modulesList.loadMore}
            onEndReachedThreshold={0.4}
            contentContainerStyle={{
              paddingHorizontal: screenGutter,
              paddingBottom: ADD_BAR_HEIGHT + screen.insets.bottom + 24,
              gap: 11,
            }}
            ListEmptyComponent={
              debouncedSearch ? (
                <SearchEmptyState
                  mt={20}
                  query={debouncedSearch}
                  noun="modules"
                  onCreate={goCreate}
                />
              ) : (
                <StateCard
                  tone="empty"
                  icon={Captions}
                  mt={20}
                  title={
                    filter === "starred"
                      ? "No starred modules"
                      : "Nothing to add"
                  }
                  subtitle={
                    filter === "starred"
                      ? "Star a module and it will show up here."
                      : "All your modules are already in this folder."
                  }
                />
              )
            }
            renderItem={({ item }) => (
              <SelectableModuleRow
                name={item.name}
                itemsCount={item.itemsCount}
                starred={item.starred}
                locked={item.inThisFolder}
                selected={selectedIds.has(item.id)}
                onToggle={() => toggleModule(item.id)}
              />
            )}
            ListFooterComponent={
              debouncedSearch && visible.length === 0 ? null : (
                <YStack mt={4} gap={4}>
                  <LoadMoreFooter
                    visible={
                      modulesList.loading && !modulesList.initialLoading
                    }
                  />
                  <AppButton
                    variant="glass"
                    icon={
                      <Plus
                        size={18}
                        color={ICON_MINT_LIGHT}
                        strokeWidth={2.2}
                      />
                    }
                    onPress={goCreate}
                  >
                    Create a new module
                  </AppButton>
                </YStack>
              )
            }
          />
        )}
      </YStack>

      <KeyboardBar />
      <StatusBarScrim />

      <LinearGradient
        pointerEvents="none"
        colors={[SCRIM_BASE_TRANSPARENT, SCRIM_BASE_MAX]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: ADD_BAR_HEIGHT + screen.insets.bottom - 34,
          height: ADD_FADE_HEIGHT,
        }}
      />
      <YStack
        pos="absolute"
        left={0}
        right={0}
        bottom={0}
        pt={12}
        px="$screenX"
        pb={Math.max(screen.insets.bottom, 18) + 16}
        overflow="hidden"
      >
        <LiquidGlass intensity={60} backgroundColor={LIQUID_GLASS_DARK_BG} />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: SURFACE_GLASS_BG_STRONG,
          }}
        />
        <AppButton
          variant="primary"
          size="lg"
          disabled={selectedCount === 0}
          loading={saving}
          onPress={handleAdd}
        >
          {selectedCount === 0
            ? "Add modules"
            : `Add ${selectedCount} module${selectedCount !== 1 ? "s" : ""}`}
        </AppButton>
      </YStack>

      <AppToast
        open={!!toast}
        message={toast ?? ""}
        onDismiss={() => setToast(null)}
      />
    </YStack>
  );
}
