import { API_BASE_URL } from "@/src/api/config";
import { Toggle } from "@/src/components/ui/Toggle";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { CardRow } from "@/src/components/flashcards/CardRow";
import { EditCardsSheet } from "@/src/components/flashcards/EditCardsSheet";
import { EditModuleSheet } from "@/src/components/flashcards/EditModuleSheet";
import { ModuleDeck } from "@/src/components/flashcards/ModuleDeck";
import { AppButton } from "@/src/components/ui/Button";
import { IconButton } from "@/src/components/ui/IconButton";
import { ModeTile } from "@/src/components/ui/ModeTile";
import { ProgressSplitBar } from "@/src/components/ui/ProgressSplitBar";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import {
  AppSheet,
  SheetCrossfade,
  SheetRow,
  SheetRows,
} from "@/src/components/ui/Sheet";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StatTile } from "@/src/components/ui/StatTile";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { StateCard } from "@/src/components/ui/StateCard";
import { AppToast } from "@/src/components/ui/Toast";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import {
  ICON_ACCENT,
  ICON_DANGER,
  ICON_LIME_LIGHT,
  ICON_MUTED,
  ICON_ON_GLASS,
} from "@/src/constants/iconColors";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useGameStore } from "@/src/store/useGameStore";
import { useStudyQueueStore } from "@/src/store/useStudyQueueStore";
import { Flashcard, Module } from "@/src/types";
import { cardSideText } from "@/src/utils/cardText";
import { hapticTap } from "@/src/utils/haptics";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  AlertTriangle,
  ArrowDownUp,
  BookmarkCheck,
  BookmarkPlus,
  Captions,
  ChevronLeft,
  Clock,
  Columns2,
  FileText,
  Globe,
  GraduationCap,
  Lock,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react-native";
import { ComponentType, useCallback, useMemo, useRef, useState } from "react";
import { InteractionManager, Pressable, ScrollView } from "react-native";
import { Text, XStack, YStack } from "tamagui";

type SortOrder = "original" | "alphabetical";

const SORT_OPTIONS: {
  key: SortOrder;
  label: string;
  icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}[] = [
  { key: "original", label: "Original order", icon: Clock },
  { key: "alphabetical", label: "A–Z", icon: ArrowDownUp },
];

const MODE_TILES = [
  {
    key: "flashcards",
    label: "Flashcards",
    hint: "Flip and recall",
    icon: Captions,
    live: true,
  },
  {
    key: "test",
    label: "Test",
    hint: "Quiz yourself",
    icon: FileText,
    live: false,
  },
  {
    key: "match",
    label: "Match",
    hint: "Pair up",
    icon: Columns2,
    live: false,
  },
  {
    key: "learn",
    label: "Learn",
    hint: "Spaced repetition",
    icon: GraduationCap,
    live: false,
  },
];

function ModuleSkeleton() {
  return (
    <YStack gap={22}>
      <YStack ai="center">
        <Skeleton width={294} height={182} borderRadius={24} />
      </YStack>
      <YStack px="$screenX" gap={12}>
        <Skeleton height={31} width="72%" borderRadius={8} />
        <Skeleton height={17} width="90%" borderRadius={6} />
        <Skeleton height={8} borderRadius={999} />
        <XStack gap={9}>
          <Skeleton height={62} f={1} borderRadius="$control" />
          <Skeleton height={62} f={1} borderRadius="$control" />
          <Skeleton height={62} f={1} borderRadius="$control" />
        </XStack>
      </YStack>
    </YStack>
  );
}

