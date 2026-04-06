import { ScreenHeaderCreate } from "@/src/components/common/ScreenHeaderCreate";
import { FlashcardEditItem } from "@/src/components/flashcards/FlashcardEditItem";
import { useAuthStore } from "@/src/store/useAuthStore";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { Plus } from "@tamagui/lucide-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Button, Input, ScrollView, Text, YStack } from "tamagui";

export default function ModuleCreate() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [flashcards, setFlashcards] = useState([
    { term: "", definition: "" },
    { term: "", definition: "" },
  ]);

  const handleCreateModule = async () => {
    if (!name) {
      alert("Please enter a name for the module");
      return;
    }
    const token = useAuthStore.getState().token;
    const user = useAuthStore.getState().user;
    if (!token || !user) {
      alert("Please login to create a module");
      return;
    }

    const items = flashcards.map((i) => ({
      term: i.term,
      definition: i.definition,
    }));

    if (items.length === 0) {
      alert("Please add at least one complete card");
      return;
    }

    const module = {
      flashcards: items,
      name: name || "Untitled Module",
      description: description || "",
    };
    console.log("Module Data:", module);
    try {
      const response = await protectedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/modules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(module),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to create module");
      }
      const newModule = await response.json();
      router.push({
        pathname: "/module/[id]",
        params: { id: newModule.id },
      });
    } catch (error) {
      console.error(error);
      alert("Failed to create module");
    }
  };

  const addCard = () => {
    setFlashcards([...flashcards, { term: "", definition: "" }]);
  };

  const updateCard = (
    index: number,
    field: "term" | "definition",
    value: string,
  ) => {
    const updatedCards = [...flashcards];
    updatedCards[index][field] = value;
    setFlashcards(updatedCards);
  };

  const removeCard = (index: number) => {
    if (flashcards.length > 1) {
      setFlashcards(flashcards.filter((_, i) => i !== index));
    }
  };

  return (
    <YStack f={1} bg="$background">
      <YStack pos="absolute" top={0} left={0} right={0} zi={100}>
        <ScreenHeaderCreate onCreate={handleCreateModule} />
      </YStack>
      <ScrollView f={1} contentContainerStyle={{ pt: 100, pb: 40, px: "$4" }}>
        <YStack gap="$4" width="100%">
          <Text
            fontSize="$8"
            fontWeight="bold"
            textAlign="center"
            mb="$2"
            mt="$4"
          >
            New Module
          </Text>

          <Input
            placeholder="Untitled Module"
            value={name}
            onChangeText={setName}
            size="$5"
          />

          <Input
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            size="$4"
            bg="transparent"
          />

          <YStack gap="$6" mt="$6">
            {flashcards.map((flashcard, index) => (
              <FlashcardEditItem
                key={index}
                index={index}
                term={flashcard.term}
                definition={flashcard.definition}
                onUpdate={updateCard}
                onRemove={removeCard}
                showRemove={flashcards.length > 1}
              />
            ))}
          </YStack>

          <Button
            icon={<Plus size="$1" />}
            onPress={addCard}
            mt="$4"
            bg="$buttonSecondaryBg"
            br="$10"
          >
            <Text color="$buttonSecondaryText">Add Card</Text>
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
