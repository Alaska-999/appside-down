import { GlassPill } from "@/src/components/ui/GlassPill";
import { Check } from "lucide-react-native";

export function SavePill({
  label = "Save",
  enabled = true,
  loading,
  onPress,
}: {
  label?: string;
  enabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <GlassPill
      tone="save"
      size="md"
      icon={Check}
      label={label}
      onPress={onPress}
      loading={loading}
      disabled={!enabled}
    />
  );
}
