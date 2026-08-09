import { API_BASE_URL } from "@/src/api/config";
import { StreakCard } from "@/src/components/cards/StreakCard";
import { AvatarRing } from "@/src/components/ui/AvatarRing";
import { AppCard } from "@/src/components/ui/Card";
import { Chip } from "@/src/components/ui/Chip";
import { GradientText } from "@/src/components/ui/GradientText";
import { ProgressRing } from "@/src/components/ui/ProgressRing";
import { ScreenBackground } from "@/src/components/ui/ScreenBackground";
import { SearchField } from "@/src/components/ui/SearchField";
import { SectionTitle } from "@/src/components/ui/SectionTitle";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StateCard } from "@/src/components/ui/StateCard";
import { usePaginatedCursorList } from "@/src/hooks/usePaginatedCursorList";
import { useAuthStore } from "@/src/store/useAuthStore";
import { LearningStatus } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { TAB_BAR_CLEARANCE_GAP, TAB_BAR_HEIGHT } from "@/app/(tabs)/_layout";
import { screenGutter, topPaddingBoost } from "@/tamagui.config";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, Text, useTheme, XStack, YStack } from "tamagui";

type PublicModuleResult = {
  id: string;
  name: string;
  user?: { id: string; username: string; avatarUrl?: string | null };
  author?: { id: string; username: string; avatarUrl?: string | null } | null;
  authorUsername?: string | null;
  _count?: { flashcards: number };
};

type HomeModule = {
  id: string;
  name: string;
  updatedAt: string;
  flashcards?: { status: LearningStatus }[];
  _count?: { flashcards: number };
};

type ContinueLearningEntry = {
  id: string;
  name: string;
  updatedAt: string;
  known: number;
  total: number;
};

