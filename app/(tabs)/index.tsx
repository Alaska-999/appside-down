import { StreakCard } from "@/src/components/cards/StreakCard";
import { AvatarRing } from "@/src/components/ui/AvatarRing";
import { AppCard } from "@/src/components/ui/Card";
import { Chip } from "@/src/components/ui/Chip";
import { GradientText } from "@/src/components/ui/GradientText";
import { ProgressRing } from "@/src/components/ui/ProgressRing";
import { ScreenBackground } from "@/src/components/ui/ScreenBackground";
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

const CHIP_GRADIENTS: [string, string][] = [
  ["#2dd4bf", "#a3e635"],
  ["#4338ca", "#65a30d"],
];

function PublicModuleRow({ module }: { module: PublicModuleResult }) {
  const count = module._count?.flashcards ?? 0;
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/module/[id]", params: { id: module.id } })
      }
    >
      <AppCard variant="soft" px="$cardPad" py={16} gap="$0.5">
        <Text fontSize={17} fontWeight="700" color="$color">
          {module.name}
        </Text>
        <Text fontSize={14} color="$colorMuted">
          {module.user?.username ?? "Unknown"} · {count} term
          {count !== 1 ? "s" : ""}
        </Text>
      </AppCard>
    </Pressable>
  );
}

export function SectionTitle({
  children,
  tone = "muted",
}: {
  children: string;
  tone?: "muted" | "onGlass";
}) {
  return (
    <Text
      fontSize={tone === "onGlass" ? 13 : 15}
      fontWeight={tone === "onGlass" ? "600" : "700"}
      color={tone === "onGlass" ? "$colorSecondary" : "$colorMuted"}
      textTransform="uppercase"
      letterSpacing={tone === "onGlass" ? 0.77 : 1.04}
      mt={tone === "onGlass" ? 3 : 0}
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
      const known =
        m.flashcards?.filter((f) => f.status === "KNOWN").length ?? 0;
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
      <YStack f={1} gap="$section" pt={insets.top}>
        <YStack px="$screenX" gap="$section">
          <XStack jc="space-between" gap="$3" ai="flex-start">
            <YStack f={1}>
              <Text
                fontSize={35}
                fontWeight="800"
                color="$color"
                lineHeight={39}
              >
                Hi,
              </Text>
              <XStack ai="center" flexWrap="wrap">
                <GradientText fontSize={35} fontWeight="800" lineHeight={39}>
                  {user?.username ?? "there"}
                </GradientText>
                <Text fontSize={35} fontWeight="800" lineHeight={39}>
                  {" "}
                  👋
                </Text>
              </XStack>
            </YStack>
            <AvatarRing
              avatarUrl={user?.avatarUrl}
              username={user?.username}
              onPress={navigateToProfile}
            />
          </XStack>

          <XStack
            bg="$glassBg"
            br={999}
            px={19}
            py={14}
            ai="center"
            gap={9}
            borderWidth={1}
            borderColor="$glassBorder"
          >
            <Search size={20} color="$colorMuted" opacity={0.6} />
            <Input
              f={1}
              unstyled
              placeholder="Search public modules..."
              value={search}
              onChangeText={setSearch}
              fontSize={16}
              color="$color"
              placeholderTextColor="$colorMuted"
            />
            {search.length > 0 && (
              <Pressable hitSlop={13} onPress={() => setSearch("")}>
                <X size={20} color="$colorMuted" />
              </Pressable>
            )}
          </XStack>
        </YStack>

        {searching ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <YStack px="$screenX" gap="$2" pb="$4">
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
            <YStack px="$screenX" gap="$section" pb={130}>
              <YStack gap={12}>
                <StreakCard
                  currentStreak={user?.streak?.currentStreak ?? 0}
                  todayIndex={todayIndex}
                />

                <XStack gap={12}>
                  {featuredModule && featuredStats ? (
                    <Pressable
                      style={{ flex: 1 }}
                      onPress={() => openModule(featuredModule.id)}
                    >
                      <AppCard variant="glass" f={1} gap={9} ai="flex-start">
                        <ProgressRing
                          progress={featuredStats.progress}
                          label={`${Math.round(featuredStats.progress * 100)}%`}
                        />
                        <Text
                          fontSize={16}
                          fontWeight="700"
                          color="$color"
                          numberOfLines={1}
                          mt="$3"
                        >
                          Continue: {featuredModule.name}
                        </Text>
                        <Text fontSize={14} color="$colorSecondary">
                          {featuredStats.known}/{featuredStats.total} terms
                        </Text>
                      </AppCard>
                    </Pressable>
                  ) : null}

                  <AppCard variant="glass" f={1} gap="$1" ai="flex-start">
                    <Text fontSize={31} fontWeight="900" color="$color">
                      {modules.length}
                    </Text>
                    <SectionTitle tone="onGlass">Total modules</SectionTitle>
                    <Text
                      fontSize={31}
                      fontWeight="900"
                      color="$accentGradientStart"
                      mt={12}
                    >
                      {cardsLearned}
                    </Text>
                    <SectionTitle tone="onGlass">Cards learned</SectionTitle>
                  </AppCard>
                </XStack>
              </YStack>

              {recent.length > 0 && (
                <YStack gap={14}>
                  <SectionTitle>Recent</SectionTitle>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <XStack gap={11}>
                      {recent.map((m, i) => {
                        const count = m._count?.flashcards ?? 0;
                        return (
                          <Chip
                            key={m.id}
                            size="lg"
                            monogram={m.name.slice(0, 1).toUpperCase()}
                            title={m.name}
                            meta={`${count} card${count !== 1 ? "s" : ""}`}
                            gradientColors={
                              CHIP_GRADIENTS[i % CHIP_GRADIENTS.length]
                            }
                            onPress={() => openModule(m.id)}
                          />
                        );
                      })}
                    </XStack>
                  </ScrollView>
                </YStack>
              )}

              {discover.length > 0 && (
                <YStack gap={14}>
                  <SectionTitle>Discover</SectionTitle>
                  <YStack gap={14}>
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
