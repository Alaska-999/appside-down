import { API_BASE_URL } from "@/src/api/config";
import { CardRow } from "@/src/components/flashcards/CardRow";
import { EditCardsSheet } from "@/src/components/flashcards/EditCardsSheet";
import { ModuleDeck } from "@/src/components/flashcards/ModuleDeck";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { AppButton } from "@/src/components/ui/Button";
import { IconButton } from "@/src/components/ui/IconButton";
import { ModeTile } from "@/src/components/ui/ModeTile";
import { ProgressSplitBar } from "@/src/components/ui/ProgressSplitBar";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { AppSheet, SheetRow, SheetRows } from "@/src/components/ui/Sheet";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StatTile } from "@/src/components/ui/StatTile";
import { StateCard } from "@/src/components/ui/StateCard";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useGameStore } from "@/src/store/useGameStore";
import { Flashcard, Module } from "@/src/types";
import { cardSideText } from "@/src/utils/cardText";
import { hapticTap } from "@/src/utils/haptics";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { topPaddingBoost } from "@/tamagui.config";
import {
  AlertTriangle,
  ArrowDownUp,
  ArrowLeftRight,
  BookmarkPlus,
  ChevronLeft,
  Clock,
  FileText,
  GraduationCap,
  Layers,
  Lock,
  MoreHorizontal,
  Pencil,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ComponentType, useEffect, useMemo, useState } from "react";
import { Alert, InteractionManager, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  { key: "flashcards", label: "Flashcards", hint: "Flip and recall", icon: Layers, live: true },
  { key: "test", label: "Test", hint: "Quiz yourself", icon: FileText, live: false },
  { key: "match", label: "Match", hint: "Pair up", icon: ArrowLeftRight, live: false },
  { key: "learn", label: "Learn", hint: "Spaced repetition", icon: GraduationCap, live: false },
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
          <Skeleton height={62} f={1} borderRadius={16} />
          <Skeleton height={62} f={1} borderRadius={16} />
          <Skeleton height={62} f={1} borderRadius={16} />
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
          <Text fontSize={12.5} fontWeight="600" color="#8FA8B8">
            {starredCount} starred
          </Text>
        )}
        {!starredOnly && (
          <Text fontSize={12.5} fontWeight="600" color="#8FA8B8">
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
            bg={starredOnly ? "rgba(163,230,53,0.16)" : "rgba(220,255,245,0.05)"}
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
              color={starredOnly ? "#BEF264" : "#8FA8B8"}
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
            <ArrowDownUp size={14} color="#5EEAD4" strokeWidth={2} />
            <Text fontSize={12.5} fontWeight="600" color="#5EEAD4">
              Sort
            </Text>
          </XStack>
        </Pressable>
      </XStack>
    </XStack>
  );
}

