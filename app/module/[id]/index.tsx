import { API_BASE_URL } from "@/src/api/config";
import { EditCardsSheet } from "@/src/components/flashcards/EditCardsSheet";
import { FlashcardSm } from "@/src/components/flashcards/Flashcard-sm";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { Badge } from "@/src/components/ui/Badge";
import { AppButton } from "@/src/components/ui/Button";
import { AppCard } from "@/src/components/ui/Card";
import { AppSheet } from "@/src/components/ui/Sheet";
import { IconButton } from "@/src/components/ui/IconButton";
import { SectionTitle } from "@/src/components/ui/SectionTitle";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StateCard } from "@/src/components/ui/StateCard";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useGameStore } from "@/src/store/useGameStore";
import { Flashcard, Module } from "@/src/types";
import { cardSideText } from "@/src/utils/cardText";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { topPaddingBoost } from "@/tamagui.config";
import {
  AlertTriangle,
  AlignJustify,
  ArrowLeftRight,
  BookmarkPlus,
  Check,
  ChevronLeft,
  FileText,
  GraduationCap,
  Layers,
  LayoutGrid,
  Lock,
  MoreHorizontal,
  Pencil,
  Play,
  Sparkles,
  Star,
  Trash2,
  Volume2,
  X,
  Zap,
} from "@tamagui/lucide-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  InteractionManager,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SharedValue } from "react-native-reanimated";
import { Carousel } from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, XStack, YStack } from "tamagui";

const LIME = "#A3E635";
const MOCKUP_SCALE = 390 / 235;
const STACK_HEIGHT = 118 * MOCKUP_SCALE;
const STACK_CARD_HEIGHT = 95 * MOCKUP_SCALE;
const CHIP_WIDTH = 47.25 * MOCKUP_SCALE;

type SortOrder = "original" | "alphabetical";

