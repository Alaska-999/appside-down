import { IconButton } from "@/src/components/ui/IconButton";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { ICON_ON_GLASS } from "@/src/constants/iconColors";
import { screenGutter } from "@/tamagui.config";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { ReactNode } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { YStack } from "tamagui";

interface AuthScreenShellProps {
  children: ReactNode;
  backButton?: boolean;
}

export function AuthScreenShell({
  children,
  backButton = true,
}: AuthScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <YStack f={1} bg="$background">
      <BackgroundMesh preset="auth" animated />
      {backButton && (
        <YStack pos="absolute" top={insets.top + 8} left={screenGutter} zIndex={10}>
          <IconButton
            variant="liquidGlass"
            icon={<ChevronLeft size={22} color={ICON_ON_GLASS} strokeWidth={1.9} />}
            onPress={() => router.back()}
          />
        </YStack>
      )}
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={40}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: insets.top + 62,
          paddingBottom: insets.bottom + 22,
        }}
      >
        {children}
      </KeyboardAwareScrollView>

      <StatusBarScrim />
    </YStack>
  );
}
