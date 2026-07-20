import { AppCard } from "@/src/components/ui/Card";
import { GlassSheet } from "@/src/components/ui/GlassSheet";
import { ChevronRight, FilePlus, Folder } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Href, useRouter } from "expo-router";
import { Pressable } from "react-native";
import { Text, YStack } from "tamagui";

export function CreateActionSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  const handleNavigate = (path: Href) => {
    onOpenChange(false);
    router.push(path);
  };

  const actions = [
    {
      key: "folder",
      label: "Folder",
      description: "Group modules together",
      icon: <Folder size={26} color="white" />,
      gradient: ["#2dd4bf", "#a3e635"] as [string, string],
      onPress: () => handleNavigate("/folder/create"),
    },
    {
      key: "module",
      label: "Module",
      description: "A new set of flashcards",
      icon: <FilePlus size={26} color="white" />,
      gradient: ["#4338ca", "#65a30d"] as [string, string],
      onPress: () => handleNavigate("/module/create"),
    },
  ];

  return (
    <GlassSheet open={open} onOpenChange={onOpenChange} title="Create New">
      <YStack gap={14}>
        {actions.map((action) => (
          <Pressable key={action.key} onPress={action.onPress}>
            <AppCard variant="flat" size="md" fd="row" ai="center" gap={16}>
              <LinearGradient
                colors={action.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 57,
                  height: 57,
                  borderRadius: 18,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {action.icon}
              </LinearGradient>
              <YStack f={1} gap={2}>
                <Text color="$color" fontSize={20} fontWeight="700">
                  {action.label}
                </Text>
                <Text color="$colorMuted" fontSize={15.5}>
                  {action.description}
                </Text>
              </YStack>
              <ChevronRight size={20} color="$colorMuted" opacity={0.5} />
            </AppCard>
          </Pressable>
        ))}
      </YStack>
    </GlassSheet>
  );
}
