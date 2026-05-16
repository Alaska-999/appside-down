import { protectedFetch } from "@/src/utils/protectedFetch";
import { Search } from "@tamagui/lucide-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable } from "react-native";
import { Button, Input, Text, XStack, YStack } from "tamagui";

type ModuleItem = { id: string; name: string; itemsCount: number; selected: boolean };

function mapModule(raw: any): ModuleItem {
  return {
    id: raw.id,
    name: raw.name,
    itemsCount: raw._count?.flashcards ?? raw.itemsCount ?? 0,
    selected: false,
  };
}

export default function AddModules() {
  const { folderId } = useLocalSearchParams<{ folderId: string }>();
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableModules();
  }, []);

  const fetchAvailableModules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await protectedFetch(
        `${process.env.EXPO_PUBLIC_API_URL}/modules`,
        { method: "GET" },
      );
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const raw: any[] = await res.json();
      const available = raw
        .filter((m) => m.folderId !== folderId)
        .map(mapModule);
      setModules(available);
    } catch (err) {
      console.error("[AddModules] fetch error:", err);
      setError("Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m)),
    );
  };

  const selectedIds = modules.filter((m) => m.selected).map((m) => m.id);

  const handleAdd = async () => {
    if (selectedIds.length === 0 || !folderId) return;
    setSaving(true);
    try {
      await Promise.all(
        selectedIds.map((moduleId) =>
          protectedFetch(
            `${process.env.EXPO_PUBLIC_API_URL}/folders/${folderId}/modules`,
            {
              method: "POST",
              body: JSON.stringify({ moduleId }),
            },
          ),
        ),
      );
      router.back();
    } catch (err) {
      console.error("[AddModules] add error:", err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = modules.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <YStack f={1} bg="$background">
      <YStack px="$4" pt="$12" gap="$4" f={1}>
        <XStack jc="space-between" ai="center">
          <Text fontSize="$7" fontWeight="bold">Add Materials</Text>
          <Button
            size="$3"
            bg="$buttonSecondaryBg"
            br="$10"
            onPress={() =>
              router.push({
                pathname: "/module/create",
                params: { returnFolderId: folderId },
              })
            }
          >
            <Text color="$buttonSecondaryText" fontSize="$3">Create new</Text>
          </Button>
        </XStack>

        <XStack
          bg="$backgroundCard"
          br="$4"
          px="$3"
          ai="center"
          gap="$2"
        >
          <Search size="$1" color="$colorMuted" />
          <Input
            f={1}
            placeholder="Search modules..."
            value={search}
            onChangeText={setSearch}
            bg="transparent"
            borderWidth={0}
            size="$4"
          />
        </XStack>

        {loading && <Text color="$colorMuted">Loading...</Text>}
        {error && <Text color="$statusDanger">{error}</Text>}

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
          ListEmptyComponent={
            !loading ? (
              <Text color="$colorMuted" textAlign="center" mt="$4">
                No modules available
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => toggleModule(item.id)}>
              <XStack
                bg={item.selected ? "$buttonBg" : "$backgroundCard"}
                br="$4"
                p="$4"
                ai="center"
                gap="$3"
              >
                <XStack
                  w={22}
                  h={22}
                  br="$2"
                  bw={2}
                  borderColor={item.selected ? "$buttonText" : "$borderColor"}
                  bg={item.selected ? "$buttonText" : "transparent"}
                  jc="center"
                  ai="center"
                >
                  {item.selected && (
                    <Text fontSize="$2" color="$buttonBg">✓</Text>
                  )}
                </XStack>
                <YStack f={1}>
                  <Text
                    fontSize="$5"
                    fontWeight="600"
                    color={item.selected ? "$buttonText" : "$color"}
                  >
                    {item.name}
                  </Text>
                  <Text
                    fontSize="$3"
                    color={item.selected ? "$buttonText" : "$colorMuted"}
                  >
                    {item.itemsCount} card{item.itemsCount !== 1 ? "s" : ""}
                  </Text>
                </YStack>
              </XStack>
            </Pressable>
          )}
        />
      </YStack>

      {selectedIds.length > 0 && (
        <YStack
          pos="absolute"
          bottom={0}
          left={0}
          right={0}
          p="$4"
          bg="$background"
          btw={1}
          borderColor="$borderColor"
        >
          <Button bg="$buttonBg" br="$10" onPress={handleAdd} disabled={saving}>
            <Text color="$buttonText">
              {saving ? "Adding..." : `Add ${selectedIds.length} module${selectedIds.length !== 1 ? "s" : ""}`}
            </Text>
          </Button>
        </YStack>
      )}
    </YStack>
  );
}