export default function ModuleScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("original");
  const [starredOnly, setStarredOnly] = useState(false);
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editSheetMounted, setEditSheetMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  const initGame = useGameStore((state) => state.initGame);
  const currentModule = useGameStore((state) => state.currentModule);

  const { user } = useAuthStore();
  const isOwner = moduleData?.user?.id === user?.id;
  const authorName =
    moduleData?.author?.username ?? moduleData?.authorUsername ?? undefined;
  const isDeletedAuthor = !moduleData?.author && !!moduleData?.authorUsername;

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => fetchData());
    return () => task.cancel();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [moduleRes, flashcardsRes] = await Promise.all([
        protectedFetch(`${API_BASE_URL}/modules/${id}`, { method: "GET" }),
        protectedFetch(`${API_BASE_URL}/flashcards/module/${id}`, {
          method: "GET",
        }),
      ]);
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
        user: rawModule.user ?? null,
        author: rawModule.author ?? null,
      });
      setFlashcards(flashcardsData);
    } catch (err) {
      console.error("[ModuleScreen] fetch error:", err);
      setError("Failed to load module");
    } finally {
      setLoading(false);
    }
  };

  const progress = useMemo(() => {
    if (moduleData?.progress) return moduleData.progress;
    const known = flashcards.filter((c) => c.status === "KNOWN").length;
    const learning = flashcards.filter((c) => c.status === "STILL_LEARNING").length;
    return {
      known,
      learning,
      unstudied: flashcards.length - known - learning,
      total: flashcards.length,
    };
  }, [moduleData?.progress, flashcards]);

  const starredCount = flashcards.filter((c) => c.isStarred).length;

  const visibleCards = useMemo(() => {
    const base = starredOnly ? flashcards.filter((c) => c.isStarred) : flashcards;
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
      const res = await protectedFetch(`${API_BASE_URL}/flashcards/${card.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isStarred: newValue }),
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
    } catch (err) {
      console.error("[ModuleScreen] star error:", err);
      setFlashcards((prev) =>
        prev.map((c) =>
          c.id === card.id ? { ...c, isStarred: card.isStarred } : c,
        ),
      );
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
      setModuleData((prev) => (prev ? { ...prev, isFavorite: !newValue } : prev));
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
      router.replace({ pathname: "/module/[id]", params: { id: newModule.id } });
    } catch (err) {
      console.error("[ModuleScreen] save error:", err);
      Alert.alert("Error", "Failed to save module");
    } finally {
      setSaving(false);
    }
  };

  const openEditSheet = () => {
    setMenuSheetOpen(false);
    setEditSheetMounted(true);
    setTimeout(() => setEditSheetOpen(true), 300);
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

  const handleDeleteModule = () => {
    setMenuSheetOpen(false);
    setTimeout(() => {
      Alert.alert(
        "Delete module",
        "This will permanently delete the module and all its cards.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                const res = await protectedFetch(
                  `${API_BASE_URL}/modules/${id}`,
                  { method: "DELETE" },
                );
                if (!res.ok) throw new Error(`Error: ${res.status}`);
                router.back();
              } catch (err) {
                console.error("[ModuleScreen] delete error:", err);
                Alert.alert("Error", "Failed to delete module");
              }
            },
          },
        ],
      );
    }, 300);
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
        <YStack pb={140}>
          <XStack
            px="$screenX"
            pt={insets.top + 10 + topPaddingBoost}
            jc="space-between"
            ai="center"
          >
            <IconButton
              variant="liquidGlass"
              icon={<ChevronLeft size={22} color="#EAF7FF" strokeWidth={1.9} />}
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
                      color="#BEF264"
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
                    <MoreHorizontal size={22} color="#EAF7FF" strokeWidth={1.9} />
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

          {error && !loading && (
            <YStack px="$screenX" pt={22}>
              <StateCard
                tone="error"
                icon={AlertTriangle}
                title="Couldn't load module"
                subtitle="Looks like a connection hiccup. Your data is safe — try again."
                buttonLabel="Retry"
                onButtonPress={fetchData}
              />
            </YStack>
          )}

          {moduleData && !loading && (
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
                  <Text fontSize={13.5} lineHeight={20} color="#8FA8B8" mt={7}>
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
                    <Text fontSize={12.5} color="#8FA8B8">
                      (deleted)
                    </Text>
                  )}
                  <YStack w={3} h={3} br={2} bg="#5A6B7A" />
                  <Text fontSize={12.5} color="#8FA8B8">
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
                      <Text fontSize={10.5} fontWeight="600" color="#5EEAD4">
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
                    <StatTile tone="known" value={progress.known} label="Known" />
                    <StatTile
                      tone="learning"
                      value={progress.learning}
                      label="Learning"
                    />
                    <StatTile tone="new" value={progress.unstudied} label="New" />
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
                    <Lock size={16} color="#8FA8B8" strokeWidth={1.8} />
                    <Text fontSize={12.5} color="#8FA8B8">
                      <Text fontSize={12.5} fontWeight="600" color="#B7CEDA">
                        Test, Match, Learn
                      </Text>{" "}
                      — coming soon
                    </Text>
                  </XStack>
                </YStack>

                {!isOwner && (
                  <YStack mt={22}>
                    <AppButton
                      variant="primary"
                      size="lg"
                      icon={<BookmarkPlus size={18} color="#06231F" />}
                      loading={saving}
                      onPress={handleSaveToLibrary}
                    >
                      Save to library
                    </AppButton>
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

      <AppSheet open={menuSheetOpen} onOpenChange={setMenuSheetOpen} title="Module">
        <SheetRows>
          <SheetRow
            icon={Pencil}
            label="Edit module"
            chevron
            onPress={openEditSheet}
          />
          <SheetRow
            icon={Trash2}
            label="Delete module"
            danger
            onPress={handleDeleteModule}
          />
        </SheetRows>
      </AppSheet>

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

      <AppSheet open={sortSheetOpen} onOpenChange={setSortSheetOpen} title="Sort by">
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
