import { API_BASE_URL } from "@/src/api/config";
import { ModuleCard } from "@/src/components/cards/ModuleCard";
import { AuroraGlow } from "@/src/components/ui/AuroraGlow";
import { Badge } from "@/src/components/ui/Badge";
import { AppButton } from "@/src/components/ui/Button";
import { IconButton } from "@/src/components/ui/IconButton";
import { SearchField } from "@/src/components/ui/SearchField";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StateCard } from "@/src/components/ui/StateCard";
import { TEXT } from "@/src/constants/typography";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { screenGutter, topPaddingBoost } from "@/tamagui.config";
import { AlertTriangle, Check, ChevronLeft, Plus } from "@tamagui/lucide-icons";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, View, XStack, YStack } from "tamagui";

function AddModulesSkeletonRow() {
  return <Skeleton height={83} borderRadius={20} />;
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
  const insets = useSafeAreaInsets();
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
      const res = await protectedFetch(
        `${API_BASE_URL}/modules?limit=50`,
        { method: "GET" },
      );
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
        setError("Failed to add some modules");
        return;
      }

      router.back();
    } catch (err) {
      console.error("[AddModules] add error:", err);
      setError("Failed to add modules");
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
      <AuroraGlow mintOpacity={0.11} limeOpacity={0.09} />

      <YStack f={1} pt={insets.top + 10 + topPaddingBoost}>
        <XStack
          px="$screenX"
          mb={19}
          jc="space-between"
          ai="center"
        >
          <IconButton
            variant="liquidGlass"
            icon={<ChevronLeft size="$1" color="$color" />}
            onPress={() => router.back()}
          />
          <Text fontSize={TEXT.pageTitle} fontWeight="800" color="$color">
            {title}
          </Text>
          <View style={{ opacity: 0 }} pointerEvents="none">
            <IconButton
              variant="liquidGlass"
              icon={<ChevronLeft size="$1" color="$color" />}
            />
          </View>
        </XStack>

        <XStack px="$screenX">
          <SearchField
            f={1}
            value={search}
            onChangeText={setSearch}
            placeholder="Search modules..."
          />
        </XStack>

        {loading ? (
          <YStack px="$screenX" pt={16} gap={12}>
            <AddModulesSkeletonRow />
            <AddModulesSkeletonRow />
            <AddModulesSkeletonRow />
            <AddModulesSkeletonRow />
          </YStack>
        ) : error ? (
          <YStack px="$screenX" pt={16}>
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
              paddingTop: 16,
              paddingBottom: 100,
              gap: 12,
            }}
            ListEmptyComponent={
              <Text color="$colorMuted" textAlign="center" mt="$4">
                No modules available
              </Text>
            }
            renderItem={({ item }) => (
              <ModuleCard
                module={{
                  id: item.id,
                  name: item.name,
                  itemsCount: item.itemsCount,
                  isPublic: item.isPublic,
                }}
                dimmed={item.selected}
                trailing={
                  item.selected ? (
                    <Badge tone="mint" icon={<Check size={11} color="$mint" />}>
                      Added
                    </Badge>
                  ) : (
                    <IconButton
                      size={36}
                      icon={<Plus size="$1" color="$color" />}
                      onPress={() => toggleModule(item.id)}
                    />
                  )
                }
                onPress={() => toggleModule(item.id)}
              />
            )}
            ListFooterComponent={
              <YStack mt={7}>
                <AppButton
                  variant="secondary"
                  icon={<Plus size={16} color="$color" />}
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
          pt={19}
          px="$section"
          pb={Math.max(insets.bottom + 16, 32)}
          bg="rgba(19,21,32,0.92)"
          btw={1}
          borderColor="$glassBorder"
        >
          <AppButton onPress={handleAdd} loading={saving}>
            {`Done · ${selectedIds.length} added`}
          </AppButton>
        </YStack>
      )}
    </YStack>
  );
}
