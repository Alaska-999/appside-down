import { GlassPill } from "@/src/components/ui/GlassPill";
import { Plus } from "lucide-react-native";

export function AddPill({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <GlassPill
      tone="accent"
      size="lg"
      icon={Plus}
      label={label}
      onPress={onPress}
    />
  );
}
