import { IconButton } from "@/src/components/ui/IconButton";
import { AppSheet, SheetRow, SheetRows } from "@/src/components/ui/Sheet";
import { ICON_MINT_LIGHT, ICON_ON_GLASS } from "@/src/constants/iconColors";
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

const COVER_BOX = 96;
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
          end={vec(box * 0.64, box)}
          colors={["#1f4a48", "#0f2629"]}
        />
      </Rect>
      <Circle cx={box * 0.3} cy={box * 0.2} r={box * 0.7}>
        <RadialGradient
          c={vec(box * 0.3, box * 0.2)}
          r={box * 0.7}
          colors={["rgba(94,234,212,0.55)", "rgba(94,234,212,0)"]}
          positions={[0, 0.9]}
        />
      </Circle>
      <Circle cx={box * 0.76} cy={box * 0.74} r={box * 0.6}>
        <RadialGradient
          c={vec(box * 0.76, box * 0.74)}
          r={box * 0.6}
          colors={["rgba(163,230,53,0.38)", "rgba(163,230,53,0)"]}
          positions={[0, 0.9]}
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
                  variant="liquidGlass"
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
                borderWidth={1.5}
                borderStyle="dashed"
                borderColor="rgba(94,234,212,0.7)"
              >
                <IconButton
                  variant="liquidGlass"
                  size={EMPTY_LENS_SIZE}
                  icon={
                    <Camera size={20} color={ICON_MINT_LIGHT} strokeWidth={2} />
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
