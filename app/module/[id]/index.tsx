import { EditCardsSheet } from "@/src/components/flashcards/EditCardsSheet";
import { FlashcardSm } from "@/src/components/flashcards/Flashcard-sm";
import { AuroraGlow } from "@/src/components/ui/AuroraGlow";
import { UserAvatar } from "@/src/components/common/UserAvatar";
import { Badge } from "@/src/components/ui/Badge";
import { AppButton } from "@/src/components/ui/Button";
import { AppCard } from "@/src/components/ui/Card";
import { GlassSheet } from "@/src/components/ui/GlassSheet";
import { IconButton } from "@/src/components/ui/IconButton";
import { useAuthStore } from "@/src/store/useAuthStore";
import { useGameStore } from "@/src/store/useGameStore";
import { Flashcard, Module } from "@/src/types";
import { cardSideText } from "@/src/utils/cardText";
import { protectedFetch } from "@/src/utils/protectedFetch";
import {
  AlignJustify,
  ArrowLeftRight,
  BookmarkPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  GraduationCap,
  Layers,
  LayoutGrid,
  Lock,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
  Volume2,
  X,
  Zap,
} from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  View,
  ViewToken,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text, useTheme, XStack, YStack } from "tamagui";

const GAP = 12;
const PEEK = 28;
const LIME = "#A3E635";

type SortOrder = "original" | "alphabetical";

