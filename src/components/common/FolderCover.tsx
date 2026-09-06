import { IconButton } from "@/src/components/ui/IconButton";
import { AppSheet, SheetRow, SheetRows } from "@/src/components/ui/Sheet";
import { ICON_MINT, ICON_ON_GLASS } from "@/src/constants/iconColors";
import { hapticTap } from "@/src/utils/haptics";
import {
  Canvas,
  Circle,
  LinearGradient,
  RadialGradient,
  Rect,
  vec,
} from "@shopify/react-native-skia";
import * as ImagePicker from "expo-image-picker";
import { Camera, ImagePlus, Pencil, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Alert, Image, Linking, Pressable, View } from "react-native";
import { Text, YStack } from "tamagui";

const COVER_BOX = 100;
const COVER_RADIUS = 28;
const LENS_SIZE = 30;
const EMPTY_LENS_SIZE = 44;

export async function pickCoverImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Photos access needed",
      "Allow access to your photo library in Settings to pick a cover.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ],
    );
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

function DefaultCover({ box, radius }: { box: number; radius: number }) {
  return (
    <Canvas style={{ width: box, height: box, borderRadius: radius }}>
      <Rect x={0} y={0} width={box} height={box}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(box * 0.5, box)}
          colors={["#142827", "#0b1618", "#070c0f"]}
          positions={[0, 0.5, 1]}
        />
      </Rect>

      <Circle cx={box * 0.2} cy={box * 0.2} r={box * 0.7}>
        <RadialGradient
          c={vec(box * 0.2, box * 0.2)}
          r={box * 0.5}
          colors={["rgba(94,234,212,0.2)", "rgba(94,234,212,0.0)"]}
          positions={[0, 1]}
        />
      </Circle>

      <Circle cx={box * 0.2} cy={box * 0.2} r={box * 0.3}>
        <RadialGradient
          c={vec(box * 0.2, box * 0.2)}
          r={box * 0.25}
          colors={[
            "rgba(214, 245, 240, 0.21)",
            "rgba(94,234,212,0.15)",
            "rgba(94,234,212,0.0)",
          ]}
          positions={[0, 0.25, 1]}
        />
      </Circle>

      <Circle cx={box * 0.8} cy={box * 0.8} r={box * 0.5}>
        <RadialGradient
          c={vec(box * 0.8, box * 0.8)}
          r={box * 0.45}
          colors={["rgba(163,230,53,0.25)", "rgba(163,230,53,0.0)"]}
          positions={[0, 1]}
        />
      </Circle>

      <Circle cx={box * 0.75} cy={box * 0.75} r={box * 0.3}>
        <RadialGradient
          c={vec(box * 0.75, box * 0.75)}
          r={box * 0.25}
          colors={[
            "rgba(246, 250, 220, 0.16)",
            "rgba(180, 255, 94, 0.1)",
            "rgba(180, 255, 94, 0.0)",
          ]}
          positions={[0, 0.25, 1]}
        />
      </Circle>

      <Circle cx={box * 0.2} cy={box * 0.9} r={box * 0.55}>
        <RadialGradient
          c={vec(box * 0.2, box * 0.9)}
          r={box * 0.5}
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.0)"]}
          positions={[0, 1]}
        />
      </Circle>
    </Canvas>
  );
}

export function FolderCover({
  imageUri,
  onChange,
}: {
  imageUri: string | null;
  onChange: (uri: string | null) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const pick = async () => {
    const uri = await pickCoverImage();
    if (uri) onChange(uri);
  };

  const onPress = () => {
    hapticTap();
    if (imageUri) setMenuOpen(true);
    else void pick();
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={imageUri ? "Change cover" : "Add cover"}
        onPress={onPress}
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.97 : 1 }],
        })}
      >
        <YStack ai="center" gap={10}>
          <YStack w={COVER_BOX} h={COVER_BOX} pos="relative">
            <YStack
              w={COVER_BOX}
              h={COVER_BOX}
              br={COVER_RADIUS}
              overflow="hidden"
              shadowColor="#000"
              shadowOpacity={0.9}
              shadowRadius={15}
              shadowOffset={{ width: 0, height: 12 }}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  accessibilityIgnoresInvertColors
                  style={{
                    width: COVER_BOX,
                    height: COVER_BOX,
                    borderRadius: COVER_RADIUS,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <DefaultCover box={COVER_BOX} radius={COVER_RADIUS} />
              )}
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 8,
                  right: 8,
                  height: 1,
                  backgroundColor: "rgba(255,255,255,0.25)",
                }}
              />
            </YStack>
            {imageUri ? (
              <YStack pos="absolute" r={-6} b={-6}>
                <IconButton
                  variant="glass"
                  size={LENS_SIZE}
                  icon={
                    <Pencil size={14} color={ICON_ON_GLASS} strokeWidth={2} />
                  }
                  accessibilityLabel="Change cover"
                  onPress={onPress}
                />
              </YStack>
            ) : (
              <YStack
                pos="absolute"
                t={0}
                l={0}
                r={0}
                b={0}
                br={COVER_RADIUS}
                ai="center"
                jc="center"
                borderWidth={1.3}
                borderColor="rgba(94,234,212,0.45)"
              >
                <IconButton
                  variant="liquidGlass"
                  size={52}
                  icon={
                    <Camera size={24} color={ICON_MINT} strokeWidth={1.5} />
                  }
                  accessibilityLabel="Add cover"
                  onPress={onPress}
                />
              </YStack>
            )}
          </YStack>
          {!imageUri && (
            <Text fontSize={11.5} color="$mutedDim">
              Tap to add cover
            </Text>
          )}
        </YStack>
      </Pressable>

      <AppSheet open={menuOpen} onOpenChange={setMenuOpen} title="Cover">
        <SheetRows>
          <SheetRow
            icon={ImagePlus}
            label="Choose another photo"
            onPress={() => {
              setMenuOpen(false);
              void pick();
            }}
          />
          <SheetRow
            icon={Trash2}
            label="Remove cover"
            danger
            onPress={() => {
              setMenuOpen(false);
              onChange(null);
            }}
          />
        </SheetRows>
      </AppSheet>
    </>
  );
}