function CardsHeader({
  count,
  starredCount,
  starredOnly,
  onToggleStarred,
  onSort,
}: {
  count: number;
  starredCount: number;
  starredOnly: boolean;
  onToggleStarred: () => void;
  onSort: () => void;
}) {
  return (
    <XStack ai="center" jc="space-between" mb={11}>
      <XStack ai="baseline" gap={9}>
        <Text fontSize={16} fontWeight="700" color="$color">
          Cards
        </Text>
        {starredOnly && (
          <Text fontSize={12.5} fontWeight="600" color="$textMuted">
            {starredCount} starred
          </Text>
        )}
        {!starredOnly && (
          <Text fontSize={12.5} fontWeight="600" color="$textMuted">
            {count}
          </Text>
        )}
      </XStack>
      <XStack ai="center" gap={13}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Filter starred cards"
          onPress={() => {
            hapticTap();
            onToggleStarred();
          }}
        >
          <YStack
            w={34}
            h={34}
            br={17}
            ai="center"
            jc="center"
            bg={
              starredOnly ? "rgba(163,230,53,0.16)" : "rgba(220,255,245,0.05)"
            }
            borderWidth={1}
            borderColor={
              starredOnly ? "rgba(190,242,100,0.42)" : "rgba(220,255,245,0.11)"
            }
            {...(starredOnly
              ? {
                  shadowColor: "rgba(190,242,100,1)",
                  shadowOffset: { width: 0, height: 0 },
                  shadowRadius: 8,
                  shadowOpacity: 0.75,
                }
              : null)}
          >
            <Star
              size={16}
              strokeWidth={1.8}
              color={starredOnly ? ICON_LIME_LIGHT : ICON_MUTED}
              fill={starredOnly ? "rgba(190,242,100,0.85)" : "transparent"}
            />
          </YStack>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sort cards"
          onPress={() => {
            hapticTap();
            onSort();
          }}
        >
          <XStack ai="center" gap={6}>
            <ArrowDownUp size={14} color={ICON_ACCENT} strokeWidth={2} />
            <Text fontSize={12.5} fontWeight="600" color="$mintLight">
              Sort
            </Text>
          </XStack>
        </Pressable>
      </XStack>
    </XStack>
  );
}

