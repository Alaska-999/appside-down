import {
  ICON_BASE,
  ICON_LIME,
  ICON_LIME_LIGHT,
} from "@/src/constants/iconColors";
import { ICON_DISABLED_GRAY } from "@/src/constants/rawColors";
import { Check } from "lucide-react-native";
import { AppButton } from "./Button";

export function SavePill({
  label = "Save",
  enabled = true,
  loading,
  onPress,
  variant = "liquid",
}: {
  label?: string;
  enabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  variant?: "liquid" | "primary" | "soft";
}) {
  if (variant === "primary") {
    return (
      <AppButton
        variant="primary"
        size="sm"
        icon={<Check size={17} color={ICON_BASE} strokeWidth={3} />}
        onPress={onPress}
        loading={loading}
        disabled={!enabled}
      >
        {label}
      </AppButton>
    );
  }

  if (variant === "soft") {
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
    );
  }

  return (
    <AppButton
      variant="liquid"
      size="sm"
      icon={
        <Check
          size={17}
          color={enabled ? ICON_LIME : ICON_DISABLED_GRAY}
          strokeWidth={3}
        />
      }
      onPress={onPress}
      loading={loading}
      disabled={!enabled}
      textColor={!enabled ? ICON_DISABLED_GRAY : undefined}
    >
      {label}
    </AppButton>
  );
}
