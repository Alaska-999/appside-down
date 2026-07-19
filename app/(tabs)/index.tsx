import { AvatarRing } from "@/src/components/ui/AvatarRing";
import { AppCard } from "@/src/components/ui/Card";
import { Chip } from "@/src/components/ui/Chip";
import { GradientText } from "@/src/components/ui/GradientText";
import { ProgressRing } from "@/src/components/ui/ProgressRing";
import { ScreenBackground } from "@/src/components/ui/ScreenBackground";
import { StreakCard } from "@/src/components/cards/StreakCard";
import { useAuthStore } from "@/src/store/useAuthStore";
import { LearningStatus } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { Search, X } from "@tamagui/lucide-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Input, ScrollView, Text, XStack, YStack } from "tamagui";

type PublicModuleResult = {
  id: string;
  name: string;
  user?: { id: string; username: string; avatarUrl?: string | null };
  _count?: { flashcards: number };
};

type HomeModule = {
  id: string;
  name: string;
  updatedAt: string;
  flashcards?: { status: LearningStatus }[];
  _count?: { flashcards: number };
};

// колірні пари для монограм Recent-чипів — просто ротація бренд-відтінків
// для візуального розмаїття, не окремі токени
const CHIP_GRADIENTS: [string, string][] = [
  ["#818cf8", "#38bdf8"],
  ["#4c46a8", "#2fa3b8"],
  ["#7b4ae0", "#38bdf8"],
];

function PublicModuleRow({ module }: { module: PublicModuleResult }) {
  const count = module._count?.flashcards ?? 0;
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/module/[id]", params: { id: module.id } })
      }
    >
      <AppCard variant="soft" px="$cardPad" py="$3.5" gap="$0.5">
        <Text fontSize="$4" fontWeight="700" color="$color">
          {module.name}
        </Text>
        <Text fontSize="$3" color="$colorMuted">
          {module.user?.username ?? "Unknown"} · {count} term
          {count !== 1 ? "s" : ""}
        </Text>
      </AppCard>
    </Pressable>
  );
}

