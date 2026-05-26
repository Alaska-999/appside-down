import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { EditCardsSheet } from "@/src/components/flashcards/EditCardsSheet";
import { FlashcardSm } from "@/src/components/flashcards/Flashcard-sm";
import { Flashcard, Module } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import {
  AlignJustify,
  ArrowLeftRight,
  Check,
  CheckCircle2,
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
import { Avatar, Button, Sheet, Text, XStack, YStack } from "tamagui";

const GAP = 12;
const PEEK = 28;

type SortOrder = "original" | "alphabetical";

const getActionButtons = (id: string) => [
  { key: "flashcards", label: "Flashcards", Icon: Layers, locked: false, onPress: () => router.push({ pathname: "/module/[id]/flashcards", params: { id } }) },
  { key: "learn", label: "Learn", Icon: GraduationCap, locked: true, onPress: () => {} },
  { key: "test", label: "Test", Icon: FileText, locked: false, onPress: () => {} },
  { key: "match", label: "Match", Icon: ArrowLeftRight, locked: false, onPress: () => {} },
  { key: "blast", label: "Blast", Icon: Zap, locked: false, onPress: () => {} },
  { key: "blocks", label: "Blocks", Icon: LayoutGrid, locked: false, onPress: () => {} },
];

export default function ModuleScreen() {
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
  const { width: screenWidth } = useWindowDimensions();

  const CARD_WIDTH = screenWidth - PEEK * 2 - GAP;

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [moduleRes, flashcardsRes] = await Promise.all([
        protectedFetch(`${process.env.EXPO_PUBLIC_API_URL}/modules/${id}`, { method: "GET" }),
        protectedFetch(`${process.env.EXPO_PUBLIC_API_URL}/flashcards/module/${id}`, { method: "GET" }),
      ]);
      if (!moduleRes.ok) throw new Error(`Module error: ${moduleRes.status}`);
      if (!flashcardsRes.ok) throw new Error(`Flashcards error: ${flashcardsRes.status}`);

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
        prev.map((c) => (c.id === card.id ? { ...c, isStarred: card.isStarred } : c)),
      );
    }
  };

  const openEditSheet = () => {
    setMenuSheetOpen(false);
    setTimeout(() => setEditSheetOpen(true), 300);
  };

  const handleSaved = (updatedCards: Flashcard[]) => {
    setFlashcards(updatedCards);
    setModuleData((prev) => prev ? { ...prev, itemsCount: updatedCards.length } : prev);
  };

  const handleDeleteModule = () => {
    setMenuSheetOpen(false);
    setTimeout(() => {
      Alert.alert("Delete module", "This will permanently delete the module and all its cards.", [
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
      ]);
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

  return (
    <YStack f={1} bg="$background">
      <ScreenHeader
        right={
          <Pressable hitSlop={8} onPress={() => setMenuSheetOpen(true)}>
            <MoreHorizontal size={22} color="$color" />
          </Pressable>
        }
      />

      {loading && (
        <Text color="$colorMuted" textAlign="center" mt="$4">Loading...</Text>
      )}
      {error && (
        <Text color="$statusDanger" textAlign="center" mt="$4">{error}</Text>
      )}

      {moduleData && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack pb="$10" gap="$6">

            {/* Flashcard carousel */}
            {flashcards.length > 0 && (
              <YStack gap="$3" pt="$4">
                <FlatList
                  data={flashcards}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ flexGrow: 0 }}
                  snapToInterval={CARD_WIDTH + GAP}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingHorizontal: PEEK }}
                  ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
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
                        backgroundColor: i === currentIndex ? "#9696ab" : "#E2E8F0",
                      }}
                    />
                  ))}
                </XStack>
              </YStack>
            )}

            <YStack px="$4" gap="$5">

              {/* Title + author */}
              <YStack gap="$2">
                <XStack ai="flex-start" jc="space-between" gap="$3">
                  <Text f={1} fontSize="$8" fontWeight="bold" color="$color" lh={36}>
                    {moduleData.name}
                  </Text>
                  <Pressable hitSlop={8}>
                    <CheckCircle2 size={24} color="$colorMuted" />
                  </Pressable>
                </XStack>

                <XStack ai="center" gap="$2">
                  <Avatar circular size="$3">
                    {moduleData.user?.avatarUrl ? (
                      <Avatar.Image src={moduleData.user.avatarUrl} />
                    ) : null}
                    <Avatar.Fallback bg="$backgroundHover" jc="center" ai="center">
                      <Text fontSize="$2" color="$colorSecondary">
                        {moduleData.user?.username?.[0]?.toUpperCase() ?? "?"}
                      </Text>
                    </Avatar.Fallback>
                  </Avatar>
                  <Text fontSize="$3" fontWeight="600" color="$color">
                    {moduleData.user?.username ?? "Unknown"}
                  </Text>
                  <Text color="$borderColor">·</Text>
                  <Text fontSize="$3" color="$colorMuted">
                    {moduleData.itemsCount} term{moduleData.itemsCount !== 1 ? "s" : ""}
                  </Text>
                </XStack>
              </YStack>

              {/* Tags */}
              {moduleData.tags && moduleData.tags.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <XStack gap="$2">
                    {moduleData.tags.map((tag) => (
                      <XStack
                        key={tag}
                        bg="$backgroundHover"
                        br="$10"
                        px="$3"
                        py="$1"
                        ai="center"
                        gap="$1"
                        borderWidth={1}
                        borderColor="$borderColor"
                      >
                        <Text fontSize="$3" color="$colorSecondary">{tag}</Text>
                        <Pressable hitSlop={8} onPress={() => handleDeleteTag(tag)}>
                          <X size={12} color="$colorMuted" />
                        </Pressable>
                      </XStack>
                    ))}
                  </XStack>
                </ScrollView>
              )}

              {/* Action buttons */}
              <YStack gap="$2">
                {getActionButtons(id).map(({ key, label, Icon, locked, onPress }) => (
                  <Pressable key={key} onPress={onPress}>
                    <XStack
                      bg="$backgroundHover"
                      br="$4"
                      px="$4"
                      py="$3"
                      ai="center"
                      gap="$3"
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <Icon size={20} color="$colorSecondary" />
                      <Text f={1} fontSize="$5" fontWeight="500" color="$color">
                        {label}
                      </Text>
                      {locked && <Lock size={14} color="$colorMuted" />}
                      <ChevronRight size={16} color="$colorMuted" />
                    </XStack>
                  </Pressable>
                ))}
              </YStack>

              {/* Terms section */}
              {sortedFlashcards.length > 0 && (
                <YStack gap="$3">
                  <XStack ai="center" jc="space-between">
                    <Text fontSize="$6" fontWeight="bold" color="$color">Terms</Text>
                    <Pressable onPress={() => setSortSheetOpen(true)}>
                      <XStack ai="center" gap="$1" py="$1" px="$2">
                        <Text fontSize="$3" color="$colorMuted">
                          {sortOrder === "original" ? "Original" : "A–Z"}
                        </Text>
                        <AlignJustify size={14} color="$colorMuted" />
                      </XStack>
                    </Pressable>
                  </XStack>

                  {sortedFlashcards.map((card) => (
                    <YStack
                      key={card.id}
                      bg="$backgroundHover"
                      br="$4"
                      p="$4"
                      gap="$2"
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <XStack ai="flex-start" jc="space-between" gap="$2">
                        <Text f={1} fontSize="$4" fontWeight="600" color="$color">
                          {card.term}
                        </Text>
                        <XStack gap="$3" ai="center">
                          <Pressable hitSlop={8}>
                            <Volume2 size={16} color="$colorMuted" />
                          </Pressable>
                          <Pressable hitSlop={8} onPress={() => handleToggleStar(card)}>
                            <Star
                              size={16}
                              color={card.isStarred ? "$statusWarning" : "$colorMuted"}
                              fill={card.isStarred ? "$statusWarning" : "transparent"}
                            />
                          </Pressable>
                        </XStack>
                      </XStack>
                      <Text fontSize="$4" color="$colorSecondary">
                        {card.definition}
                      </Text>
                    </YStack>
                  ))}
                </YStack>
              )}

            </YStack>
          </YStack>
        </ScrollView>
      )}

      {/* Menu sheet */}
      <Sheet
        modal
        open={menuSheetOpen}
        onOpenChange={setMenuSheetOpen}
        snapPoints={[25]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay bg="$pureBlack" opacity={0.5} />
        <Sheet.Handle />
        <Sheet.Frame p="$4" bg="$background" gap="$3">
          <Button
            size="$5"
            icon={<Pencil size="$1" />}
            bg="$buttonSecondaryBg"
            onPress={openEditSheet}
          >
            <Text f={1} fontSize="$5">Edit cards</Text>
          </Button>
          <Button
            size="$5"
            icon={<Trash2 size="$1" color="$statusDanger" />}
            bg="$buttonSecondaryBg"
            onPress={handleDeleteModule}
          >
            <Text f={1} fontSize="$5" color="$statusDanger">Delete module</Text>
          </Button>
        </Sheet.Frame>
      </Sheet>

      <EditCardsSheet
        open={editSheetOpen}
        onOpenChange={setEditSheetOpen}
        moduleId={id}
        cards={flashcards.map((c) => ({ id: c.id, term: c.term, definition: c.definition }))}
        onSaved={handleSaved}
      />

      {/* Sort sheet */}
      <Sheet
        modal
        open={sortSheetOpen}
        onOpenChange={setSortSheetOpen}
        snapPoints={[25]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay bg="$pureBlack" opacity={0.5} />
        <Sheet.Handle />
        <Sheet.Frame p="$4" bg="$background" gap="$4">
          <Text fontSize="$6" fontWeight="bold">Sort by</Text>
          <YStack gap="$2">
            {(["original", "alphabetical"] as SortOrder[]).map((option) => (
              <Pressable
                key={option}
                onPress={() => {
                  setSortOrder(option);
                  setSortSheetOpen(false);
                }}
              >
                <XStack bg="$buttonSecondaryBg" br="$4" px="$4" py="$3" ai="center">
                  <Text f={1} fontSize="$5" color="$color">
                    {option === "original" ? "Original" : "Alphabetical"}
                  </Text>
                  {sortOrder === option && <Check size={18} color="$color" />}
                </XStack>
              </Pressable>
            ))}
          </YStack>
        </Sheet.Frame>
      </Sheet>

    </YStack>
  );
}
