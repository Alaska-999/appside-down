import { X } from "@tamagui/lucide-icons";
import React, { memo } from "react";
import { Button, Input, Text, YStack } from "tamagui";

interface FlashcardEditItemProps {
  index: number;
  term: string;
  definition: string;
  onUpdate: (
    index: number,
    field: "term" | "definition",
    value: string,
  ) => void;
  onRemove: (index: number) => void;
  showRemove: boolean;
}

export const FlashcardEditItem = memo(
  ({
    index,
    term,
    definition,
    onUpdate,
    onRemove,
    showRemove,
  }: FlashcardEditItemProps) => {
    return (
      <YStack bg="$backgroundHover" p="$4" br="$4" gap="$5" pos="relative">
        {showRemove && (
          <Button
            pos="absolute"
            top="$2"
            right="$2"
            size="$2"
            circular
            chromeless
            icon={<X size="$1" color="$colorSecondary" o={0.7} />}
            onPress={() => onRemove(index)}
          />
        )}

        <YStack mt="$2">
          <Input
            unstyled
            placeholder="Enter term"
            value={term}
            onChangeText={(text) => onUpdate(index, "term", text)}
            fontSize="$5"
            pb="$1"
            bbw={1}
            bc="$borderColor"
            focusStyle={{ bc: "$primary", bbw: 2 }}
          />
          <Text fontSize="$1" color="$colorSecondary" mt="$1" fow="600" o={0.7}>
            TERM
          </Text>
        </YStack>

        <YStack>
          <Input
            unstyled
            placeholder="Enter definition"
            value={definition}
            onChangeText={(text) => onUpdate(index, "definition", text)}
            fontSize="$5"
            pb="$1"
            bbw={1}
            bc="$borderColor"
            focusStyle={{ bc: "$primary", bbw: 2 }}
          />
          <Text fontSize="$1" color="$colorSecondary" mt="$1" fow="600" o={0.7}>
            DEFINITION
          </Text>
        </YStack>
      </YStack>
    );
  },
);
