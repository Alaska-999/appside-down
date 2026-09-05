import { API_BASE_URL } from "@/src/api/config";
import { FolderIcon } from "@/src/components/cards/FolderIcon";
import { FolderModuleRow } from "@/src/components/cards/FolderModuleRow";
import { IconButton } from "@/src/components/ui/IconButton";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { ICON_MINT, ICON_TEAL } from "@/src/constants/iconColors";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StateCard } from "@/src/components/ui/StateCard";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { TagChip } from "@/src/components/ui/TagChip";
import { AppToast } from "@/src/components/ui/Toast";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { hapticTap } from "@/src/utils/haptics";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  MoreHorizontal,
} from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { Text, XStack, YStack } from "tamagui";

type FolderTag = { id: string; name: string };

type FolderModule = {
  id: string;
  name: string;
  itemsCount: number;
  isPublic?: boolean;
  isFavorite?: boolean;
  progress?: { known: number; total: number };
  tags: FolderTag[];
};

type FolderDetail = {
  id: string;
  name: string;
  icon: string;
  tags: FolderTag[];
  modules: FolderModule[];
};

function mapModule(raw: any): FolderModule {
  return {
    id: raw.id,
    name: raw.name,
    itemsCount: raw._count?.flashcards ?? raw.itemsCount ?? 0,
    isPublic: raw.isPublic,
    isFavorite: raw.isFavorite,
    progress: raw.progress
      ? { known: raw.progress.known, total: raw.progress.total }
      : undefined,
    tags: (raw.tags ?? []).map((t: FolderTag) => ({ id: t.id, name: t.name })),
  };
}

const HERO_GRADIENT: [string, string] = [ICON_TEAL, ICON_MINT];

