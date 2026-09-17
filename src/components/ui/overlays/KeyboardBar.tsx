import {
  ICON_BASE_TOP,
  ICON_MINT_LIGHT,
  ICON_SLATE_DIM,
  ICON_WHITE,
} from "@/src/constants/iconColors";
import { withAlpha } from "@/src/utils/withAlpha";
import { Platform } from "react-native";
import {
  KeyboardToolbar,
  KeyboardToolbarProps,
} from "react-native-keyboard-controller";

export const KEYBOARD_BAR_HEIGHT = Platform.OS === "ios" ? 42 : 0;

const BAR_THEME = {
  primary: ICON_WHITE,
  disabled: ICON_SLATE_DIM,
  background: ICON_BASE_TOP,
  ripple: withAlpha(ICON_MINT_LIGHT, 0.2),
};

const THEME = { light: BAR_THEME, dark: BAR_THEME };

type KeyboardBarProps = Pick<KeyboardToolbarProps, "offset" | "enabled">;

export function KeyboardBar(props: KeyboardBarProps) {
  if (Platform.OS !== "ios") return null;
  return (
    <KeyboardToolbar theme={THEME} opacity="f2" {...props}>
      <KeyboardToolbar.Prev />
      <KeyboardToolbar.Next />
      <KeyboardToolbar.Content />
      <KeyboardToolbar.Done text="Done" />
    </KeyboardToolbar>
  );
}
