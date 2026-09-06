import { GradientIcon } from "@/src/components/ui/GradientIcon";
import { IconButton } from "@/src/components/ui/IconButton";
import { AppSheet, SheetRow, SheetRows } from "@/src/components/ui/Sheet";
import {
  ICON_BASE,
  ICON_LIME,
  ICON_LIME_LIGHT,
  ICON_MINT,
  ICON_MINT_LIGHT,
  ICON_MINT_TINT_DARK,
  ICON_ON_GLASS,
  ICON_PURE_BLACK,
  ICON_TEAL,
  ICON_WHITE,
} from "@/src/constants/iconColors";
import {
  BLACK_SCRIM_DEEP,
  BLACK_SCRIM_LIGHT,
  TRANSPARENT_BLACK,
} from "@/src/constants/rawColors";
import { FOCUS_HIGHLIGHT } from "@/src/constants/focus";
import { hapticTap } from "@/src/utils/haptics";
import { withAlpha } from "@/src/utils/withAlpha";
import {
  Canvas,
  Circle,
  Group,
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
import { GradientBorder } from "../ui/GradientBorder";

const COVER_BOX = 112;
const COVER_RADIUS = 30;
const LENS_SIZE = 30;
const EMPTY_LENS_SIZE = 58;

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
          start={vec(box, 0)}
          end={vec(0, box)}
          colors={[ICON_TEAL, ICON_MINT_TINT_DARK, ICON_BASE]}
          positions={[0, 0.4, 1]}
        />
      </Rect>

      <Group>
        {/* <Blur blur={1} /> */}
        <Circle cx={box * 0.95} cy={box * 0.02} r={box * 0.95}>
          <RadialGradient
            c={vec(box * 0.95, box * 0.02)}
            r={box * 0.78}
            colors={[
              withAlpha(ICON_LIME_LIGHT, 0.5),
              withAlpha(ICON_LIME, 0.14),
              withAlpha(ICON_LIME, 0),
            ]}
            positions={[0, 0.3, 1]}
          />
        </Circle>

        <Circle cx={box * 0.95} cy={box * 0.02} r={box * 0.3}>
          <RadialGradient
            c={vec(box * 0.95, box * 0.02)}
            r={box * 0.26}
            colors={[
              withAlpha(ICON_WHITE, 0.7),
              withAlpha(ICON_WHITE, 0.2),
              withAlpha(ICON_WHITE, 0),
            ]}
            positions={[0, 0.3, 1]}
          />
        </Circle>

        <Circle cx={box * 0.12} cy={box * 0.72} r={box * 0.7}>
          <RadialGradient
            c={vec(box * 0.12, box * 0.72)}
            r={box * 0.66}
            colors={[
              withAlpha(ICON_MINT_LIGHT, 0.3),
              withAlpha(ICON_MINT, 0.07),
              withAlpha(ICON_MINT, 0),
            ]}
            positions={[0, 0.35, 1]}
          />
        </Circle>

        <Circle cx={box * 0.05} cy={box * 1.05} r={box * 0.7}>
          <RadialGradient
            c={vec(box * 0.05, box * 1.05)}
            r={box * 0.68}
            colors={[BLACK_SCRIM_DEEP, BLACK_SCRIM_LIGHT, TRANSPARENT_BLACK]}
            positions={[0, 0.35, 1]}
          />
        </Circle>
      </Group>

      <Rect x={0} y={0} width={box} height={box * 0.35}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, box * 0.35)}
          colors={[withAlpha(ICON_WHITE, 0.18), withAlpha(ICON_WHITE, 0)]}
          positions={[0, 1]}
        />
      </Rect>
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
              shadowColor={ICON_PURE_BLACK}
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
                  backgroundColor: FOCUS_HIGHLIGHT,
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
              >
                <GradientBorder
                  radius={COVER_RADIUS}
                  angle={140}
                  width={1.3}
                  colors={[
                    withAlpha(ICON_WHITE, 0.7),
                    withAlpha(ICON_LIME, 0.67),
                    withAlpha(ICON_MINT, 0.38),
                    withAlpha(ICON_TEAL, 0.6),
                  ]}
                  positions={[0, 0.32, 0.68, 1]}
                />

                <IconButton
                  variant="liquidGlass"
                  size={EMPTY_LENS_SIZE}
                  icon={
                    <GradientIcon icon={Camera} size={27} strokeWidth={1.3} />
                  }
                  accessibilityLabel="Add cover"
                  onPress={onPress}
                />
              </YStack>
            )}
          </YStack>
          {!imageUri && (
            <Text fontSize={11.5} color="$colorMuted">
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
