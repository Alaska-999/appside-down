import { UserAvatar } from "@/src/components/common/UserAvatar";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "tamagui";

interface AvatarRingProps {
  avatarUrl?: string | null;
  username?: string | null;
  size?: number;
  onPress?: () => void;
}

// тонке градієнтне кільце навколо аватарки — перевикористовуваний акцент,
// не прив'язаний до Home (годиться й для Profile/Settings)
export function AvatarRing({ avatarUrl, username, size = 44, onPress }: AvatarRingProps) {
  const theme = useTheme();
  const ringWidth = 2.5;

  return (
    <LinearGradient
      colors={[theme.accentGradientStart.get(), theme.accentGradientEnd.get()]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        padding: ringWidth,
      }}
    >
      <UserAvatar
        avatarUrl={avatarUrl}
        username={username}
        size={size - ringWidth * 2}
        onPress={onPress}
      />
    </LinearGradient>
  );
}
