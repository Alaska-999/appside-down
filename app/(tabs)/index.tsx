import { API_BASE_URL } from "@/src/api/config";
import { StreakCard } from "@/src/components/cards/StreakCard";
import { AppButton } from "@/src/components/ui/Button";
import { AppCard } from "@/src/components/ui/Card";
import { AvatarRing } from "@/src/components/ui/AvatarRing";
import { GradientText } from "@/src/components/ui/GradientText";
import { ProgressRing } from "@/src/components/ui/ProgressRing";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { SearchField } from "@/src/components/ui/SearchField";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StateCard } from "@/src/components/ui/StateCard";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { SearchEmptyState } from "@/src/components/common/SearchEmptyState";
import { GlowTone } from "@/src/components/ui/GlowSurface";
import {
  ICON_ACCENT,
  ICON_BASE,
  ICON_HERO_LIME,
  ICON_INDIGO,
  ICON_LIME,
  ICON_LIME_LIGHT,
  ICON_MINT,
  ICON_TEAL,
} from "@/src/constants/iconColors";
import { useDebouncedValue } from "@/src/hooks/useDebouncedValue";
import { usePaginatedCursorList } from "@/src/hooks/usePaginatedCursorList";
import { useAuthStore } from "@/src/store/useAuthStore";
import { LearningStatus } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { TAB_BAR_CLEARANCE_GAP, TAB_BAR_HEIGHT } from "@/app/(tabs)/_layout";
import { screenGutter } from "@/tamagui.config";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { AlertTriangle, BookmarkCheck, Layers, Sparkles } from "lucide-react-native";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet } from "react-native";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { ScrollView, Text, useTheme, XStack, YStack } from "tamagui";

type PublicModuleResult = {
  id: string;
  name: string;
  user?: { id: string; username: string; avatarUrl?: string | null };
  author?: { id: string; username: string; avatarUrl?: string | null } | null;
  authorUsername?: string | null;
  _count?: { flashcards: number; copies?: number };
  savedCopyId?: string | null;
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

const RECENT_TONES: GlowTone[] = ["mint", "teal", "lime"];
const RECENT_MONOGRAM_GRADIENTS: [string, string][] = [
  [ICON_ACCENT, ICON_MINT],
  [ICON_MINT, ICON_TEAL],
  [ICON_LIME_LIGHT, ICON_LIME],
  [ICON_ACCENT, ICON_TEAL],
];
const DISCOVER_COVERS: [string, string][] = [
  ["#1BA88F", ICON_BASE],
  [ICON_HERO_LIME, ICON_BASE],
  [ICON_TEAL, ICON_BASE],
  [ICON_INDIGO, ICON_BASE],
];

function PublicModuleRow({ module }: { module: PublicModuleResult }) {
  const count = module._count?.flashcards ?? 0;
  const saves = module._count?.copies ?? 0;
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/module/[id]", params: { id: module.id } })
      }
    >
      <AppCard variant="surface" size="md" gap="$0.5">
        <Text fontSize={17} fontWeight="700" color="$color">
          {module.name}
        </Text>
        <XStack ai="center" gap={6} flexWrap="wrap">
          <Text fontSize={14} color="$colorMuted">
            {module.author?.username ?? module.authorUsername ?? "Unknown"} ·{" "}
            {count} term{count !== 1 ? "s" : ""}
            {saves > 0 ? ` · ${saves} save${saves !== 1 ? "s" : ""}` : ""}
          </Text>
          {module.savedCopyId && (
            <XStack ai="center" gap={4} px={8} py={2} br={999} bg="$mintGlassBg">
              <BookmarkCheck size={12} color={ICON_ACCENT} strokeWidth={2} />
              <Text fontSize={11} fontWeight="700" color="$mintLight">
                Saved
              </Text>
            </XStack>
          )}
        </XStack>
      </AppCard>
    </Pressable>
  );
}

function SectionHeader({
  title,
  onSeeAll,
  px,
}: {
  title: string;
  onSeeAll?: () => void;
  px?: number;
}) {
  return (
    <XStack ai="baseline" jc="space-between" px={px}>
      <Text fontSize={17} fontWeight="700" letterSpacing={-0.17} color="$color">
        {title}
      </Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={10}>
          <Text fontSize={12.5} fontWeight="600" color="$mintLight">
            See all →
          </Text>
        </Pressable>
      )}
    </XStack>
  );
}