function SectionTitle({
  children,
  tone = "muted",
}: {
  children: string;
  // "onGlass" — для лейблів усередині скляних плиток: $colorMuted там
  // недостатньо контрастний (темно-сірий на напівпрозорому склі)
  tone?: "muted" | "onGlass";
}) {
  return (
    <Text
      fontSize="$3"
      fontWeight="700"
      color={tone === "onGlass" ? "$colorSecondary" : "$colorMuted"}
      textTransform="uppercase"
      letterSpacing={1}
    >
      {children}
    </Text>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState("");
  const [results, setResults] = useState<PublicModuleResult[]>([]);
  const [modules, setModules] = useState<HomeModule[]>([]);
  const [publicModules, setPublicModules] = useState<PublicModuleResult[]>([]);
  const { user } = useAuthStore();

  const searching = search.trim().length >= 2;
  const todayIndex = (new Date().getDay() + 6) % 7;

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, []),
  );

  const fetchData = async () => {
    try {
      const [modulesRes, publicRes] = await Promise.all([
        protectedFetch(`${process.env.EXPO_PUBLIC_API_URL}/modules`, {
          method: "GET",
        }),
        protectedFetch(`${process.env.EXPO_PUBLIC_API_URL}/modules/public`, {
          method: "GET",
        }),
      ]);
      if (!modulesRes.ok)
        throw new Error(`Modules error: ${modulesRes.status}`);
      if (!publicRes.ok) throw new Error(`Public error: ${publicRes.status}`);

      const [modulesData, publicData] = await Promise.all([
        modulesRes.json() as Promise<HomeModule[]>,
        publicRes.json() as Promise<PublicModuleResult[]>,
      ]);
      setModules(modulesData);
      setPublicModules(publicData);
    } catch (err) {
      console.error("[Home] fetch error:", err);
    }
  };

  useEffect(() => {
    const query = search.trim();
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await protectedFetch(
          `${process.env.EXPO_PUBLIC_API_URL}/modules/public?search=${encodeURIComponent(query)}`,
        );
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        setResults(await res.json());
      } catch (err) {
        console.error("[Home] search error:", err);
        setResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const continueLearning = useMemo(() => {
    return modules
      .filter((m) => {
        const statuses = m.flashcards?.map((f) => f.status) ?? [];
        if (statuses.length === 0) return false;
        const started = statuses.some((s) => s !== "UNSTUDIED");
        const unfinished = statuses.some((s) => s !== "KNOWN");
        return started && unfinished;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 5);
  }, [modules]);

  const featuredModule = continueLearning[0];
  const featuredStats = useMemo(() => {
    if (!featuredModule) return null;
    const statuses = featuredModule.flashcards?.map((f) => f.status) ?? [];
    const total = statuses.length;
    const known = statuses.filter((s) => s === "KNOWN").length;
    return { total, known, progress: total ? known / total : 0 };
  }, [featuredModule]);

  const cardsLearned = useMemo(() => {
    return modules.reduce((sum, m) => {
      const known = m.flashcards?.filter((f) => f.status === "KNOWN").length ?? 0;
      return sum + known;
    }, 0);
  }, [modules]);

  const recent = useMemo(() => {
    return [...modules]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 6);
  }, [modules]);

  const discover = useMemo(() => {
    return publicModules.filter((m) => m.user?.id !== user?.id).slice(0, 10);
  }, [publicModules, user?.id]);

  const navigateToProfile = () => {
    router.push({
      pathname: "/profile",
      params: {
        userId: user?.id,
      },
    });
  };

  const openModule = (id: string) => {
    router.push({ pathname: "/module/[id]", params: { id } });
  };

  return (
    <ScreenBackground>
      <YStack f={1} px="$screenX" gap="$4" pt={insets.top}>
        <XStack jc="space-between" gap="$3" ai="flex-start">
          {/* MaskedView на весь рядок (з f={1}) іноді лягав у нульовий розмір
             і зникав повністю — маскуємо градієнтом лише ім'я, це надійніше */}
          <YStack f={1}>
            <Text fontSize="$10" fontWeight="800" color="$color" lineHeight={36}>
              Hi,
            </Text>
            <XStack ai="center" flexWrap="wrap">
              <GradientText fontSize="$10" fontWeight="800" lineHeight={36}>
                {user?.username ?? "there"}
              </GradientText>
              <Text fontSize="$10" fontWeight="800" lineHeight={36}>
                {" "}👋
              </Text>
            </XStack>
          </YStack>
          <AvatarRing
            size={52}
            avatarUrl={user?.avatarUrl}
            username={user?.username}
            onPress={navigateToProfile}
          />
        </XStack>

        <XStack
          bg="$glassBg"
          br={999}
          px="$4"
          ai="center"
          gap="$2"
          borderWidth={1}
          borderColor="$glassBorder"
          h={46}
        >
          <Search size={16} color="$colorMuted" opacity={0.6} />
          <Input
            f={1}
            unstyled
            placeholder="Search public modules..."
            value={search}
            onChangeText={setSearch}
            fontSize="$4"
            color="$color"
            placeholderTextColor="$colorMuted"
          />
          {search.length > 0 && (
            <Pressable hitSlop={8} onPress={() => setSearch("")}>
              <X size={16} color="$colorMuted" />
            </Pressable>
          )}
        </XStack>

        {searching ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <YStack gap="$2" pb="$4">
              {results.map((m) => (
                <PublicModuleRow key={m.id} module={m} />
              ))}
              {results.length === 0 && (
                <Text color="$colorMuted">No public modules found</Text>
              )}
            </YStack>
          </ScrollView>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <YStack gap="$section" pb={110}>
              {/* bento-група: hero + дві плитки, внутрішній крок 10 як у мокапі */}
              <YStack gap="$2.5">
                <StreakCard
                  currentStreak={user?.streak?.currentStreak ?? 0}
                  todayIndex={todayIndex}
                />

                <XStack gap="$2.5">
                  {featuredModule && featuredStats ? (
                    <Pressable
                      style={{ flex: 1 }}
                      onPress={() => openModule(featuredModule.id)}
                    >
                      <AppCard variant="glass" f={1} gap="$2" ai="flex-start">
                        <ProgressRing
                          progress={featuredStats.progress}
                          label={`${Math.round(featuredStats.progress * 100)}%`}
                        />
                        <Text
                          fontSize="$4"
                          fontWeight="700"
                          color="$color"
                          numberOfLines={1}
                        >
                          Continue: {featuredModule.name}
                        </Text>
                        <Text fontSize="$2" color="$colorSecondary">
                          {featuredStats.known}/{featuredStats.total} terms
                        </Text>
                      </AppCard>
                    </Pressable>
                  ) : null}

                  <AppCard variant="glass" f={1} gap="$1" ai="flex-start">
                    <Text fontSize="$9" fontWeight="900" color="$color">
                      {modules.length}
                    </Text>
                    <SectionTitle tone="onGlass">Total modules</SectionTitle>
                    <Text
                      fontSize="$9"
                      fontWeight="900"
                      color="$accentGradientEnd"
                      mt="$2.5"
                    >
                      {cardsLearned}
                    </Text>
                    <SectionTitle tone="onGlass">Cards learned</SectionTitle>
                  </AppCard>
                </XStack>
              </YStack>

              {/* Recent */}
              {recent.length > 0 && (
                <YStack gap="$3">
                  <SectionTitle>Recent</SectionTitle>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <XStack gap="$2.5">
                      {recent.map((m, i) => {
                        const count = m._count?.flashcards ?? 0;
                        return (
                          <Chip
                            key={m.id}
                            size="lg"
                            monogram={m.name.slice(0, 1).toUpperCase()}
                            title={m.name}
                            meta={`${count} card${count !== 1 ? "s" : ""}`}
                            gradientColors={CHIP_GRADIENTS[i % CHIP_GRADIENTS.length]}
                            onPress={() => openModule(m.id)}
                          />
                        );
                      })}
                    </XStack>
                  </ScrollView>
                </YStack>
              )}

              {/* Discover */}
              {discover.length > 0 && (
                <YStack gap="$3">
                  <SectionTitle>Discover</SectionTitle>
                  <YStack gap="$2">
                    {discover.map((m) => (
                      <PublicModuleRow key={m.id} module={m} />
                    ))}
                  </YStack>
                </YStack>
              )}
            </YStack>
          </ScrollView>
        )}
      </YStack>
    </ScreenBackground>
  );
}
