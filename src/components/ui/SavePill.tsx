import { AppButton } from "@/src/components/ui/Button";
import { ICON_NEAR_BLACK } from "@/src/constants/iconColors";
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
    <AppButton
      variant="primary"
      size="sm"
      icon={<Check size={17} color={ICON_NEAR_BLACK} strokeWidth={2.4} />}
      onPress={onPress}
      loading={loading}
      disabled={!enabled}
    >
      {label}
    </AppButton>
  );
}