export default function Home() {
  const screen = useScreenInsets();
  const theme = useTheme();
  const mint = theme.accentGradientStart.get();
  const tabBarClearance = TAB_BAR_HEIGHT + screen.insets.bottom + TAB_BAR_CLEARANCE_GAP;

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
          `${API_BASE_URL}/modules/public?limit=5&excludeOwn=true`,
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

  const debouncedSearch = useDebouncedValue(search.trim());

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
    <YStack f={1} bg="$background">
      <BackgroundMesh preset="home" />
      <YStack f={1} pt={screen.top} gap="$section">
        <YStack px="$screenX" gap="$section">
          <XStack jc="space-between" gap="$3" ai="flex-start">
            <YStack f={1}>
              <Text
                fontSize={14}
                color="$colorMuted"
                onLongPress={() => router.push("/showcase")}
              >
                Welcome back,
              </Text>
              <XStack ai="center" flexWrap="wrap">
                <GradientText fontSize={31}>
                  {user?.username ?? "there"}
                </GradientText>
                <Text fontSize={31} fontWeight="800" lineHeight={35}>
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
            placeholder="Search public modules"
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
              searchList.initialLoading ? null : searchList.error ? (
                <StateCard
                  tone="error"
                  icon={AlertTriangle}
                  title="Couldn't load results"
                  subtitle="Looks like a connection hiccup. Your data is safe — try again."
                  buttonLabel="Try again"
                  onButtonPress={searchList.retry}
                />
              ) : (
                <SearchEmptyState
                  query={debouncedSearch}
                  noun="modules"
                  onCreate={() => router.push("/module/create")}
                />
              )
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
              <YStack gap={14}>
                {loading && !stats ? (
                  <Skeleton height={186} borderRadius="$card" />
                ) : error && !stats ? (
                  <StateCard
                    tone="error"
                    icon={AlertTriangle}
                    title="Couldn't load your stats"
                    subtitle="Looks like a connection hiccup. Your data is safe — try again."
                    buttonLabel="Try again"
                    onButtonPress={() => fetchData()}
                  />
                ) : featuredModule && featuredStats ? (
                  <AppCard variant="progressLit" size="lg" lit={featuredStats.progress} minHeight={186}>
                    <Text
                      fontSize={11}
                      fontWeight="700"
                      letterSpacing={1.1}
                      textTransform="uppercase"
                      color="$limeLight"
                      mb={7}
                    >
                      Continue
                    </Text>
                    <Text
                      fontSize={22}
                      fontWeight="800"
                      letterSpacing={-0.22}
                      lineHeight={25.5}
                      color="$color"
                      numberOfLines={2}
                    >
                      {featuredModule.name}
                    </Text>
                    <Text fontSize={13} color="rgba(220,255,245,0.7)" mt={5}>
                      {featuredStats.known} of {featuredStats.total} cards learned
                    </Text>
                    <XStack ai="flex-end" jc="space-between" gap={12} mt="auto">
                      <YStack f={1}>
                        <AppButton
                          variant="primary"
                          size="md"
                          sheen
                          onPress={() => openModule(featuredModule.id)}
                        >
                          Continue
                        </AppButton>
                      </YStack>
                      <ProgressRing
                        progress={featuredStats.progress}
                        label={`${Math.round(featuredStats.progress * 100)}%`}
                      />
                    </XStack>
                  </AppCard>
                ) : null}

                <StreakCard
                  currentStreak={user?.streak?.currentStreak ?? 0}
                  todayIndex={todayIndex}
                />

                <XStack gap={10}>
                  <AppCard
                    variant="glow"
                    tone="teal"
                    f={1}
                    minHeight={104}
                    px={16}
                    py={16}
                    jc="flex-end"
                    pos="relative"
                  >
                    <YStack pos="absolute" t={14} r={14}>
                      <Layers size={15} color="rgba(255,255,255,0.5)" strokeWidth={1.9} />
                    </YStack>
                    <Text fontSize={28} fontWeight="900" letterSpacing={-0.56} color="$color">
                      {stats?.totalModules ?? 0}
                    </Text>
                    <Text fontSize={11.5} color="$colorMuted" fontWeight="500" mt={5}>
                      modules
                    </Text>
                  </AppCard>
                  <AppCard
                    variant="glow"
                    tone="lime"
                    f={1}
                    minHeight={104}
                    px={16}
                    py={16}
                    jc="flex-end"
                    pos="relative"
                  >
                    <YStack pos="absolute" t={14} r={14}>
                      <Sparkles size={15} color="rgba(255,255,255,0.5)" strokeWidth={1.9} />
                    </YStack>
                    <Text fontSize={28} fontWeight="900" letterSpacing={-0.56} color="$color">
                      {stats?.cardsLearned ?? 0}
                    </Text>
                    <Text fontSize={11.5} color="$colorMuted" fontWeight="500" mt={5}>
                      cards learned
                    </Text>
                  </AppCard>
                </XStack>
              </YStack>

              {recentModules.length > 0 && (
                <YStack gap={14} mx={-screenGutter}>
                  <SectionHeader
                    title="Recent"
                    onSeeAll={() => router.push("/library")}
                    px={screenGutter}
                  />
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingHorizontal: screenGutter,
                      gap: 11,
                    }}
                  >
                    {recentModules.map((m, i) => {
                      const count = m._count?.flashcards ?? 0;
                      return (
                        <Pressable key={m.id} onPress={() => openModule(m.id)}>
                          <AppCard
                            variant="glow"
                            tone={RECENT_TONES[i % RECENT_TONES.length]}
                            width={142}
                            height={132}
                            px={15}
                            py={15}
                            jc="space-between"
                          >
                            <LinearGradient
                              colors={
                                RECENT_MONOGRAM_GRADIENTS[i % RECENT_MONOGRAM_GRADIENTS.length]
                              }
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: 12,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Text fontSize={15} fontWeight="800" color="#06231F">
                                {m.name.slice(0, 1).toUpperCase()}
                              </Text>
                            </LinearGradient>
                            <YStack>
                              <Text
                                fontSize={14}
                                fontWeight="700"
                                lineHeight={17.5}
                                color="$color"
                                numberOfLines={2}
                              >
                                {m.name}
                              </Text>
                              <Text fontSize={11} color="$colorMuted" mt={4}>
                                {count} card{count !== 1 ? "s" : ""}
                              </Text>
                            </YStack>
                          </AppCard>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </YStack>
              )}

              {discoverModules.length > 0 && (
                <YStack gap={14}>
                  <SectionHeader
                    title="Discover"
                    onSeeAll={() => router.push("/library")}
                  />
                  <YStack gap={11}>
                    {discoverModules.map((m, i) => {
                      const count = m._count?.flashcards ?? 0;
                      const author = m.author?.username ?? m.authorUsername;
                      return (
                        <Pressable key={m.id} onPress={() => openModule(m.id)}>
                          <YStack pos="relative">
                            <AppCard
                              variant="media"
                              minHeight={122}
                              cover={
                                <LinearGradient
                                  colors={DISCOVER_COVERS[i % DISCOVER_COVERS.length]}
                                  start={{ x: 0.2, y: 0 }}
                                  end={{ x: 0.8, y: 1 }}
                                  style={StyleSheet.absoluteFill}
                                />
                              }
                            >
                              <Text fontSize={16} fontWeight="700" letterSpacing={-0.16} color="$color">
                                {m.name}
                              </Text>
                              {author && (
                                <Text fontSize={11.5} color="rgba(220,255,245,0.72)" mt={3}>
                                  @{author}
                                </Text>
                              )}
                            </AppCard>
                            <YStack pos="absolute" t={13} r={13}>
                              <XStack
                                bg="rgba(8,9,12,0.55)"
                                borderWidth={1}
                                borderColor="rgba(255,255,255,0.18)"
                                br={999}
                                px={9}
                                py={3}
                              >
                                <Text fontSize={10.5} color="$text" fontWeight="600">
                                  {count} cards
                                </Text>
                              </XStack>
                            </YStack>
                          </YStack>
                        </Pressable>
                      );
                    })}
                  </YStack>
                </YStack>
              )}
            </YStack>
          </ScrollView>
        )}
      </YStack>

      <StatusBarScrim />
    </YStack>
  );
}
