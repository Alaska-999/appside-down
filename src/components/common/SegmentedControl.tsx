import { Pressable } from "react-native";
import { Text, XStack } from "tamagui";

interface SegmentedControlProps {
  options: string[];
  selected: number;
  onChange: (index: number) => void;
}

export function SegmentedControl({ options, selected, onChange }: SegmentedControlProps) {
  return (
    <XStack bg="$backgroundCard" br="$4" p="$1" gap="$1">
      {options.map((option, i) => (
        <Pressable
          key={option}
          onPress={() => onChange(i)}
          style={{ flex: 1 }}
        >
          <XStack
            bg={selected === i ? "$background" : "transparent"}
            br="$3"
            py="$2"
            jc="center"
            ai="center"
            style={selected === i ? { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 } : {}}
          >
            <Text
              fontSize="$4"
              fontWeight={selected === i ? "600" : "400"}
              color={selected === i ? "$color" : "$colorMuted"}
            >
              {option}
            </Text>
          </XStack>
        </Pressable>
      ))}
    </XStack>
  );
}
