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
import { Alert, Image, Pressable } from "react-native";
import { Text, YStack } from "tamagui";

type FolderCoverSize = "lg" | "md";

const SIZE_STYLES: Record<FolderCoverSize, { box: number; radius: number }> = {
  lg: { box: 96, radius: 28 },
  md: { box: 88, radius: 26 },
};

export async function pickCoverImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert(
      "Photos access needed",
      "Allow access to your photo library in Settings to pick a cover.",
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
          colors={["#1c3a3a", "#0f2226"]}
        />
      </Rect>
      <Circle cx={box * 0.3} cy={box * 0.2} r={box * 0.7}>
        <RadialGradient
          c={vec(box * 0.3, box * 0.2)}
          r={box * 0.7}
          colors={["rgba(94,234,212,0.5)", "rgba(94,234,212,0)"]}
          positions={[0, 0.7]}
        />
      </Circle>
      <Circle cx={box * 0.76} cy={box * 0.74} r={box * 0.6}>
        <RadialGradient
          c={vec(box * 0.76, box * 0.74)}
          r={box * 0.6}
          colors={["rgba(163,230,53,0.35)", "rgba(163,230,53,0)"]}
          positions={[0, 0.72]}
        />
      </Circle>
    </Canvas>
  );
}

export function FolderCover({
  imageUri,
  onChange,
  size = "lg",
}: {
  imageUri: string | null;
  onChange: (uri: string | null) => void;
  size?: FolderCoverSize;
}) {
  const { box, radius } = SIZE_STYLES[size];

  const change = async () => {
    hapticTap();
    const uri = await pickCoverImage();
    if (uri) onChange(uri);
  };

  return (
    <YStack ai="center" gap={14}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change cover"
        onPress={change}
        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.97 : 1 }] })}
      >
        <YStack
          w={box}
          h={box}
          br={radius}
          overflow="hidden"
          shadowColor="rgba(45,212,191,1)"
          shadowOpacity={0.22}
          shadowRadius={16}
          shadowOffset={{ width: 0, height: 0 }}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              accessibilityIgnoresInvertColors
              style={{ width: box, height: box, borderRadius: radius }}
              resizeMode="cover"
            />
          ) : (
            <DefaultCover box={box} radius={radius} />
          )}
        </YStack>
      </Pressable>
      <YStack ai="center" gap={6}>
        <Pressable onPress={change} hitSlop={8}>
          <Text fontSize={12.5} fontWeight="600" color="#5EEAD4">
            Change cover
          </Text>
        </Pressable>
        {imageUri && (
          <Pressable
            onPress={() => {
              hapticTap();
              onChange(null);
            }}
            hitSlop={8}
          >
            <Text fontSize={12.5} fontWeight="600" color="#5A6B7A">
              Remove
            </Text>
          </Pressable>
        )}
      </YStack>
    </YStack>
  );
}
