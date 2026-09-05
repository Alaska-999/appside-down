import { API_BASE_URL } from "@/src/api/config";
import { SelectableModuleRow } from "@/src/components/cards/SelectableModuleRow";
import { AppButton } from "@/src/components/ui/Button";
import { IconButton } from "@/src/components/ui/IconButton";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { SearchField } from "@/src/components/ui/SearchField";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StateCard } from "@/src/components/ui/StateCard";
import { SearchEmptyState } from "@/src/components/common/SearchEmptyState";
import { AppToast } from "@/src/components/ui/Toast";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { screenGutter } from "@/tamagui.config";
import { AlertTriangle, Captions, ChevronLeft } from "lucide-react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { FlatList } from "react-native";
import { Text, View, XStack, YStack } from "tamagui";

function AddModulesSkeletonRow() {
  return <Skeleton height={74} borderRadius={23} />;
}

type ModuleItem = {
  id: string;
  name: string;
  itemsCount: number;
  isPublic?: boolean;
  selected: boolean;
};

function mapModule(raw: any): ModuleItem {
  return {
    id: raw.id,
    name: raw.name,
    itemsCount: raw._count?.flashcards ?? raw.itemsCount ?? 0,
    isPublic: raw.isPublic,
    selected: false,
  };
}

export default function AddModules() {
  const screen = useScreenInsets();
  const { folderId, folderName } = useLocalSearchParams<{
    folderId: string;
    folderName?: string;
  }>();
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      fetchAvailableModules();
    }, [folderId]),
  );

  const fetchAvailableModules = async () => {
    const isFirstLoad = !hasLoadedRef.current;
    if (isFirstLoad) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await protectedFetch(`${API_BASE_URL}/modules?limit=50`, {
        method: "GET",
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const page: { data: any[] } = await res.json();
      const raw: any[] = page.data ?? [];
      const available = raw
        .filter((m) => {
          const isAlreadyInThisFolder = m.folders?.some(
            (f: any) => f.id === folderId,
          );
          return !isAlreadyInThisFolder;
        })
        .map(mapModule);
      setModules(available);
      hasLoadedRef.current = true;
    } catch (err) {
      console.error("[AddModules] fetch error:", err);
      if (isFirstLoad) setError("Failed to load modules");
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  };

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m)),
    );
  };

  const selectedIds = modules.filter((m) => m.selected).map((m) => m.id);

  const handleAdd = async () => {
    if (selectedIds.length === 0 || !folderId) return;
    setSaving(true);
    try {
      const response = await protectedFetch(
        `${API_BASE_URL}/folders/${folderId}/modules`,
        {
          method: "PATCH",
          body: JSON.stringify({ moduleIds: selectedIds }),
        },
      );

      if (!response.ok) {
        setToast("Couldn't add some modules. Try again");
        return;
      }

      router.back();
    } catch (err) {
      console.error("[AddModules] add error:", err);
      setToast("Couldn't add modules. Try again");
    } finally {
      setSaving(false);
    }
  };

  const filtered = modules.filter((m) =>
    m.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
  );

  const title = folderName ? `Add to ${folderName}` : "Add Materials";

  return (
    <YStack f={1} bg="$background">
      <BackgroundMesh preset="folder" />

      <YStack f={1} pt={screen.top}>
        <XStack px="$screenX" mb={19} jc="space-between" ai="center">
          <IconButton
            variant="liquidGlass"
            icon={<ChevronLeft size={22} color="#EAF7FF" strokeWidth={1.9} />}
            onPress={() => router.back()}
            accessibilityLabel="Back"
          />
          <Text
            f={1}
            textAlign="center"
            fontSize={19}
            fontWeight="800"
            color="$color"
            numberOfLines={1}
            px={8}
          >
            {title}
          </Text>
          <View style={{ opacity: 0 }} pointerEvents="none">
            <IconButton
              variant="liquidGlass"
              icon={<ChevronLeft size={22} color="#EAF7FF" strokeWidth={1.9} />}
            />
          </View>
        </XStack>

        <XStack px="$screenX" mb={14}>
          <SearchField
            f={1}
            value={search}
            onChangeText={setSearch}
            placeholder="Search modules..."
          />
        </XStack>

        {loading ? (
          <YStack px="$screenX" gap={11}>
            <AddModulesSkeletonRow />
            <AddModulesSkeletonRow />
            <AddModulesSkeletonRow />
            <AddModulesSkeletonRow />
          </YStack>
        ) : error ? (
          <YStack px="$screenX">
            <StateCard
              tone="error"
              icon={AlertTriangle}
              title="Couldn't load modules"
              subtitle="Looks like a connection hiccup. Your data is safe — try again."
              buttonLabel="Retry"
              onButtonPress={fetchAvailableModules}
            />
          </YStack>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: screenGutter,
              paddingBottom: screen.bottom + (selectedIds.length > 0 ? 96 : 0),
              gap: 11,
            }}
            ListEmptyComponent={
              debouncedSearch.trim() ? (
                <SearchEmptyState
                  query={debouncedSearch.trim()}
                  noun="modules"
                  onCreate={() =>
                    router.push({
                      pathname: "/module/create",
                      params: { returnFolderId: folderId },
                    })
                  }
                />
              ) : (
                <StateCard
                  tone="empty"
                  icon={Captions}
                  title="Nothing to add"
                  subtitle="All your modules are already in this folder."
                />
              )
            }
            renderItem={({ item }) => (
              <SelectableModuleRow
                name={item.name}
                itemsCount={item.itemsCount}
                selected={item.selected}
                onToggle={() => toggleModule(item.id)}
              />
            )}
            ListFooterComponent={
              <YStack mt={7}>
                <AppButton
                  variant="secondary"
                  onPress={() =>
                    router.push({
                      pathname: "/module/create",
                      params: { returnFolderId: folderId },
                    })
                  }
                >
                  Create new module
                </AppButton>
              </YStack>
            }
          />
        )}
      </YStack>

      {selectedIds.length > 0 && (
        <YStack
          pos="absolute"
          bottom={0}
          left={0}
          right={0}
          pt={16}
          px="$screenX"
          pb={Math.max(screen.insets.bottom + 16, 32)}
          bg="rgba(14,26,28,0.75)"
          btw={1}
          borderColor="rgba(220,255,245,0.13)"
        >
          <AppButton onPress={handleAdd} loading={saving}>
            {`Done · ${selectedIds.length} added`}
          </AppButton>
        </YStack>
      )}

      <AppToast open={!!toast} message={toast ?? ""} onDismiss={() => setToast(null)} />
    </YStack>
  );
}
