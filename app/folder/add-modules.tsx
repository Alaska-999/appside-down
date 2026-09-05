import { API_BASE_URL } from "@/src/api/config";
import { FolderAddRow } from "@/src/components/cards/FolderEditRow";
import { SelectableModuleRow } from "@/src/components/cards/SelectableModuleRow";
import { SearchEmptyState } from "@/src/components/common/SearchEmptyState";
import { AppButton } from "@/src/components/ui/Button";
import { IconButton } from "@/src/components/ui/IconButton";
import { LiquidGlass } from "@/src/components/ui/LiquidGlass";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { ICON_LIME_LIGHT } from "@/src/constants/iconColors";
import { SearchField } from "@/src/components/ui/SearchField";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StateCard } from "@/src/components/ui/StateCard";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { TagChip } from "@/src/components/ui/TagChip";
import { AppToast } from "@/src/components/ui/Toast";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { hapticTap } from "@/src/utils/haptics";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { screenGutter } from "@/tamagui.config";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { AlertTriangle, Captions, Plus, Star, X } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

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

export default function AddModules() {
  const screen = useScreenInsets();
  const { folderId, folderName } = useLocalSearchParams<{
    folderId: string;
    folderName?: string;
  }>();
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      fetchModules();
    }, [folderId]),
  );

  const fetchModules = async () => {
    const isFirstLoad = !hasLoadedRef.current;
    if (isFirstLoad) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await protectedFetch(`${API_BASE_URL}/modules?limit=50`);
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const page: { data: any[] } = await res.json();
      const items = (page.data ?? []).map((m) => mapModule(m, folderId));
      setModules(items);
      if (filter === null) {
        setFilter(
          items.some((m) => m.folderCount === 0 && !m.inThisFolder)
            ? "noFolder"
            : "all",
        );
      }
      hasLoadedRef.current = true;
    } catch (err) {
      console.error("[AddModules] fetch error:", err);
      if (isFirstLoad) setError("Failed to load modules");
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  };

  const counts = useMemo(
    () => ({
      all: modules.length,
      noFolder: modules.filter((m) => m.folderCount === 0).length,
      starred: modules.filter((m) => m.starred).length,
    }),
    [modules],
  );

  const visible = useMemo(() => {
    const byFilter = modules.filter((m) => {
      if (filter === "noFolder") return m.folderCount === 0;
      if (filter === "starred") return m.starred;
      return true;
    });
    const q = debouncedSearch.toLowerCase();
    return q
      ? byFilter.filter((m) => m.name.toLowerCase().includes(q))
      : byFilter;
  }, [modules, filter, debouncedSearch]);

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
      params: { returnFolderId: folderId },
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
      <BackgroundMesh preset="folder" />

      <YStack f={1} pt={screen.top}>
        <XStack px="$screenX" mb={18} ai="center" gap={10}>
          <IconButton
            variant="liquidGlass"
            icon={<X size={22} color="#EAF7FF" strokeWidth={1.9} />}
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
              leading={
                chip.leading ? (
                  <Star
                    size={13}
                    color={ICON_LIME_LIGHT}
                    fill={ICON_LIME_LIGHT}
                    strokeWidth={1.9}
                  />
                ) : undefined
              }
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

        {loading ? (
          <YStack px="$screenX" gap={11}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} height={74} borderRadius="$card" />
            ))}
          </YStack>
        ) : error ? (
          <YStack px="$screenX">
            <StateCard
              tone="error"
              icon={AlertTriangle}
              title="Couldn't load modules"
              subtitle="Looks like a connection hiccup. Your data is safe — try again."
              buttonLabel="Try again"
              onButtonPress={fetchModules}
            />
          </YStack>
        ) : (
          <FlatList
            data={visible}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
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
                <YStack mt={4}>
                  <FolderAddRow
                    icon={Plus}
                    label="Create a new module"
                    onPress={goCreate}
                  />
                </YStack>
              )
            }
          />
        )}
      </YStack>

      <StatusBarScrim />

      <LinearGradient
        pointerEvents="none"
        colors={["rgba(8,9,12,0)", "rgba(8,9,12,0.9)"]}
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
        <LiquidGlass intensity={60} backgroundColor="rgba(14,22,26,0.92)" />
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: "rgba(220,255,245,0.1)",
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