type Stats = {
  totalModules: number;
  cardsLearned: number;
  continueLearning: ContinueLearningEntry[];
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
      <AppCard variant="soft" size="md" gap="$0.5">
        <Text fontSize={17} fontWeight="700" color="$color">
          {module.name}
        </Text>
        <Text fontSize={14} color="$colorMuted">
          {module.author?.username ?? module.authorUsername ?? "Unknown"} ·{" "}
          {count} term
          {count !== 1 ? "s" : ""}
        </Text>
      </AppCard>
    </Pressable>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const mint = theme.accentGradientStart.get();
  const tabBarClearance = TAB_BAR_HEIGHT + insets.bottom + TAB_BAR_CLEARANCE_GAP;

  const [search, setSearch] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentModules, setRecentModules] = useState<HomeModule[]>([]);
  const [discoverModules, setDiscoverModules] = useState<PublicModuleResult[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const { user, isHydrated } = useAuthStore();
  const isLoggedIn = !!user;

  const searching = search.trim().length >= 2;
  const todayIndex = (new Date().getDay() + 6) % 7;

  useFocusEffect(
    useCallback(() => {
      if (!isHydrated || !isLoggedIn) return;
      fetchData();
    }, [isHydrated, isLoggedIn]),
  );

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const [statsRes, recentRes, discoverRes] = await Promise.all([
        protectedFetch(`${API_BASE_URL}/modules/stats`),
        protectedFetch(`${API_BASE_URL}/modules?limit=6`),
        protectedFetch(
          `${API_BASE_URL}/modules/public?limit=6&excludeOwn=true`,
        ),
      ]);
      if (!statsRes.ok) throw new Error(`Stats error: ${statsRes.status}`);
      if (!recentRes.ok) throw new Error(`Modules error: ${recentRes.status}`);
      if (!discoverRes.ok)
        throw new Error(`Public error: ${discoverRes.status}`);

      const [statsData, recentData, discoverData] = await Promise.all([
        statsRes.json() as Promise<Stats>,
        recentRes.json() as Promise<{
          data: HomeModule[];
          nextCursor: string | null;
        }>,
        discoverRes.json() as Promise<{
          data: PublicModuleResult[];
          nextCursor: string | null;
        }>,
      ]);
      setStats(statsData);
      setRecentModules(recentData.data);
      setDiscoverModules(discoverData.data);
    } catch (err) {
      console.error("[Home] fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchSearchPage = useCallback(
    async (cursor: string | null) => {
      const params = new URLSearchParams({
        search: debouncedSearch,
        limit: "20",
      });
      if (cursor) params.set("cursor", cursor);
      const res = await protectedFetch(
        `${API_BASE_URL}/modules/public?${params.toString()}`,
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      return res.json();
    },
    [debouncedSearch],
  );

  const searchList = usePaginatedCursorList<PublicModuleResult>(
    fetchSearchPage,
    debouncedSearch,
  );

  const featuredModule = stats?.continueLearning[0];
  const featuredStats = featuredModule
    ? {
        known: featuredModule.known,
        total: featuredModule.total,
        progress: featuredModule.total
          ? featuredModule.known / featuredModule.total
          : 0,
      }
    : null;

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
      <YStack f={1} gap="$section" pt={insets.top + topPaddingBoost}>
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
          <SearchField
            value={search}
            onChangeText={setSearch}
            placeholder="Search public modules..."
          />
        </YStack>

        {searching ? (
          <FlatList
            data={debouncedSearch.length >= 2 ? searchList.items : []}
            keyExtractor={(m) => m.id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: screenGutter,
              gap: 8,
              paddingBottom: tabBarClearance,
            }}
            onEndReached={searchList.loadMore}
            onEndReachedThreshold={0.4}
            renderItem={({ item }) => <PublicModuleRow module={item} />}
            refreshControl={
              <RefreshControl
                refreshing={searchList.refreshing}
                onRefresh={searchList.refresh}
                tintColor={mint}
              />
            }
            ListEmptyComponent={
              !searchList.initialLoading ? (
                <Text color="$colorMuted">No public modules found</Text>
              ) : null
            }
          />
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchData(true)}
                tintColor={mint}
              />
            }
          >
            <YStack px="$screenX" gap="$section" pb={tabBarClearance}>
              <YStack gap={12}>
                <StreakCard
                  currentStreak={user?.streak?.currentStreak ?? 0}
                  todayIndex={todayIndex}
                />

                {loading && !stats ? (
                  <XStack gap={12}>
                    <Skeleton f={1} height={156} borderRadius={23} />
                    <Skeleton f={1} height={156} borderRadius={23} />
                  </XStack>
                ) : error && !stats ? (
                  <StateCard
                    variant="error"
                    title="Couldn't load your stats"
                    subtitle="Looks like a connection hiccup. Your data is safe — try again."
                    buttonLabel="Retry"
                    onButtonPress={() => fetchData()}
                  />
                ) : (
                  <XStack gap={12}>
                    {featuredModule && featuredStats ? (
                      <Pressable
                        style={{ flex: 1 }}
                        onPress={() => openModule(featuredModule.id)}
                      >
                        <AppCard
                          variant="glass"
                          size="lg"
                          f={1}
                          gap={9}
                          ai="flex-start"
                        >
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

                    <AppCard
                      variant="glass"
                      size="lg"
                      f={1}
                      gap="$1"
                      ai="flex-start"
                    >
                      <Text fontSize={31} fontWeight="900" color="$color">
                        {stats?.totalModules ?? 0}
                      </Text>
                      <SectionTitle tone="onGlass">Total modules</SectionTitle>
                      <Text
                        fontSize={31}
                        fontWeight="900"
                        color="$accentGradientStart"
                        mt={12}
                      >
                        {stats?.cardsLearned ?? 0}
                      </Text>
                      <SectionTitle tone="onGlass">Cards learned</SectionTitle>
                    </AppCard>
                  </XStack>
                )}
              </YStack>

              {recentModules.length > 0 && (
                <YStack gap={14}>
                  <SectionTitle>Recent</SectionTitle>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <XStack gap={11}>
                      {recentModules.map((m, i) => {
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

              {discoverModules.length > 0 && (
                <YStack gap={14}>
                  <SectionTitle>Discover</SectionTitle>
                  <YStack gap={14}>
                    {discoverModules.map((m) => (
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
