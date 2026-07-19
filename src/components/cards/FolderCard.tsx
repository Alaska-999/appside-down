import { AppCard } from "@/src/components/ui/Card";
import { TEXT } from "@/src/constants/typography";
import { Folder } from "@tamagui/lucide-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable } from "react-native";
import { Image, Text, YStack, useTheme } from "tamagui";

interface FolderCardProps {
  folder: {
    id: string;
    name: string;
    icon?: string | null;
    moduleIds?: string[];
    modules?: unknown[];
    _count?: { modules?: number };
  };
  onPress: () => void;
}

const isImageUrl = (icon?: string | null) =>
  !!icon && /^(https?:|file:|data:|content:)/.test(icon);

export function FolderCard({ folder, onPress }: FolderCardProps) {
  const theme = useTheme();
  const moduleCount =
    folder._count?.modules ??
    folder.modules?.length ??
    folder.moduleIds?.length ??
    0;
  return (
    <Pressable onPress={onPress}>
      <AppCard
        variant="soft"
        fd="row"
        ai="center"
        gap={16}
        br={20}
        px={15}
        py={17}
        h={76}
      >
        <LinearGradient
          colors={[theme.gradientHeroStart.get(), theme.gradientHeroMid.get()]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 13,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isImageUrl(folder.icon) ? (
            <Image
              source={{ uri: folder.icon as string }}
              width={40}
              height={40}
              br={20}
              accessibilityLabel={folder.name}
            />
          ) : folder.icon ? (
            <Text fontSize={23}>{folder.icon}</Text>
          ) : (
            <Folder size={22} color="$color" opacity={0.9} />
          )}
        </LinearGradient>
        <YStack f={1} gap="8">
          <Text fontSize={TEXT.cardTitle} fontWeight="700" color="$color">
            {folder.name}
          </Text>
          <Text fontSize={TEXT.cardMeta} color="$colorMuted">
            {moduleCount} module{moduleCount !== 1 ? "s" : ""}
          </Text>
        </YStack>
      </AppCard>
    </Pressable>
  );
}
