import { API_BASE_URL } from "@/src/api/config";
import { FolderIcon } from "@/src/components/cards/FolderIcon";
import { FolderModuleRow } from "@/src/components/cards/FolderModuleRow";
import { ConfirmMenuSheet } from "@/src/components/ui/overlays/ConfirmMenuSheet";
import { IconButton } from "@/src/components/ui/controls/IconButton";
import { BackgroundMesh } from "@/src/components/ui/background/ScreenBackground";
import { SheetRow } from "@/src/components/ui/overlays/Sheet";
import { ScrollToTopButton } from "@/src/components/ui/controls/ScrollToTopButton";
import { Skeleton } from "@/src/components/ui/feedback/Skeleton";
import { StateCard } from "@/src/components/ui/feedback/StateCard";
import { StatusBarScrim } from "@/src/components/ui/background/StatusBarScrim";
import { TagChip } from "@/src/components/ui/display/TagChip";
import { AppToast } from "@/src/components/ui/feedback/Toast";
import {
  ICON_MINT,
  ICON_ON_GLASS,
  ICON_TEAL,
} from "@/src/constants/iconColors";
import { useResourceOnFocus } from "@/src/hooks/useResourceOnFocus";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { hapticTap } from "@/src/utils/haptics";
import { pluralize } from "@/src/utils/plural";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { computeTagCounts } from "@/src/utils/tagCounts";
import { screenGutter } from "@/tamagui.config";
import { router, useLocalSearchParams } from "expo-router";
import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  MoreHorizontal,
  Pencil,
} from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { FlatList } from "react-native";
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
  totalModules: number;
  modulesTruncated: boolean;
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
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);
  const listRef = useRef<FlatList<FolderModule>>(null);

  const scrollY = useSharedValue(0);
  const listTop = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });

  const fetchFolder = async (isFirstLoad: boolean) => {
    if (!id) return;
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
        totalModules: raw._count?.modules ?? (raw.modules ?? []).length,
        modulesTruncated: !!raw.modulesTruncated,
      });
      markLoaded();
    } catch (err) {
      console.error("[FolderScreen] fetch error:", err);
      if (isFirstLoad) setError("Failed to load folder");
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  };

  const { markLoaded } = useResourceOnFocus([id], fetchFolder);

  const openEditScreen = () => {
    if (!folder) return;
    setMenuSheetOpen(false);
    router.push({ pathname: "/folder/edit", params: { folderId: folder.id } });
  };

  const handleDeleteFolder = async () => {
    try {
      const res = await protectedFetch(`${API_BASE_URL}/folders/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      setMenuSheetOpen(false);
      router.dismissTo("/library");
    } catch (err) {
      console.error("[FolderScreen] delete error:", err);
      setToast("Couldn't delete the folder. Try again");
    }
  };

  const moduleCount = folder?.totalModules ?? 0;
  const loadedCount = folder?.modules.length ?? 0;

  const visibleModules = useMemo(() => {
    const all = folder?.modules ?? [];
    if (selectedTag === "all") return all;
    return all.filter((m) => m.tags.some((t) => t.id === selectedTag));
  }, [folder?.modules, selectedTag]);
  const tagCounts = useMemo(
    () => computeTagCounts(folder?.modules ?? []),
    [folder?.modules],
  );
  const heroIcon = useMemo(() => folder?.icon ?? "", [folder?.icon]);

  if (loading && !folder) {
    return (
      <YStack f={1} bg="$background">
        <BackgroundMesh preset="twilightDuo" />
        <YStack px="$screenX" gap="$6" pb={screen.bottom} pt={screen.top}>
          <XStack jc="space-between" ai="center">
            <IconButton
              variant="liquidGlass"
              icon={
                <ChevronLeft
                  size={22}
                  color={ICON_ON_GLASS}
                  strokeWidth={1.9}
                />
              }
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
        <BackgroundMesh preset="twilightDuo" />
        <YStack f={1} px="$screenX" gap="$3" pt={screen.top}>
          <XStack jc="space-between" ai="center">
            <IconButton
              variant="liquidGlass"
              icon={
                <ChevronLeft
                  size={22}
                  color={ICON_ON_GLASS}
                  strokeWidth={1.9}
                />
              }
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
              onButtonPress={() => fetchFolder(true)}
            />
          </YStack>
        </YStack>
      </YStack>
    );
  }

  if (error && !folder) {
    return (
      <YStack f={1} bg="$background">
        <BackgroundMesh preset="twilightDuo" />
        <YStack f={1} px="$screenX" gap="$3" pt={screen.top}>
          <XStack jc="space-between" ai="center">
            <IconButton
              variant="liquidGlass"
              icon={
                <ChevronLeft
                  size={22}
                  color={ICON_ON_GLASS}
                  strokeWidth={1.9}
                />
              }
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
              onButtonPress={() => fetchFolder(true)}
            />
          </YStack>
        </YStack>
      </YStack>
    );
  }

  if (!folder) return null;

  return (
    <YStack f={1} bg="$background">
      {/* <BackgroundMesh preset="twilightDuo" />
      <BackgroundMesh preset="twilightDuoLime" /> */}
      <BackgroundMesh preset="twilightDuo" />

      <Animated.FlatList
        ref={listRef}
        data={visibleModules}
        keyExtractor={(mod) => mod.id}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: screenGutter,
          paddingBottom: screen.bottom,
        }}
        ListHeaderComponent={
          <YStack
            pt={screen.top}
            onLayout={(e) => {
              listTop.value = e.nativeEvent.layout.height;
            }}
          >
            <XStack jc="space-between" ai="center" mb={20}>
              <IconButton
                variant="liquidGlass"
                icon={
                  <ChevronLeft
                    size={22}
                    color={ICON_ON_GLASS}
                    strokeWidth={1.9}
                  />
                }
                onPress={() => router.back()}
                accessibilityLabel="Back"
              />
              <IconButton
                variant="liquidGlass"
                icon={
                  <MoreHorizontal
                    size={22}
                    color={ICON_ON_GLASS}
                    strokeWidth={1.9}
                  />
                }
                onPress={() => setMenuSheetOpen(true)}
                accessibilityLabel="Folder menu"
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
                  {pluralize(folder.modules.length, "module")}
                </Text>
              </YStack>
            </XStack>

            <XStack gap={10} flexWrap="wrap" mb={22}>
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
          </YStack>
        }
        ListFooterComponent={
          folder.modulesTruncated ? (
            <Text
              fontSize={12.5}
              color="$colorMuted"
              textAlign="center"
              mt={14}
            >
              Showing {loadedCount} of {moduleCount} modules
            </Text>
          ) : null
        }
        ListEmptyComponent={
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
        }
        renderItem={({ item: mod, index }) => (
          <FolderModuleRow
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
        )}
      />

      <ScrollToTopButton
        scrollY={scrollY}
        bottomOffset={screen.bottom}
        onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
      />

      <StatusBarScrim />

      <ConfirmMenuSheet
        open={menuSheetOpen}
        onOpenChange={setMenuSheetOpen}
        menuTitle={folder?.name ?? "Folder"}
        deleteLabel="Delete folder"
        confirmTitle="Delete this folder?"
        confirmSubtitle={`${pluralize(moduleCount, "module")} will stay in your library.\nThis can't be undone.`}
        onConfirmDelete={handleDeleteFolder}
      >
        <SheetRow icon={Pencil} label="Edit folder" onPress={openEditScreen} />
      </ConfirmMenuSheet>

      <AppToast
        open={!!toast}
        message={toast ?? ""}
        onDismiss={() => setToast(null)}
      />
    </YStack>
  );
}
