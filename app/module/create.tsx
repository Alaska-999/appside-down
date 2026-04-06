import { ScreenHeaderCreate } from "@/src/components/common/ScreenHeaderCreate";
import { useAuthStore } from "@/src/store/useAuthStore";
import { Flashcard, Module } from "@/src/types";
import { Plus, X } from "@tamagui/lucide-icons";
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

  const handleCreateModule = () => {
    if (!name) {
      alert("Please enter a name for the module");
      return;
    }
    const moduleId = crypto.randomUUID();
    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      alert("Please login to create a module");
      return;
    }
    const items: Flashcard[] = flashcards.map((i) => ({
      id: crypto.randomUUID(),
      moduleId: moduleId,
      term: i.term,
      definition: i.definition,
      isStarred: false,
      status: "still_learning",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const module: Module = {
      id: moduleId,
      userId: userId,
      isFavorite: false,
      flashcards: items,
      itemsCount: items.length,
      name: name || "Untitled Module",
      description: description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    console.log("Module Data:", module);
    router.push({
      pathname: "/module/[id]",
      params: { id: module.id },
    });
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
              <YStack
                key={index}
                bg="$backgroundHover"
                p="$4"
                br="$4"
                gap="$5"
                pos="relative"
              >
                {flashcards.length > 1 && (
                  <Button
                    pos="absolute"
                    top="$2"
                    right="$2"
                    size="$2"
                    circular
                    chromeless
                    icon={<X size="$1" color="$colorSecondary" o={0.7} />}
                    onPress={() => removeCard(index)}
                    hoverStyle={{ bg: "$backgroundPress" }}
                  />
                )}

                <YStack mt="$2">
                  <Input
                    unstyled
                    placeholder="Enter term"
                    value={flashcard.term}
                    onChangeText={(text) => updateCard(index, "term", text)}
                    fontSize="$5"
                    pb="$1"
                    bbw={1}
                    bc="$borderColor"
                    focusStyle={{ bc: "$primary", bbw: 2 }}
                  />
                  <Text
                    fontSize="$1"
                    color="$colorSecondary"
                    mt="$1"
                    fow="600"
                    o={0.7}
                  >
                    TERM
                  </Text>
                </YStack>

                <YStack>
                  <Input
                    unstyled
                    placeholder="Enter definition"
                    value={flashcard.definition}
                    onChangeText={(text) =>
                      updateCard(index, "definition", text)
                    }
                    fontSize="$5"
                    pb="$1"
                    bbw={1}
                    bc="$borderColor"
                    focusStyle={{ bc: "$primary", bbw: 2 }}
                  />
                  <Text
                    fontSize="$1"
                    color="$colorSecondary"
                    mt="$1"
                    fow="600"
                    o={0.7}
                  >
                    DEFINITION
                  </Text>
                </YStack>
              </YStack>
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
