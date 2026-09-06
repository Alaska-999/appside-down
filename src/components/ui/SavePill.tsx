import { ICON_LIME } from "@/src/constants/iconColors";
import { Check } from "lucide-react-native";
import { AppButton } from "./Button";

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
    // <AppButton
    //   variant="soft"
    //   size="sm"
    //   icon={<Check size={17} color={ICON_LIME_LIGHT} strokeWidth={3} />}
    //   onPress={onPress}
    //   loading={loading}
    //   disabled={!enabled}
    // >
    //   {label}
    // </AppButton>

    <AppButton
      variant="liquid"
      size="sm"
      icon={
        <Check
          size={17}
          color={enabled ? ICON_LIME : "rgb(144, 144, 144)"}
          strokeWidth={3}
        />
      }
      onPress={onPress}
      loading={loading}
      disabled={!enabled}
      textColor={!enabled ? "rgb(144, 144, 144)" : undefined}
    >
      {label}
    </AppButton>

    // <IconButton
    //   variant="liquidGlass"
    //   icon={<Check size={17} color={ICON_LIME} strokeWidth={3} />}
    //   onPress={onPress}
    //   accessibilityLabel="Save"
    // />
  );
}