function ModuleSkeleton() {
  return (
    <YStack pb="$10" gap="$6">
      <YStack px="$screenX">
        <Skeleton height={STACK_HEIGHT} borderRadius={24} />
      </YStack>

      <YStack px="$screenX" gap="$4">
        <Skeleton height={28} width="70%" borderRadius={8} />
        <Skeleton height={16} width="45%" borderRadius={6} />
        <Skeleton height={52} borderRadius={999} />
        <Skeleton height={83} borderRadius={20} />
      </YStack>
    </YStack>
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

  const getActionButtons = (id: string) => [
    {
      key: "flashcards",
      label: "Flashcards",
      Icon: Layers,
      locked: false,
      onPress: (module: Module, flashcards: Flashcard[]) => {
        if (module && flashcards && flashcards?.length > 0) {
          const isStale =
            currentModule?.id !== module.id ||
            currentModule?.updatedAt !== module.updatedAt;
          if (isStale) {
            initGame(module, flashcards);
          }
          router.push({ pathname: "/module/[id]/flashcards", params: { id } });
        }
      },
    },
    {
      key: "learn",
      label: "Learn",
      Icon: GraduationCap,
      locked: true,
      onPress: () => {},
    },
    {
      key: "test",
      label: "Test",
      Icon: FileText,
      locked: false,
      onPress: () => {},
    },
    {
      key: "match",
      label: "Match",
      Icon: ArrowLeftRight,
      locked: false,
      onPress: () => {},
    },
    {
      key: "blast",
      label: "Blast",
      Icon: Zap,
      locked: false,
      onPress: () => {},
    },
    {
      key: "blocks",
      label: "Blocks",
      Icon: LayoutGrid,
      locked: false,
      onPress: () => {},
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [moduleRes, flashcardsRes] = await Promise.all([
        protectedFetch(`${API_BASE_URL}/modules/${id}`, {
          method: "GET",
        }),
        protectedFetch(
          `${API_BASE_URL}/flashcards/module/${id}`,
          { method: "GET" },
        ),
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
        tags: rawModule.tags ?? [],
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

  const sortedFlashcards = useMemo(() => {
    if (sortOrder === "alphabetical") {
      return [...flashcards].sort((a, b) => a.term.localeCompare(b.term));
    }
    return flashcards;
  }, [flashcards, sortOrder]);

  const handleToggleStar = async (card: Flashcard) => {
    const newValue = !card.isStarred;
    setFlashcards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, isStarred: newValue } : c)),
    );
    try {
      const res = await protectedFetch(
        `${API_BASE_URL}/flashcards/${card.id}`,
        { method: "PATCH", body: JSON.stringify({ isStarred: newValue }) },
      );
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
      const res = await protectedFetch(
        `${API_BASE_URL}/modules/${id}`,
        { method: "PATCH", body: JSON.stringify({ isFavorite: newValue }) },
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
    } catch (err) {
      console.error("[ModuleScreen] favorite error:", err);
      setModuleData((prev) =>
        prev ? { ...prev, isFavorite: !newValue } : prev,
      );
    }
  };

  const handleSaveToLibrary = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await protectedFetch(
        `${API_BASE_URL}/modules/${id}/save`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const newModule = await res.json();
      router.replace({
        pathname: "/module/[id]",
        params: { id: newModule.id },
      });
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

  const handleDeleteTag = (tag: string) => {
    Alert.alert("Delete tag", "Remove this tag?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!moduleData) return;
          const newTags = (moduleData.tags ?? []).filter((t) => t !== tag);
          try {
            const res = await protectedFetch(
              `${API_BASE_URL}/modules/${id}`,
              { method: "PATCH", body: JSON.stringify({ tags: newTags }) },
            );
            if (!res.ok) throw new Error(`Error: ${res.status}`);
            setModuleData((prev) => (prev ? { ...prev, tags: newTags } : prev));
          } catch (err) {
            console.error("[ModuleScreen] delete tag error:", err);
            Alert.alert("Error", "Failed to delete tag");
          }
        },
      },
    ]);
  };

  const actionButtons = moduleData ? getActionButtons(id) : [];
  const studyNow = actionButtons.find((button) => button.key === "flashcards");
  const modeChips = actionButtons.filter((button) => button.key !== "flashcards");

  return (
    <YStack f={1} bg="$background">
      <BackgroundMesh preset="module" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack pb="$10" gap="$6">
          <XStack px="$screenX" pt={insets.top + 10 + topPaddingBoost} jc="space-between" ai="center">
            <IconButton
              variant="liquidGlass"
              icon={<ChevronLeft size="$1" color="$color" />}
              onPress={() => router.back()}
            />
            {moduleData && isOwner && (
              <XStack gap="$2">
                <IconButton
                  variant="liquidGlass"
                  icon={
                    <Star
                      size={18}
                      color={moduleData.isFavorite ? LIME : "$colorMuted"}
                      fill={moduleData.isFavorite ? LIME : "transparent"}
                    />
                  }
                  onPress={handleToggleFavorite}
                />
                <IconButton
                  variant="liquidGlass"
                  icon={<MoreHorizontal size={18} color="$color" />}
                  onPress={() => setMenuSheetOpen(true)}
                />
              </XStack>
            )}
          </XStack>

          {loading && <ModuleSkeleton />}

          {error && !loading && (
            <YStack px="$screenX" mt="$4">
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

          {moduleData && (
            <>
              {flashcards.length > 0 && (
                <YStack px="$screenX" height={STACK_HEIGHT}>
                  <Carousel
                    data={flashcards}
                    loop
                    style={{ width: "100%", height: STACK_HEIGHT }}
                    layout={{
                      type: "horizontal-stack",
                      visibleCount: 3,
                      exitDirection: "left",
                      spacing: 8,
                      scaleStep: 0.05,
                      opacityStep: 0.5,
                      rotation: 4,
                    }}
                    keyExtractor={(item: Flashcard) => item.id}
                    renderItem={({
                      item,
                      relativeProgress,
                    }: {
                      item: Flashcard;
                      relativeProgress: SharedValue<number>;
                    }) => (
                      <FlashcardSm
                        term={item.term}
                        definition={item.definition}
                        height={STACK_CARD_HEIGHT}
                        relativeProgress={relativeProgress}
                      />
                    )}
                  />
                </YStack>
              )}

              <YStack px="$screenX" gap="$5">
                <YStack gap="$2">
                  <Text fontSize={20 * MOCKUP_SCALE} fontWeight="800" color="$color">
                    {moduleData.name}
                  </Text>

                  {!!moduleData.description && (
                    <Text fontSize={15} color="$colorMuted">
                      {moduleData.description}
                    </Text>
                  )}

                  <XStack ai="center" gap="$2">
                    <UserAvatar
                      avatarUrl={moduleData.author?.avatarUrl}
                      username={authorName}
                      size={28}
                    />
                    <Text fontSize={10.5 * MOCKUP_SCALE} fontWeight="700" color="$color">
                      {authorName ?? "Unknown"}
                    </Text>
                    {isDeletedAuthor && (
                      <Text fontSize={10.5 * MOCKUP_SCALE} color="$colorMuted">
                        (deleted account)
                      </Text>
                    )}
                    <Text fontSize={10.5 * MOCKUP_SCALE} color="$colorMuted">
                      · {moduleData.itemsCount} term
                      {moduleData.itemsCount !== 1 ? "s" : ""}
                    </Text>
                    <View style={{ marginLeft: "auto" }}>
                      <Badge tone={moduleData.isPublic ? "mint" : "neutral"}>
                        {moduleData.isPublic ? "Public" : "Private"}
                      </Badge>
                    </View>
                  </XStack>
                </YStack>

                {moduleData.tags && moduleData.tags.length > 0 && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  >
                    <XStack gap="$2">
                      {moduleData.tags.map((tag) => (
                        <XStack
                          key={tag}
                          bg="$glassBg"
                          borderWidth={1}
                          borderColor="$glassBorder"
                          br="$10"
                          px="$3"
                          py="$1.5"
                          ai="center"
                          gap="$1.5"
                        >
                          <Text fontSize={13} color="$colorSecondary">
                            {tag}
                          </Text>
                          {isOwner && (
                            <Pressable
                              hitSlop={8}
                              onPress={() => handleDeleteTag(tag)}
                            >
                              <X size={12} color="$colorMuted" />
                            </Pressable>
                          )}
                        </XStack>
                      ))}
                    </XStack>
                  </ScrollView>
                )}

                {isOwner ? (
                  <YStack gap="$3">
                    {studyNow && (
                      <AppButton
                        icon={<Play size={16} color="$onAccentText" fill="$onAccentText" />}
                        onPress={() => studyNow.onPress(moduleData, flashcards)}
                      >
                        Study now
                      </AppButton>
                    )}

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 6 * MOCKUP_SCALE }}
                    >
                      {modeChips.map(({ key, label, Icon, locked, onPress }) => (
                        <Pressable
                          key={key}
                          onPress={() => onPress(moduleData, flashcards)}
                        >
                          <YStack
                            width={CHIP_WIDTH}
                            br={13 * MOCKUP_SCALE}
                            px={4 * MOCKUP_SCALE}
                            py={8 * MOCKUP_SCALE}
                            ai="center"
                            jc="center"
                            gap={3 * MOCKUP_SCALE}
                            pos="relative"
                            opacity={locked ? 0.5 : 1}
                            bg="$glassBgSubtle"
                            borderWidth={1}
                            borderColor="$glassBorder"
                          >
                            {locked && (
                              <View
                                style={{
                                  position: "absolute",
                                  top: 5,
                                  right: 5,
                                  opacity: 0.6,
                                }}
                              >
                                <Lock size={10} color="$colorMuted" />
                              </View>
                            )}
                            <Icon size={13 * MOCKUP_SCALE} color="$colorSecondary" />
                            <Text
                              fontSize={9.5 * MOCKUP_SCALE}
                              fontWeight="600"
                              color="$colorSecondary"
                              numberOfLines={1}
                            >
                              {label}
                            </Text>
                          </YStack>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </YStack>
                ) : (
                  <AppButton
                    icon={<BookmarkPlus size={18} color="$onAccentText" />}
                    loading={saving}
                    onPress={handleSaveToLibrary}
                  >
                    Save to library
                  </AppButton>
                )}

                {sortedFlashcards.length === 0 ? (
                  <StateCard
                    tone="empty"
                    icon={Sparkles}
                    title="No cards yet"
                    subtitle="This module doesn't have any flashcards yet"
                    buttonLabel={isOwner ? "Add cards" : undefined}
                    onButtonPress={isOwner ? openEditSheet : undefined}
                  />
                ) : (
                  <YStack gap="$3">
                    <XStack ai="center" jc="space-between">
                      <SectionTitle tone="eyebrow">
                        Terms · {sortedFlashcards.length}
                      </SectionTitle>
                      <Pressable onPress={() => setSortSheetOpen(true)}>
                        <XStack ai="center" gap="$1" py="$1" px="$2">
                          <Text fontSize={13} color="$colorMuted">
                            {sortOrder === "original" ? "Original" : "A–Z"}
                          </Text>
                          <AlignJustify size={14} color="$colorMuted" />
                        </XStack>
                      </Pressable>
                    </XStack>

                    <YStack gap={7 * MOCKUP_SCALE}>
                      {sortedFlashcards.map((card) => (
                        <AppCard
                          key={card.id}
                          variant="flat"
                          accentBorder
                          br={14 * MOCKUP_SCALE}
                          px={11 * MOCKUP_SCALE}
                          py={9 * MOCKUP_SCALE}
                          gap="$1"
                        >
                          <XStack ai="flex-start" jc="space-between" gap="$2">
                            <Text
                              f={1}
                              fontSize={12 * MOCKUP_SCALE}
                              fontWeight="700"
                              color="$color"
                            >
                              {cardSideText(card.term)}
                            </Text>
                            <XStack gap="$3" ai="center">
                              <Pressable hitSlop={8}>
                                <Volume2 size={16} color="$colorMuted" />
                              </Pressable>
                              {isOwner && (
                                <Pressable
                                  hitSlop={8}
                                  onPress={() => handleToggleStar(card)}
                                >
                                  <Star
                                    size={16}
                                    color={
                                      card.isStarred ? LIME : "$colorMuted"
                                    }
                                    fill={
                                      card.isStarred ? LIME : "transparent"
                                    }
                                  />
                                </Pressable>
                              )}
                            </XStack>
                          </XStack>
                          <Text fontSize={10.5 * MOCKUP_SCALE} color="$colorMuted">
                            {cardSideText(card.definition)}
                          </Text>
                        </AppCard>
                      ))}
                    </YStack>
                  </YStack>
                )}
              </YStack>
            </>
          )}
        </YStack>
      </ScrollView>

      <AppSheet
        open={menuSheetOpen}
        onOpenChange={setMenuSheetOpen}
        title="Module"
      >
        <YStack gap="$3">
          <AppButton
            variant="secondary"
            icon={<Pencil size={18} color="$color" />}
            onPress={openEditSheet}
          >
            Edit module
          </AppButton>
          <AppButton
            variant="danger"
            icon={<Trash2 size={18} color="white" />}
            onPress={handleDeleteModule}
          >
            Delete module
          </AppButton>
        </YStack>
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

      <AppSheet
        open={sortSheetOpen}
        onOpenChange={setSortSheetOpen}
        title="Sort by"
      >
        <YStack gap="$2">
          {(["original", "alphabetical"] as SortOrder[]).map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                setSortOrder(option);
                setSortSheetOpen(false);
              }}
            >
              <XStack
                bg="$glassBg"
                borderWidth={1}
                borderColor="$glassBorder"
                br="$4"
                px="$4"
                py="$3"
                ai="center"
              >
                <Text f={1} fontSize="$5" color="$color">
                  {option === "original" ? "Original" : "Alphabetical"}
                </Text>
                {sortOrder === option && <Check size={18} color="$color" />}
              </XStack>
            </Pressable>
          ))}
        </YStack>
      </AppSheet>
    </YStack>
  );
}