export default function FolderScreen() {
  const screen = useScreenInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [folder, setFolder] = useState<FolderDetail | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const scrollY = useSharedValue(0);
  const listTop = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      fetchFolder();
    }, [id]),
  );

  const fetchFolder = async () => {
    const isFirstLoad = !hasLoadedRef.current;
    if (isFirstLoad) {
      setLoading(true);
      setError(null);
      setNotFound(false);
    }
    try {
      const res = await protectedFetch(`${API_BASE_URL}/folders/${id}`, {
        method: "GET",
      });
      if (res.status === 403 || res.status === 404) {
        if (isFirstLoad) setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const raw = await res.json();
      setFolder({
        id: raw.id,
        name: raw.name,
        icon: raw.icon ?? "",
        tags: (raw.tags ?? []).map((t: FolderTag) => ({
          id: t.id,
          name: t.name,
        })),
        modules: (raw.modules ?? []).map(mapModule),
      });
      hasLoadedRef.current = true;
    } catch (err) {
      console.error("[FolderScreen] fetch error:", err);
      if (isFirstLoad) setError("Failed to load folder");
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  };

  const openEditScreen = () => {
    if (!folder) return;
    router.push({ pathname: "/folder/edit", params: { folderId: folder.id } });
  };

  const visibleModules = useMemo(() => {
    const all = folder?.modules ?? [];
    if (selectedTag === "all") return all;
    return all.filter((m) => m.tags.some((t) => t.id === selectedTag));
  }, [folder?.modules, selectedTag]);
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of folder?.modules ?? [])
      for (const t of m.tags) counts.set(t.id, (counts.get(t.id) ?? 0) + 1);
    return counts;
  }, [folder?.modules]);
  const heroIcon = useMemo(() => folder?.icon ?? "", [folder?.icon]);

  if (loading && !folder) {
    return (
      <YStack f={1} bg="$background">
        <BackgroundMesh preset="folder" />
        <YStack px="$screenX" gap="$6" pb={screen.bottom} pt={screen.top}>
          <XStack jc="space-between" ai="center">
            <IconButton
              variant="liquidGlass"
              icon={<ChevronLeft size={22} color="#EAF7FF" strokeWidth={1.9} />}
              onPress={() => router.back()}
            />
          </XStack>
          <XStack ai="center" gap={15}>
            <Skeleton width={64} height={64} borderRadius="$cardSoft" />
            <YStack f={1} gap={8}>
              <Skeleton width={160} height={22} borderRadius={8} />
              <Skeleton width={90} height={14} borderRadius={6} />
            </YStack>
          </XStack>
          <XStack gap={7}>
            <Skeleton width={60} height={34} borderRadius={999} />
            <Skeleton width={70} height={34} borderRadius={999} />
          </XStack>
          <YStack gap={11}>
            <Skeleton height={74} borderRadius="$card" />
            <Skeleton height={74} borderRadius="$card" />
            <Skeleton height={74} borderRadius="$card" />
          </YStack>
        </YStack>
      </YStack>
    );
  }

  if (notFound && !folder) {
    return (
      <YStack f={1} bg="$background">
        <BackgroundMesh preset="folder" />
        <YStack f={1} px="$screenX" gap="$3" pt={screen.top}>
          <XStack jc="space-between" ai="center">
            <IconButton
              variant="liquidGlass"
              icon={<ChevronLeft size={22} color="#EAF7FF" strokeWidth={1.9} />}
              onPress={() => router.back()}
            />
          </XStack>
          <YStack f={1} jc="center">
            <StateCard
              tone="empty"
              icon={BookOpen}
              title="Folder not found"
              subtitle="It may have been removed or made private."
              buttonLabel="Try again"
              onButtonPress={fetchFolder}
            />
          </YStack>
        </YStack>
      </YStack>
    );
  }

  if (error && !folder) {
    return (
      <YStack f={1} bg="$background">
        <BackgroundMesh preset="folder" />
        <YStack f={1} px="$screenX" gap="$3" pt={screen.top}>
          <XStack jc="space-between" ai="center">
            <IconButton
              variant="liquidGlass"
              icon={<ChevronLeft size={22} color="#EAF7FF" strokeWidth={1.9} />}
              onPress={() => router.back()}
            />
          </XStack>
          <YStack f={1} jc="center">
            <StateCard
              tone="error"
              icon={AlertTriangle}
              title="Couldn't load folder"
              subtitle="Looks like a connection hiccup. Your data is safe — try again."
              buttonLabel="Try again"
              onButtonPress={fetchFolder}
            />
          </YStack>
        </YStack>
      </YStack>
    );
  }

  if (!folder) return null;

  return (
    <YStack f={1} bg="$background">
      <BackgroundMesh preset="folder" />
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <YStack px="$screenX" pb={screen.bottom} pt={screen.top}>
          <XStack jc="space-between" ai="center" mb={20}>
            <IconButton
              variant="liquidGlass"
              icon={<ChevronLeft size={22} color="#EAF7FF" strokeWidth={1.9} />}
              onPress={() => router.back()}
              accessibilityLabel="Back"
            />
            <IconButton
              variant="liquidGlass"
              icon={
                <MoreHorizontal size={22} color="#EAF7FF" strokeWidth={1.9} />
              }
              onPress={openEditScreen}
              accessibilityLabel="Edit folder"
            />
          </XStack>
          <XStack ai="center" gap={15} mb={20}>
            <FolderIcon
              icon={heroIcon}
              name={folder.name}
              size={64}
              radius={20}
              gradient={HERO_GRADIENT}
            />
            <YStack f={1} minWidth={0}>
              <Text
                fontSize={27}
                fontWeight="800"
                letterSpacing={-0.54}
                lineHeight={31}
                color="$color"
                numberOfLines={1}
              >
                {folder.name}
              </Text>
              <Text fontSize={13} color="$textMuted" mt={5}>
                {folder.modules.length} module
                {folder.modules.length !== 1 ? "s" : ""}
              </Text>
            </YStack>
          </XStack>

          <XStack gap={7} flexWrap="wrap" mb={22}>
            <TagChip
              label="All"
              count={folder.modules.length}
              variant={selectedTag === "all" ? "on" : "default"}
              onPress={() => {
                hapticTap();
                setSelectedTag("all");
              }}
            />
            {folder.tags.map((tag) => (
              <TagChip
                key={tag.id}
                label={tag.name}
                count={tagCounts.get(tag.id) ?? 0}
                variant={selectedTag === tag.id ? "on" : "default"}
                onPress={() => {
                  hapticTap();
                  setSelectedTag(selectedTag === tag.id ? "all" : tag.id);
                }}
              />
            ))}
            <TagChip label="" variant="add" onPress={openEditScreen} />
          </XStack>

          <XStack jc="space-between" ai="baseline" mb={11}>
            <Text fontSize={17} fontWeight="700" color="$color">
              Modules
            </Text>
            <Text fontSize={13} color="$textMuted">
              {visibleModules.length}
            </Text>
          </XStack>

          {visibleModules.length === 0 ? (
            <StateCard
              tone="empty"
              icon={BookOpen}
              title="This folder is empty"
              subtitle="Add your first module to get going"
              buttonLabel="Add study materials"
              onButtonPress={() =>
                router.push({
                  pathname: "/folder/add-modules",
                  params: { folderId: id, folderName: folder.name },
                })
              }
            />
          ) : (
            <YStack
              onLayout={(e) => {
                listTop.value = e.nativeEvent.layout.y;
              }}
            >
              {visibleModules.map((mod, index) => (
                <FolderModuleRow
                  key={mod.id}
                  index={index}
                  name={mod.name}
                  itemsCount={mod.itemsCount}
                  tags={mod.tags.map((t) => t.name)}
                  progress={mod.progress}
                  scrollY={scrollY}
                  listTop={listTop}
                  onPress={() =>
                    router.push({
                      pathname: "/module/[id]",
                      params: { id: mod.id },
                    })
                  }
                />
              ))}
            </YStack>
          )}
        </YStack>
      </Animated.ScrollView>

      <StatusBarScrim />

      <AppToast
        open={!!toast}
        message={toast ?? ""}
        onDismiss={() => setToast(null)}
      />
    </YStack>
  );
}
