import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { FlashcardSm } from "@/src/components/flashcards/Flashcard-sm";
import { Flashcard, Module } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, View, ViewToken, useWindowDimensions } from "react-native";
import { Text, XStack, YStack } from "tamagui";

const GAP = 12;
const PEEK = 28;

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width: screenWidth } = useWindowDimensions();

  const CARD_WIDTH = screenWidth - PEEK * 2 - GAP;
  const SIDE_PADDING = PEEK;

  useEffect(() => {
    if (!id) return;
    fetchData();
  }, [id]);

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

      const moduleData: Module = {
        ...rawModule,
        itemsCount: rawModule._count?.flashcards ?? 0,
        folderIds: rawModule.folderId ? [rawModule.folderId] : [],
      };

      setModuleData(moduleData);
      setFlashcards(flashcardsData);
    } catch (err) {
      console.error("[ModuleScreen] fetch error:", err);
      setError("Failed to load module");
    } finally {
      setLoading(false);
    }
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
      <ScreenHeader title={moduleData?.name ?? "Module"} />

      <YStack f={1} gap="$4" pt="$4">
        {loading && (
          <Text color="$colorMuted" textAlign="center">
            Loading...
          </Text>
        )}
        {error && (
          <Text color="$statusDanger" textAlign="center">
            {error}
          </Text>
        )}

        {flashcards.length > 0 && (
          <>
            <FlatList
              data={flashcards}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              snapToInterval={CARD_WIDTH + GAP}
              decelerationRate="fast"
              contentContainerStyle={{ paddingHorizontal: SIDE_PADDING }}
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
                    height: 8,
                    borderRadius: 4,
                    width: i === currentIndex ? 12 : 8,
                    backgroundColor: i === currentIndex ? "#9696ab" : "#E2E8F0",
                  }}
                />
              ))}
            </XStack>
          </>
        )}
      </YStack>
    </YStack>
  );
}