export default function ModuleScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortOrder, setSortOrder] = useState<SortOrder>("original");
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [menuSheetOpen, setMenuSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { width: screenWidth } = useWindowDimensions();

  const CARD_WIDTH = screenWidth - PEEK * 2 - GAP;
  const initGame = useGameStore((state) => state.initGame);
  const currentModule = useGameStore((state) => state.currentModule);

  const { user } = useAuthStore();
  const isOwner = moduleData?.user?.id === user?.id;

  useEffect(() => {
    fetchData();
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
        protectedFetch(`${process.env.EXPO_PUBLIC_API_URL}/modules/${id}`, {
          method: "GET",
        }),
        protectedFetch(
          `${process.env.EXPO_PUBLIC_API_URL}/flashcards/module/${id}`,
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
        folderIds: rawModule.folderId ? [rawModule.folderId] : [],
        tags: rawModule.tags ?? [],
        user: rawModule.user ?? null,
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
        `${process.env.EXPO_PUBLIC_API_URL}/flashcards/${card.id}`,
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
        `${process.env.EXPO_PUBLIC_API_URL}/modules/${id}`,
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
        `${process.env.EXPO_PUBLIC_API_URL}/modules/${id}/save`,
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
                  `${process.env.EXPO_PUBLIC_API_URL}/modules/${id}`,
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
              `${process.env.EXPO_PUBLIC_API_URL}/modules/${id}`,
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

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 });

  const actionButtons = moduleData ? getActionButtons(id) : [];
  const actionRows = [
    actionButtons.slice(0, 3),
    actionButtons.slice(3, 6),
  ];

  return (
    <YStack f={1} bg="$background">
      <ScrollView showsVerticalScrollIndicator={false}>
        <AuroraGlow mintOpacity={0.11} limeOpacity={0.09} />

        <YStack pb="$10" gap="$6">
          <XStack px="$4" pt={insets.top + 10} jc="space-between" ai="center">
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

          {loading && (
            <Text color="$colorMuted" textAlign="center" mt="$4">
              Loading...
            </Text>
          )}
          {error && (
            <Text color="$statusDanger" textAlign="center" mt="$4">
              {error}
            </Text>
          )}

          {moduleData && (
            <>
              {flashcards.length > 0 && (
                <YStack gap="$3">
                  <FlatList
                    data={flashcards}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ flexGrow: 0 }}
                    snapToInterval={CARD_WIDTH + GAP}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingHorizontal: PEEK }}
                    ItemSeparatorComponent={() => (
                      <View style={{ width: GAP }} />
                    )}
                    keyExtractor={(item) => item.id}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig.current}
                    renderItem={({ item }) => (
                      <FlashcardSm
                        term={item.term}
                        definition={item.definition}
                        width={CARD_WIDTH}
                      />
                    )}
                  />
                  <XStack gap="$2" jc="center">
                    {flashcards.map((_, i) => (
                      <View
                        key={i}
                        style={{
                          height: 6,
                          borderRadius: 3,
                          width: i === currentIndex ? 16 : 6,
                          backgroundColor:
                            i === currentIndex
                              ? theme.accentGradientStart.get()
                              : "rgba(220,255,245,0.18)",
                        }}
                      />
                    ))}
                  </XStack>
                </YStack>
              )}

              <YStack px="$4" gap="$5">
                <YStack gap="$2">
                  <Text fontSize={24} fontWeight="800" color="$color">
                    {moduleData.name}
                  </Text>

                  <XStack ai="center" gap="$2">
                    <UserAvatar
                      avatarUrl={moduleData.user?.avatarUrl}
                      username={moduleData.user?.username}
                      size={35}
                    />
                    <Text fontSize={15} fontWeight="700" color="$color">
                      {moduleData.user?.username ?? "Unknown"}
                    </Text>
                    <Text fontSize={15} color="$colorMuted">
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
                    <Text
                      fontSize="$3"
                      color="$auroraMuted"
                      fontWeight="600"
                      tt="uppercase"
                    >
                      Study modes
                    </Text>
                    <YStack gap={11}>
                      {actionRows.map((row, rowIndex) => (
                        <XStack key={rowIndex} gap={11}>
                          {row.map(({ key, label, Icon, locked, onPress }) => {
                            const isAccent = key === "flashcards";
                            return (
                              <Pressable
                                key={key}
                                style={{ flex: 1 }}
                                onPress={() => onPress(moduleData, flashcards)}
                              >
                                <YStack
                                  br={22}
                                  pt={16}
                                  px={8}
                                  pb={14}
                                  ai="center"
                                  jc="center"
                                  pos="relative"
                                  opacity={locked ? 0.5 : 1}
                                  bg={isAccent ? "$mintGlassBg" : "$glassBg"}
                                  borderWidth={1}
                                  borderColor={
                                    isAccent
                                      ? "rgba(45,212,191,0.45)"
                                      : "$glassBorder"
                                  }
                                  shadowColor={
                                    isAccent ? "#2dd4bf" : undefined
                                  }
                                  shadowOpacity={isAccent ? 0.2 : 0}
                                  shadowRadius={isAccent ? 22 : 0}
                                  shadowOffset={{ width: 0, height: 0 }}
                                >
                                  {locked && (
                                    <View
                                      style={{
                                        position: "absolute",
                                        top: 8,
                                        right: 9,
                                        opacity: 0.6,
                                      }}
                                    >
                                      <Lock size={12} color="$colorMuted" />
                                    </View>
                                  )}
                                  {isAccent ? (
                                    <LinearGradient
                                      colors={[
                                        theme.accentGradientStart.get(),
                                        theme.accentGradientEnd.get(),
                                      ]}
                                      start={{ x: 0, y: 0 }}
                                      end={{ x: 1, y: 1 }}
                                      style={{
                                        width: 46,
                                        height: 46,
                                        borderRadius: 15,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: 6,
                                      }}
                                    >
                                      <Icon
                                        size={20}
                                        color={theme.onAccentText.get()}
                                      />
                                    </LinearGradient>
                                  ) : (
                                    <YStack
                                      width={46}
                                      height={46}
                                      br={15}
                                      bg="$glassBgStrong"
                                      borderWidth={1}
                                      borderColor="$glassBorder"
                                      ai="center"
                                      jc="center"
                                      mb={6}
                                    >
                                      <Icon
                                        size={20}
                                        color="$colorSecondary"
                                      />
                                    </YStack>
                                  )}
                                  <Text
                                    fontSize={14}
                                    fontWeight="700"
                                    color="$color"
                                  >
                                    {label}
                                  </Text>
                                </YStack>
                              </Pressable>
                            );
                          })}
                        </XStack>
                      ))}
                    </YStack>
                  </YStack>
                ) : (
                  <AppButton
                    icon={<BookmarkPlus size={18} color="$onAccentText" />}
                    disabled={saving}
                    onPress={handleSaveToLibrary}
                  >
                    {saving ? "Saving..." : "Save to library"}
                  </AppButton>
                )}

                {sortedFlashcards.length > 0 && (
                  <YStack gap="$3">
                    <XStack ai="center" jc="space-between">
                      <Text
                        fontSize="$3"
                        color="$auroraMuted"
                        fontWeight="600"
                        tt="uppercase"
                      >
                        Terms · {sortedFlashcards.length}
                      </Text>
                      <Pressable onPress={() => setSortSheetOpen(true)}>
                        <XStack ai="center" gap="$1" py="$1" px="$2">
                          <Text fontSize={13} color="$colorMuted">
                            {sortOrder === "original" ? "Original" : "A–Z"}
                          </Text>
                          <AlignJustify size={14} color="$colorMuted" />
                        </XStack>
                      </Pressable>
                    </XStack>

                    <YStack gap="$2">
                      {sortedFlashcards.map((card) => (
                        <AppCard key={card.id} variant="soft" size="md" gap="$2">
                          <XStack ai="flex-start" jc="space-between" gap="$2">
                            <Text
                              f={1}
                              fontSize={17}
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
                          <Text fontSize={16} color="$colorSecondary">
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

      <GlassSheet
        open={menuSheetOpen}
        onOpenChange={setMenuSheetOpen}
        title="Module"
        snapPoints={[25]}
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
      </GlassSheet>

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

      <GlassSheet
        open={sortSheetOpen}
        onOpenChange={setSortSheetOpen}
        title="Sort by"
        snapPoints={[25]}
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
      </GlassSheet>
    </YStack>
  );
}
