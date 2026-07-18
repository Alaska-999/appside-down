import { UserAvatar } from "@/src/components/common/UserAvatar";
import { useAuthStore } from "@/src/store/useAuthStore";
import { LearningStatus } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { Search, X } from "@tamagui/lucide-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
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

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const PROGRESS_COLOR = "#059669";

function PublicModuleRow({ module }: { module: PublicModuleResult }) {
  const count = module._count?.flashcards ?? 0;
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/module/[id]", params: { id: module.id } })
      }
    >
      <YStack
        bg="$backgroundHover"
        br="$4"
        px="$4"
        py="$3"
        gap="$1"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <Text fontSize="$4" fontWeight="600" color="$color">
          {module.name}
        </Text>
        <Text fontSize="$3" color="$colorMuted">
          {module.user?.username ?? "Unknown"} · {count} term
          {count !== 1 ? "s" : ""}
        </Text>
      </YStack>
    </Pressable>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text fontSize="$6" fontWeight="bold" color="$color">
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
    <YStack f={1} bg="$background" pt={insets.top}>
      <YStack px="$4" gap="$3" f={1}>
        <Text fontSize="$7" fontWeight="bold" color="$color" mt="$2">
          Hi, {user?.username ?? "there"} 👋
        </Text>

        <XStack jc="space-between" gap="$3" ai="center">
          <XStack
            f={1}
            bg="$backgroundHover"
            br="$10"
            px="$3"
            ai="center"
            gap="$2"
            borderWidth={1}
            borderColor="$borderColor"
            h={40}
          >
            <Search size={16} color="$colorMuted" />
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
          <UserAvatar
            avatarUrl={user?.avatarUrl}
            username={user?.username}
            size="$3"
            onPress={navigateToProfile}
          />
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
            <YStack gap="$5" pb="$8">
              {/* Continue learning */}
              {continueLearning.length > 0 && (
                <YStack gap="$3">
                  <SectionTitle>Continue learning</SectionTitle>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <XStack gap="$3">
                      {continueLearning.map((m) => {
                        const statuses =
                          m.flashcards?.map((f) => f.status) ?? [];
                        const total = statuses.length;
                        const known = statuses.filter(
                          (s) => s === "KNOWN",
                        ).length;
                        return (
                          <Pressable
                            key={m.id}
                            onPress={() => openModule(m.id)}
                          >
                            <YStack
                              w={200}
                              bg="$backgroundHover"
                              br="$4"
                              p="$4"
                              gap="$2"
                              borderWidth={1}
                              borderColor="$borderColor"
                            >
                              <Text
                                fontSize="$4"
                                fontWeight="600"
                                color="$color"
                                numberOfLines={2}
                              >
                                {m.name}
                              </Text>
                              <View
                                style={{
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: "#E2E8F0",
                                  overflow: "hidden",
                                }}
                              >
                                <View
                                  style={{
                                    height: "100%",
                                    borderRadius: 3,
                                    width: `${total ? Math.round((known / total) * 100) : 0}%`,
                                    backgroundColor: PROGRESS_COLOR,
                                  }}
                                />
                              </View>
                              <Text fontSize="$3" color="$colorMuted">
                                {known}/{total} terms
                              </Text>
                            </YStack>
                          </Pressable>
                        );
                      })}
                    </XStack>
                  </ScrollView>
                </YStack>
              )}

              {/* Streak placeholder */}
              <XStack
                bg="$backgroundHover"
                br="$4"
                p="$4"
                ai="center"
                gap="$3"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text fontSize={32}>🔥</Text>
                <YStack f={1} gap="$2">
                  <YStack>
                    <Text fontSize="$5" fontWeight="bold" color="$color">
                      0 day streak
                    </Text>
                    <Text fontSize="$3" color="$colorMuted">
                      Learn something today to start your streak
                    </Text>
                  </YStack>
                  <XStack gap="$2">
                    {DAY_LABELS.map((label, i) => (
                      <YStack key={`${label}-${i}`} ai="center" gap="$1">
                        <Text
                          fontSize="$1"
                          color={i === todayIndex ? "$color" : "$colorMuted"}
                          fontWeight={i === todayIndex ? "700" : "400"}
                        >
                          {label}
                        </Text>
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: "#E2E8F0",
                            borderWidth: i === todayIndex ? 1.5 : 0,
                            borderColor: PROGRESS_COLOR,
                          }}
                        />
                      </YStack>
                    ))}
                  </XStack>
                </YStack>
              </XStack>

              {/* Recent */}
              {recent.length > 0 && (
                <YStack gap="$3">
                  <SectionTitle>Recent</SectionTitle>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <XStack gap="$3">
                      {recent.map((m) => {
                        const count = m._count?.flashcards ?? 0;
                        return (
                          <Pressable
                            key={m.id}
                            onPress={() => openModule(m.id)}
                          >
                            <YStack
                              w={140}
                              bg="$backgroundHover"
                              br="$4"
                              p="$3"
                              gap="$1"
                              borderWidth={1}
                              borderColor="$borderColor"
                            >
                              <Text
                                fontSize="$4"
                                fontWeight="600"
                                color="$color"
                                numberOfLines={2}
                              >
                                {m.name}
                              </Text>
                              <Text fontSize="$3" color="$colorMuted">
                                {count} card{count !== 1 ? "s" : ""}
                              </Text>
                            </YStack>
                          </Pressable>
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
    </YStack>
  );
}
