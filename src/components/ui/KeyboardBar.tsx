import { Platform } from "react-native";
import {
  KeyboardToolbar,
  KeyboardToolbarProps,
} from "react-native-keyboard-controller";

export const KEYBOARD_BAR_HEIGHT = Platform.OS === "ios" ? 42 : 0;

const BAR_THEME = {
  primary: "#fff",
  disabled: "#3E4C57",
  background: "#0E1A1E",
  ripple: "rgba(94,234,212,0.2)",
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
