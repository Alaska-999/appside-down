import { AppCard } from "@/src/components/ui/Card";
import { GradientBorder } from "@/src/components/ui/GradientBorder";
import { IconButton } from "@/src/components/ui/IconButton";
import { Skeleton } from "@/src/components/ui/Skeleton";
import {
  BackgroundMesh,
  BackgroundPreset,
  BgDebugMode,
} from "@/src/components/ui/ScreenBackground";
import { TYPE } from "@/src/constants/type";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Search, Settings2, X } from "lucide-react-native";
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
      <BackgroundMesh preset="home" />
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
          <Label>Картки · glow-тони (лампа зліва-згори)</Label>
          <XStack gap={10}>
            <AppCard f={1} size="lg" variant="glow" tone="mint" gap={6}>
              <Text {...TYPE.card} color="$color">mint</Text>
              <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Модуль у роботі</Text>
            </AppCard>
            <AppCard f={1} size="lg" variant="glow" tone="teal" gap={6}>
              <Text {...TYPE.card} color="$color">teal</Text>
              <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Статистика</Text>
            </AppCard>
          </XStack>
          <XStack gap={10}>
            <AppCard f={1} size="lg" variant="glow" tone="lime" gap={6}>
              <Text {...TYPE.card} color="$color">lime</Text>
              <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Завершено</Text>
            </AppCard>
            <AppCard f={1} size="lg" variant="glow" tone="indigo" gap={6}>
              <Text {...TYPE.card} color="$color">indigo</Text>
              <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Щойно створено</Text>
            </AppCard>
          </XStack>
        </YStack>

        <YStack gap={10}>
          <Label>glow 0…4</Label>
          <XStack gap={8}>
            {([0, 1, 2, 3, 4] as const).map((g) => (
              <AppCard key={g} f={1} variant="glow" glow={g} px={0} py={14} ai="center">
                <Text {...TYPE.micro} color="$color">{g}</Text>
              </AppCard>
            ))}
          </XStack>
          <Label>vivid 0…4</Label>
          <XStack gap={8}>
            {([0, 1, 2, 3, 4] as const).map((v) => (
              <AppCard key={v} f={1} variant="glow" glow={3} vivid={v} px={0} py={14} ai="center">
                <Text {...TYPE.micro} color="$color">{v}</Text>
              </AppCard>
            ))}
          </XStack>
        </YStack>

        <YStack gap={10}>
          <Label>glass · liquid · accent</Label>
          <XStack gap={10}>
            <AppCard f={1} size="lg" variant="glass" gap={6}>
              <Text {...TYPE.card} color="$color">glass</Text>
            </AppCard>
            <AppCard f={1} size="lg" variant="liquid" gap={6}>
              <Text {...TYPE.card} color="#FFFFFF">liquid</Text>
            </AppCard>
          </XStack>
          <Label>Тест заломлення · скроль фото під склом</Label>
          <YStack h={300} br={23} overflow="hidden" pos="relative">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Image
                source={{ uri: "https://picsum.photos/id/1015/1600/600" }}
                style={{ width: 1200, height: 300 }}
              />
            </ScrollView>
            <YStack
              pos="absolute"
              t={0}
              l={0}
              r={0}
              b={0}
              ai="center"
              jc="center"
              pointerEvents="none"
            >
              <AppCard w={230} size="lg" variant="liquid" ai="center" gap={4}>
                <Text {...TYPE.card} color="#FFFFFF">liquid</Text>
                <Text {...TYPE.meta} color="rgba(255,255,255,0.8)">скроль фото під карткою</Text>
              </AppCard>
            </YStack>
          </YStack>
          <AppCard size="lg" variant="accent" gap={6}>
            <Text {...TYPE.card} color="$nearBlack">accent</Text>
            <Text {...TYPE.meta} color="rgba(13,17,23,0.68)">Градієнтна картка-приманка</Text>
          </AppCard>
        </YStack>

        <YStack gap={10}>
          <Label>neon · well</Label>
          <XStack gap={10}>
            <AppCard f={1} size="lg" variant="neon" gap={6}>
              <Text {...TYPE.card} color="$color">neon</Text>
            </AppCard>
            <AppCard f={1} size="lg" variant="well" gap={6}>
              <Text {...TYPE.card} color="$color">well</Text>
              <Text {...TYPE.meta} color="$placeholderColor">Поглинає світло</Text>
            </AppCard>
          </XStack>
        </YStack>

        <YStack gap={10}>
          <Label>progressLit 62% · sweep</Label>
          <AppCard size="lg" variant="progressLit" lit={0.62} gap={6} minHeight={120} jc="flex-end">
            <Text {...TYPE.card} color="$color">progress-lit</Text>
            <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Світло знизу = прогрес</Text>
          </AppCard>
          <AppCard size="lg" variant="sweep" animateSweep gap={6}>
            <Text {...TYPE.card} color="$color">sweep</Text>
            <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Єдиний рух цього екрана</Text>
          </AppCard>
        </YStack>

        <YStack gap={10}>
          <Label>media · stack · selected · locked</Label>
          <AppCard
            size="lg"
            variant="media"
            minHeight={176}
            cover={
              <LinearGradient
                colors={["#1BA88F", "#0D9488", "#08090C"]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 0.8, y: 1 }}
                style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
              />
            }
          >
            <Text {...TYPE.card} color="$color">media</Text>
            <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Cover + скрим</Text>
          </AppCard>
          <AppCard size="lg" variant="glow" stack gap={6}>
            <Text {...TYPE.card} color="$color">stack</Text>
            <Text {...TYPE.meta} color="rgba(220,255,245,0.64)">Дві плашки ззаду</Text>
          </AppCard>
          <XStack gap={10}>
            <AppCard f={1} size="lg" variant="glow" selected gap={6}>
              <Text {...TYPE.card} color="$color">selected</Text>
            </AppCard>
            <AppCard f={1} size="lg" variant="glow" locked gap={6}>
              <Text {...TYPE.card} color="$color">locked</Text>
            </AppCard>
          </XStack>
        </YStack>

        <YStack gap={10}>
          <Label>skeleton</Label>
          <AppCard size="lg" variant="surface" gap={10}>
            <Skeleton width={140} height={16} />
            <Skeleton width={220} height={12} />
            <Skeleton width={90} height={12} />
          </AppCard>
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
          <Label>liquid лінза 44 · тільки над градієнтом</Label>
          <YStack h={140} br={23} overflow="hidden">
            <BackgroundMesh preset="module" />
            <XStack f={1} ai="center" jc="center" gap={16}>
              <IconButton
                variant="liquidGlass"
                icon={<Search size={22} color="#EAF7FF" strokeWidth={1.9} />}
              />
              <IconButton
                variant="liquidGlass"
                icon={<Settings2 size={22} color="#EAF7FF" strokeWidth={1.9} />}
              />
              <IconButton
                variant="liquidGlass"
                icon={<X size={22} color="#EAF7FF" strokeWidth={1.9} />}
              />
            </XStack>
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
