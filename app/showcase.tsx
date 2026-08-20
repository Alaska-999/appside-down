import { GradientBorder } from "@/src/components/ui/GradientBorder";
import {
  BackgroundMesh,
  BackgroundPreset,
  BgDebugMode,
} from "@/src/components/ui/ScreenBackground";
import { TYPE } from "@/src/constants/type";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, Text, XStack, YStack } from "tamagui";

const BG_PRESETS: { preset: BackgroundPreset; debug?: BgDebugMode }[] = [
  { preset: "home" },
  { preset: "module" },
  { preset: "form" },
  { preset: "folder" },
  { preset: "flash" },
  { preset: "auth" },
  { preset: "finish" },
];

function Label(props: { children: string }) {
  return (
    <Text {...TYPE.micro} color="$colorMuted" textTransform="uppercase" letterSpacing={1}>
      {props.children}
    </Text>
  );
}

export default function Showcase() {
  const insets = useSafeAreaInsets();
  const [bgIndex, setBgIndex] = useState<number | null>(null);

  if (bgIndex !== null) {
    const entry = BG_PRESETS[bgIndex];
    return (
      <Pressable
        style={{ flex: 1 }}
        onPress={() =>
          setBgIndex(bgIndex + 1 < BG_PRESETS.length ? bgIndex + 1 : null)
        }
      >
        <YStack f={1} bg="$background">
          <BackgroundMesh
            preset={entry.preset}
            animated={entry.preset === "auth" || entry.preset === "flash"}
            debugMode={entry.debug}
          />
          <Text
            {...TYPE.micro}
            color="$colorMuted"
            textTransform="uppercase"
            letterSpacing={1}
            pos="absolute"
            b={insets.bottom + 20}
            als="center"
          >
            {entry.preset}
            {entry.debug ? ` · ${entry.debug}` : ""} · тап далі
          </Text>
        </YStack>
      </Pressable>
    );
  }

  return (
    <YStack f={1} bg="$background">
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 16,
          gap: 22,
        }}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text {...TYPE.title} color="$color">
            Showcase
          </Text>
        </Pressable>

        <YStack gap={10}>
          <Label>Фонові меші · тап відкриває на повний екран</Label>
          <Pressable onPress={() => setBgIndex(0)}>
            <YStack h={52} br={16} bg="$surfaceCard" jc="center" ai="center">
              <GradientBorder radius={16} preset="surf" />
              <Text {...TYPE.card} color="$color">
                7 пресетів фону
              </Text>
            </YStack>
          </Pressable>
        </YStack>

        <YStack gap={10}>
          <Label>surf · 140deg · r23</Label>
          <YStack h={96} br={23} bg="$surfaceCard" p="$cardPad" jc="center">
            <GradientBorder radius={23} preset="surf" />
            <Text {...TYPE.card} color="$color">
              Base card border
            </Text>
          </YStack>
        </YStack>

        <YStack gap={10}>
          <Label>glow mint / teal / lime / indigo · 138deg</Label>
          <XStack gap={10}>
            <YStack f={1} h={84} br={23} bg="$surfaceCard" jc="center" ai="center">
              <GradientBorder radius={23} preset="glowMint" />
              <Text {...TYPE.micro} color="$color">mint</Text>
            </YStack>
            <YStack f={1} h={84} br={23} bg="$surfaceCard" jc="center" ai="center">
              <GradientBorder radius={23} preset="glowTeal" />
              <Text {...TYPE.micro} color="$color">teal</Text>
            </YStack>
          </XStack>
          <XStack gap={10}>
            <YStack f={1} h={84} br={23} bg="$surfaceCard" jc="center" ai="center">
              <GradientBorder radius={23} preset="glowLime" />
              <Text {...TYPE.micro} color="$color">lime</Text>
            </YStack>
            <YStack f={1} h={84} br={23} bg="$surfaceCard" jc="center" ai="center">
              <GradientBorder radius={23} preset="glowIndigo" />
              <Text {...TYPE.micro} color="$color">indigo</Text>
            </YStack>
          </XStack>
        </YStack>

        <YStack gap={10}>
          <Label>liquid · 155deg · r20</Label>
          <YStack h={84} br={20} bg="$surfaceGlass" jc="center" ai="center">
            <GradientBorder radius={20} preset="liquid" />
            <Text {...TYPE.card} color="$color">
              Liquid border
            </Text>
          </YStack>
        </YStack>

        <YStack gap={10}>
          <Label>lens · 160deg · 44 circle</Label>
          <XStack gap={16} ai="center">
            <YStack w={44} h={44} br={22} bg="$surfaceGlassFaint" jc="center" ai="center">
              <GradientBorder radius={22} preset="lens" />
              <Text {...TYPE.micro} color="$color">✕</Text>
            </YStack>
            <Text {...TYPE.meta} color="$colorMuted">
              44×44, кант 1px по колу
            </Text>
          </XStack>
        </YStack>

        <YStack gap={10}>
          <Label>well · 180deg · r16</Label>
          <YStack h={52} br={16} bg="$surfaceWell" jc="center" px={16}>
            <GradientBorder radius={16} preset="well" />
            <Text {...TYPE.body} color="$placeholderColor">
              Input placeholder
            </Text>
          </YStack>
        </YStack>

        <YStack gap={10}>
          <Label>sweep (conic) · r23</Label>
          <YStack h={84} br={23} bg="$surfaceCard" jc="center" ai="center">
            <GradientBorder radius={23} preset="glowMint" sweep />
            <Text {...TYPE.micro} color="$color">SweepGradient</Text>
          </YStack>
        </YStack>

        <YStack gap={10}>
          <Label>width 2.2 · r23</Label>
          <YStack h={84} br={23} bg="$surfaceCard" jc="center" ai="center">
            <GradientBorder radius={23} preset="glowLime" width={2.2} />
            <Text {...TYPE.micro} color="$color">товстий кант</Text>
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
