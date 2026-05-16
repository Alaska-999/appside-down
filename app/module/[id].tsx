import { ScreenHeader } from "@/src/components/common/ScreenHeader";
import { FlashcardSm } from "@/src/components/flashcards/Flashcard-sm";
import { Flashcard, Module } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Text, YStack } from "tamagui";

export default function ModuleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      console.log("[ModuleScreen] module:", moduleData);
      console.log("[ModuleScreen] flashcards:", flashcardsData);

      setModuleData(moduleData);
      setFlashcards(flashcardsData);
    } catch (err) {
      console.error("[ModuleScreen] fetch error:", err);
      setError("Failed to load module");
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack f={1} bg="$background">
      <YStack pos="absolute" top={0} left={0} right={0} zi={100} p="$4">
        <ScreenHeader title={moduleData?.name ?? "Module"} />
        {loading && <Text color="$colorMuted">Loading...</Text>}
        {error && <Text color="$statusDanger">{error}</Text>}
        {flashcards.map((card) => (
          <FlashcardSm
            key={card.id}
            term={card.term}
            definition={card.definition}
          />
        ))}
      </YStack>
    </YStack>
  );
}