export default function ModuleScreen() {
  const screen = useScreenInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("original");
  const [starredOnly, setStarredOnly] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);
  const [menuView, setMenuView] = useState<"menu" | "confirm">("menu");
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editModuleOpen, setEditModuleOpen] = useState(false);
  const [editSheetMounted, setEditSheetMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  const initGame = useGameStore((state) => state.initGame);
  const currentModule = useGameStore((state) => state.currentModule);

  const { user } = useAuthStore();
  const isOwner = moduleData?.user?.id === user?.id;
  const authorName =
    moduleData?.author?.username ?? moduleData?.authorUsername ?? undefined;
  const isDeletedAuthor = !moduleData?.author && !!moduleData?.authorUsername;

  const loadedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      const task = InteractionManager.runAfterInteractions(() =>
        fetchData(loadedRef.current),
      );
      return () => task.cancel();
    }, [id]),
  );

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      await useStudyQueueStore.getState().flush();
      const [moduleRes, flashcardsRes] = await Promise.all([
        protectedFetch(`${API_BASE_URL}/modules/${id}`, { method: "GET" }),
        protectedFetch(`${API_BASE_URL}/flashcards/module/${id}`, {
          method: "GET",
        }),
      ]);
      if (moduleRes.status === 403 || moduleRes.status === 404) {
        if (!silent) setNotFound(true);
        return;
      }
      if (!moduleRes.ok) throw new Error(`Module error: ${moduleRes.status}`);
      if (!flashcardsRes.ok)
        throw new Error(`Flashcards error: ${flashcardsRes.status}`);

      const [rawModule, flashcardsData] = await Promise.all([
        moduleRes.json() as Promise<any>,
        flashcardsRes.json() as Promise<Flashcard[]>,
      ]);

      setModuleData({
        ...rawModule,
        itemsCount: rawModule._count?.flashcards ?? 0,
        folderIds: (rawModule.folders ?? []).map((f: { id: string }) => f.id),
        savedCopyId: rawModule.savedCopyId ?? null,
        user: rawModule.user ?? null,
        author: rawModule.author ?? null,
      });
      setFlashcards(flashcardsData);
      loadedRef.current = true;
    } catch (err) {
      console.error("[ModuleScreen] fetch error:", err);
      if (!silent) setError("Failed to load module");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const progress = useMemo(() => {
    if (moduleData?.progress) return moduleData.progress;
    const known = flashcards.filter((c) => c.status === "KNOWN").length;
    const learning = flashcards.filter(
      (c) => c.status === "STILL_LEARNING",
    ).length;
    return {
      known,
      learning,
      unstudied: flashcards.length - known - learning,
      total: flashcards.length,
    };
  }, [moduleData?.progress, flashcards]);

  const starredCount = flashcards.filter((c) => c.isStarred).length;

  const visibleCards = useMemo(() => {
    const base = starredOnly
      ? flashcards.filter((c) => c.isStarred)
      : flashcards;
    if (sortOrder === "alphabetical") {
      return [...base].sort((a, b) => a.term.localeCompare(b.term));
    }
    return base;
  }, [flashcards, sortOrder, starredOnly]);

  const deckCards = useMemo(
    () =>
      flashcards.map((c) => ({
        id: c.id,
        term: cardSideText(c.term),
        definition: cardSideText(c.definition),
      })),
    [flashcards],
  );

  const handleToggleStar = async (card: Flashcard) => {
    const newValue = !card.isStarred;
    setFlashcards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, isStarred: newValue } : c)),
    );
    try {
      const res = await protectedFetch(
        `${API_BASE_URL}/flashcards/${card.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ isStarred: newValue }),
        },
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
    } catch (err) {
      console.error("[ModuleScreen] star error:", err);
      setFlashcards((prev) =>
        prev.map((c) =>
          c.id === card.id ? { ...c, isStarred: card.isStarred } : c,
        ),
      );
      setToast("Couldn't update star. Try again");
    }
  };

  const handleToggleFavorite = async () => {
    if (!moduleData) return;
    const newValue = !moduleData.isFavorite;
    setModuleData((prev) => (prev ? { ...prev, isFavorite: newValue } : prev));
    try {
      const res = await protectedFetch(`${API_BASE_URL}/modules/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isFavorite: newValue }),
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
    } catch (err) {
      console.error("[ModuleScreen] favorite error:", err);
      setModuleData((prev) =>
        prev ? { ...prev, isFavorite: !newValue } : prev,
      );
      setToast("Couldn't update favorite. Try again");
    }
  };

  const handleSaveToLibrary = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await protectedFetch(`${API_BASE_URL}/modules/${id}/save`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const newModule = await res.json();
      router.replace({
        pathname: "/module/[id]",
        params: { id: newModule.id },
      });
    } catch (err) {
      console.error("[ModuleScreen] save error:", err);
      setToast("Couldn't save to library. Try again");
    } finally {
      setSaving(false);
    }
  };

  const openEditSheet = () => {
    setMenuSheetOpen(false);
    setEditSheetMounted(true);
    setTimeout(() => setEditSheetOpen(true), 300);
  };

  const openEditModule = () => {
    setMenuSheetOpen(false);
    setTimeout(() => setEditModuleOpen(true), 300);
  };

  const handleSaved = (
    updatedCards: Flashcard[],
    name: string,
    description: string,
    isPublic: boolean,
    updatedAt: string,
  ) => {
    setFlashcards(updatedCards);
    setModuleData((prev) =>
      prev
        ? {
            ...prev,
            name,
            description,
            isPublic,
            updatedAt,
            itemsCount: updatedCards.length,
          }
        : prev,
    );
  };

  const closeMenu = (open: boolean) => {
    setMenuSheetOpen(open);
    if (!open) setMenuView("menu");
  };

  const handleTogglePublic = async () => {
    if (!moduleData) return;
    const next = !moduleData.isPublic;
    setModuleData({ ...moduleData, isPublic: next });
    try {
      const res = await protectedFetch(`${API_BASE_URL}/modules/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPublic: next }),
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
    } catch (err) {
      console.error("[ModuleScreen] visibility error:", err);
      setModuleData((prev) => (prev ? { ...prev, isPublic: !next } : prev));
      setToast("Couldn't change visibility. Try again");
    }
  };

  const handleDeleteModule = async () => {
    setDeleting(true);
    try {
      const res = await protectedFetch(`${API_BASE_URL}/modules/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      setMenuSheetOpen(false);
      router.back();
    } catch (err) {
      console.error("[ModuleScreen] delete error:", err);
      setToast("Couldn't delete the module. Try again");
    } finally {
      setDeleting(false);
    }
  };

  const startFlashcards = () => {
    if (!moduleData || !flashcards.length) return;
    const isStale =
      currentModule?.id !== moduleData.id ||
      currentModule?.updatedAt !== moduleData.updatedAt;
    if (isStale) initGame(moduleData, flashcards);
    router.push({ pathname: "/module/[id]/flashcards", params: { id } });
  };

  return (
    <YStack f={1} bg="$background">
      <BackgroundMesh preset="module" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack pb={screen.bottom}>
          <XStack px="$screenX" pt={screen.top} jc="space-between" ai="center">
            <IconButton
              variant="liquidGlass"
              icon={<ChevronLeft size={22} color={ICON_ON_GLASS} strokeWidth={1.9} />}
              onPress={() => router.back()}
              accessibilityLabel="Back"
            />
            {moduleData && isOwner && (
              <XStack gap={9}>
                <IconButton
                  variant="liquidGlass"
                  icon={
                    <Star
                      size={22}
                      strokeWidth={1.9}
                      color={moduleData.isFavorite ? ICON_LIME_LIGHT : ICON_ON_GLASS}
                      fill={
                        moduleData.isFavorite
                          ? "rgba(190,242,100,0.22)"
                          : "transparent"
                      }
                    />
                  }
                  onPress={handleToggleFavorite}
                  accessibilityLabel={
                    moduleData.isFavorite ? "Remove favorite" : "Add favorite"
                  }
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
                  accessibilityLabel="Module menu"
                />
              </XStack>
            )}
          </XStack>

          {loading && (
            <YStack pt={22}>
              <ModuleSkeleton />
            </YStack>
          )}

          {notFound && !loading && (
            <YStack px="$screenX" pt={22}>
              <StateCard
                tone="empty"
                icon={Sparkles}
                title="Module not found"
                subtitle="It may have been removed or made private."
                buttonLabel="Try again"
                onButtonPress={() => fetchData()}
              />
            </YStack>
          )}

          {error && !loading && !notFound && (
            <YStack px="$screenX" pt={22}>
              <StateCard
                tone="error"
                icon={AlertTriangle}
                title="Couldn't load module"
                subtitle="Looks like a connection hiccup. Your data is safe — try again."
                buttonLabel="Try again"
                onButtonPress={() => fetchData()}
              />
            </YStack>
          )}

          {moduleData && !loading && !notFound && (
            <>
              {deckCards.length > 0 && <ModuleDeck cards={deckCards} />}

              <YStack px="$screenX" pt={26}>
                <Text
                  fontSize={27}
                  fontWeight="800"
                  letterSpacing={-0.54}
                  lineHeight={31}
                  color="$color"
                >
                  {moduleData.name}
                </Text>

                {!!moduleData.description && (
                  <Text fontSize={13.5} lineHeight={20} color="$textMuted" mt={7}>
                    {moduleData.description}
                  </Text>
                )}

                <XStack ai="center" gap={9} mt={13}>
                  <UserAvatar
                    avatarUrl={moduleData.author?.avatarUrl}
                    username={authorName}
                    size={26}
                  />
                  <Text fontSize={12.5} fontWeight="700" color="$color">
                    @{authorName ?? "unknown"}
                  </Text>
                  {isDeletedAuthor && (
                    <Text fontSize={12.5} color="$textMuted">
                      (deleted)
                    </Text>
                  )}
                  <YStack w={3} h={3} br={2} bg="$mutedDim" />
                  <Text fontSize={12.5} color="$textMuted">
                    {moduleData.itemsCount} card
                    {moduleData.itemsCount !== 1 ? "s" : ""}
                  </Text>
                  {moduleData.isPublic && (
                    <XStack
                      ml="auto"
                      px={10}
                      py={4}
                      br={999}
                      bg="rgba(45,212,191,0.13)"
                      borderWidth={1}
                      borderColor="rgba(45,212,191,0.32)"
                    >
                      <Text fontSize={10.5} fontWeight="600" color="$mintLight">
                        Public
                      </Text>
                    </XStack>
                  )}
                </XStack>

                <YStack mt={22}>
                  <ProgressSplitBar
                    known={progress.known}
                    learning={progress.learning}
                    total={progress.total}
                  />
                  <XStack gap={9} mt={12}>
                    <StatTile
                      tone="known"
                      value={progress.known}
                      label="Known"
                    />
                    <StatTile
                      tone="learning"
                      value={progress.learning}
                      label="Learning"
                    />
                    <StatTile
                      tone="new"
                      value={progress.unstudied}
                      label="New"
                    />
                  </XStack>
                </YStack>

                <YStack mt={22} gap={10}>
                  <XStack gap={10}>
                    {MODE_TILES.slice(0, 2).map((tile) => (
                      <ModeTile
                        key={tile.key}
                        icon={tile.icon}
                        label={tile.label}
                        hint={tile.hint}
                        live={tile.live && deckCards.length > 0}
                        onPress={tile.live ? startFlashcards : undefined}
                      />
                    ))}
                  </XStack>
                  <XStack gap={10}>
                    {MODE_TILES.slice(2).map((tile) => (
                      <ModeTile
                        key={tile.key}
                        icon={tile.icon}
                        label={tile.label}
                        hint={tile.hint}
                      />
                    ))}
                  </XStack>
                  <XStack
                    ai="center"
                    gap={10}
                    px={16}
                    py={13}
                    br={18}
                    bg="rgba(220,255,245,0.035)"
                    borderWidth={1}
                    borderStyle="dashed"
                    borderColor="rgba(220,255,245,0.13)"
                  >
                    <Lock size={16} color={ICON_MUTED} strokeWidth={1.8} />
                    <Text fontSize={12.5} color="$textMuted">
                      <Text fontSize={12.5} fontWeight="600" color="$mutedLight">
                        Test, Match, Learn
                      </Text>{" "}
                      — coming soon
                    </Text>
                  </XStack>
                </YStack>

                {!isOwner && (
                  <YStack mt={22}>
                    {moduleData.savedCopyId ? (
                      <AppButton
                        variant="secondary"
                        size="lg"
                        icon={<BookmarkCheck size={18} color={ICON_ON_GLASS} strokeWidth={1.9} />}
                        onPress={() =>
                          router.push({
                            pathname: "/module/[id]",
                            params: { id: moduleData.savedCopyId as string },
                          })
                        }
                      >
                        In your library · open
                      </AppButton>
                    ) : (
                      <AppButton
                        variant="primary"
                        size="lg"
                        icon={<BookmarkPlus size={18} color="#06231F" />}
                        loading={saving}
                        onPress={handleSaveToLibrary}
                      >
                        Save to library
                      </AppButton>
                    )}
                  </YStack>
                )}

                <YStack mt={26}>
                  {flashcards.length === 0 ? (
                    <StateCard
                      tone="empty"
                      icon={Sparkles}
                      title="No cards yet"
                      subtitle="This module doesn't have any flashcards yet"
                      buttonLabel={isOwner ? "Add cards" : undefined}
                      onButtonPress={isOwner ? openEditSheet : undefined}
                    />
                  ) : (
                    <>
                      <CardsHeader
                        count={flashcards.length}
                        starredCount={starredCount}
                        starredOnly={starredOnly}
                        onToggleStarred={() => setStarredOnly((v) => !v)}
                        onSort={() => setSortSheetOpen(true)}
                      />
                      <YStack gap={9}>
                        {visibleCards.map((card) => (
                          <CardRow
                            key={card.id}
                            term={cardSideText(card.term)}
                            definition={cardSideText(card.definition)}
                            starred={card.isStarred}
                            onToggleStar={
                              isOwner ? () => handleToggleStar(card) : undefined
                            }
                          />
                        ))}
                      </YStack>
                    </>
                  )}
                </YStack>
              </YStack>
            </>
          )}
        </YStack>
      </ScrollView>

      <StatusBarScrim />

      <AppSheet
        open={menuSheetOpen}
        onOpenChange={closeMenu}
        title={
          menuView === "menu"
            ? (moduleData?.name ?? "Module")
            : "Delete this module?"
        }
        subtitle={
          menuView === "confirm"
            ? `${flashcards.length} cards will be deleted too.\nThis can't be undone.`
            : undefined
        }
      >
        <SheetCrossfade activeKey={menuView}>
          {menuView === "menu" ? (
            <SheetRows>
              <SheetRow
                icon={Pencil}
                label="Edit module"
                onPress={openEditModule}
              />
              <SheetRow
                icon={Captions}
                label="Edit cards"
                hint={String(flashcards.length)}
                onPress={openEditSheet}
              />
              <SheetRow
                icon={Globe}
                label="Public"
                right={
                  <Toggle
                    size="md"
                    value={moduleData?.isPublic ?? false}
                    onToggle={handleTogglePublic}
                  />
                }
                onPress={handleTogglePublic}
              />
              <SheetRow
                icon={Trash2}
                label="Delete module"
                danger
                onPress={() => setMenuView("confirm")}
              />
            </SheetRows>
          ) : (
            <YStack gap={10}>
              <AppButton
                variant="danger"
                icon={<Trash2 size={19} color={ICON_DANGER} strokeWidth={1.9} />}
                loading={deleting}
                onPress={handleDeleteModule}
              >
                Delete module
              </AppButton>
              <AppButton variant="ghost" onPress={() => setMenuView("menu")}>
                Cancel
              </AppButton>
            </YStack>
          )}
        </SheetCrossfade>
      </AppSheet>

      <AppToast
        open={!!toast}
        message={toast ?? ""}
        onDismiss={() => setToast(null)}
      />

      {moduleData && (
        <EditModuleSheet
          open={editModuleOpen}
          onOpenChange={setEditModuleOpen}
          module={moduleData}
          onSaved={setModuleData}
        />
      )}

      {editSheetMounted && (
        <EditCardsSheet
          open={editSheetOpen}
          onOpenChange={setEditSheetOpen}
          moduleId={id}
          cards={flashcards.map((c) => ({
            id: c.id,
            term: c.term,
            definition: c.definition,
          }))}
          onSaved={handleSaved}
          moduleName={moduleData?.name ?? ""}
          moduleDescription={moduleData?.description ?? ""}
          moduleIsPublic={moduleData?.isPublic ?? false}
        />
      )}

      <AppSheet
        open={sortSheetOpen}
        onOpenChange={setSortSheetOpen}
        title="Sort by"
      >
        <SheetRows>
          {SORT_OPTIONS.map((option) => (
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
          ))}
        </SheetRows>
      </AppSheet>
    </YStack>
  );
}
