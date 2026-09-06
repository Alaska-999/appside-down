import { IconButton } from "@/src/components/ui/IconButton";
import { SavePill } from "@/src/components/ui/SavePill";
import { ICON_ON_GLASS } from "@/src/constants/iconColors";
import { X } from "lucide-react-native";
import { Text, XStack } from "tamagui";

interface ModalFormHeaderProps {
  title: string;
  onClose: () => void;
  saveEnabled: boolean;
  saveLoading: boolean;
  saveVariant?: "liquid" | "soft" | "primary";
  onSave: () => void;
}

export function ModalFormHeader({
  title,
  onClose,
  saveEnabled,
  saveLoading,
  saveVariant,
  onSave,
}: ModalFormHeaderProps) {
  return (
    <XStack ai="center" gap={15} mb={18} py={5}>
      <IconButton
        variant="liquidGlass"
        icon={<X size={24} color={ICON_ON_GLASS} strokeWidth={1.9} />}
        onPress={onClose}
        accessibilityLabel="Close"
      />
      <Text f={1} fontSize={20} fontWeight="800" color="$white">
        {title}
      </Text>
      <SavePill
        enabled={saveEnabled}
        loading={saveLoading}
        onPress={onSave}
        variant={saveVariant}
      />
    </XStack>
  );
}
