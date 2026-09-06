import { AppButton } from "@/src/components/ui/Button";
import { ICON_LIME_LIGHT } from "@/src/constants/iconColors";
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
      variant="soft"
      size="sm"
      icon={<Check size={17} color={ICON_LIME_LIGHT} strokeWidth={3} />}
      onPress={onPress}
      loading={loading}
      disabled={!enabled}
    >
      {label}
    </AppButton>

    // <AppButton
    //   variant="glass"
    //   size="sm"
    //   icon={<Check size={17} color={ICON_LIME} strokeWidth={3} />}
    //   onPress={onPress}
    //   loading={loading}
    //   disabled={!enabled}
    // >
    //   {label}
    // </AppButton>
  );
}
