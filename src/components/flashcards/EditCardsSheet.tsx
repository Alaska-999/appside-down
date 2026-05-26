import { FlashcardEditItem } from "@/src/components/flashcards/FlashcardEditItem";
import { Flashcard } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { Plus, X } from "@tamagui/lucide-icons";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView } from "react-native";
import { Button, Sheet, Text, XStack, YStack } from "tamagui";

type EditableCard = {
  id: string;
  term: string;
  definition: string;
  isNew?: boolean;
};

interface EditCardsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  cards: { id: string; term: string; definition: string }[];
  onSaved: (updatedCards: Flashcard[]) => void;
}

export function EditCardsSheet({ open, onOpenChange, moduleId, cards, onSaved }: EditCardsSheetProps) {
  const [editCards, setEditCards] = useState<EditableCard[]>([]);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setEditCards(cards.map((c) => ({ ...c })));
      setRemovedIds([]);
    }
  }, [open]);

  const handleUpdate = (index: number, field: "term" | "definition", value: string) => {
    setEditCards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemove = (index: number) => {
    const card = editCards[index];
    if (!card.isNew) {
      setRemovedIds((prev) => [...prev, card.id]);
    }
    setEditCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    setEditCards((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, term: "", definition: "", isNew: true },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const [deletedResults, patchedResults, createdResults] = await Promise.all([
        Promise.all(
          removedIds.map((cardId) =>
            protectedFetch(`${process.env.EXPO_PUBLIC_API_URL}/flashcards/${cardId}`, {
              method: "DELETE",
            }),
          ),
        ),
        Promise.all(
          editCards
            .filter((c) => !c.isNew)
            .map((c) =>
              protectedFetch(`${process.env.EXPO_PUBLIC_API_URL}/flashcards/${c.id}`, {
                method: "PATCH",
                body: JSON.stringify({ term: c.term, definition: c.definition }),
              }).then((r) => r.json()),
            ),
        ),
        Promise.all(
          editCards
            .filter((c) => c.isNew)
            .map((c) =>
              protectedFetch(`${process.env.EXPO_PUBLIC_API_URL}/flashcards`, {
                method: "POST",
                body: JSON.stringify({ term: c.term, definition: c.definition, moduleId }),
              }).then((r) => r.json()),
            ),
        ),
      ]);

      onSaved([...patchedResults, ...createdResults]);
      onOpenChange(false);
    } catch (err) {
      console.error("[EditCardsSheet] save error:", err);
      Alert.alert("Error", "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[90]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay bg="$pureBlack" opacity={0.5} />
      <Sheet.Handle />
      <Sheet.Frame bg="$background">
        <XStack
          px="$4"
          pt="$3"
          pb="$3"
          ai="center"
          jc="space-between"
          borderBottomWidth={1}
          borderColor="$borderColor"
        >
          <Pressable hitSlop={8} onPress={() => onOpenChange(false)}>
            <X size={20} color="$colorMuted" />
          </Pressable>
          <Text fontSize="$5" fontWeight="bold" color="$color">Edit cards</Text>
          <Button size="$3" bg="$buttonBg" br="$10" onPress={handleSave} disabled={saving}>
            <Text color="$buttonText" fontSize="$3">
              {saving ? "Saving..." : "Save"}
            </Text>
          </Button>
        </XStack>

        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack px="$4" py="$4" gap="$6">
            {editCards.map((card, index) => (
              <FlashcardEditItem
                key={card.id}
                index={index}
                term={card.term}
                definition={card.definition}
                onUpdate={handleUpdate}
                onRemove={handleRemove}
                showRemove={editCards.length > 1}
              />
            ))}

            <Button
              icon={<Plus size="$1" />}
              onPress={handleAdd}
              bg="$buttonSecondaryBg"
              br="$10"
            >
              <Text color="$buttonSecondaryText">Add Card</Text>
            </Button>
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
