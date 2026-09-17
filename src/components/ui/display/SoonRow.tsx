import { ICON_MUTED } from "@/src/constants/iconColors";
import { Lock } from "lucide-react-native";
import { Text, XStack } from "tamagui";

interface SoonRowProps {
  label: string;
}

export function SoonRow({ label }: SoonRowProps) {
  return (
    <XStack
      ai="center"
      gap={10}
      px={16}
      py={13}
      br={18}
      bg="$glassBgSubtle"
      borderWidth={1}
      borderStyle="dashed"
      borderColor="$borderColor"
    >
      <Lock size={16} color={ICON_MUTED} strokeWidth={1.8} />
      <Text fontSize={12.5} color="$textMuted">
        <Text fontSize={12.5} fontWeight="600" color="$mutedLight">
          {label}
        </Text>{" "}
        — coming soon
      </Text>
    </XStack>
  );
}
