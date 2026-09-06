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
  onSave: () => void;
}

export function ModalFormHeader({
  title,
  onClose,
  saveEnabled,
  saveLoading,
  onSave,
}: ModalFormHeaderProps) {
  return (
    <XStack ai="center" gap={15} mb={18}>
      <IconButton
        variant="liquidGlass"
        icon={<X size={22} color={ICON_ON_GLASS} strokeWidth={1.9} />}
        onPress={onClose}
        accessibilityLabel="Close"
      />
      <Text f={1} fontSize={18} fontWeight="800" color="$color">
        {title}
      </Text>
      <SavePill enabled={saveEnabled} loading={saveLoading} onPress={onSave} />
    </XStack>
  );
}
