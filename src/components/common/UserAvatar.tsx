import { AvatarPlaceholder } from "@/src/components/ui/AvatarPlaceholder";
import { getInitials } from "@/src/utils/getInitials";
import { Pressable } from "react-native";
import { Avatar } from "tamagui";

interface UserAvatarProps {
  avatarUrl?: string | null;
  username?: string | null;
  size: number;
  onPress?: () => void;
}

export function UserAvatar({
  avatarUrl,
  username,
  size,
  onPress,
}: UserAvatarProps) {
  const fontSize = Math.round(size * 0.43);
  const label = getInitials(username);

  if (!avatarUrl) {
    return (
      <Pressable onPress={onPress} disabled={!onPress}>
        <AvatarPlaceholder
          label={label}
          size={size}
          fontSize={fontSize}
          variant="frostLight"
          // variant="frostMuted"

          // variant="frostVeilMint"
          // variant="frostVeilSoft"
          // variant="limeGlassLit"
          // variant="mintGlass"
          // variant="mintGlassLit"
          // variant="tealDeep"
        />
      </Pressable>
    );
  }

  return (
    <Avatar size={size} circular onPress={onPress}>
      <Avatar.Image src={avatarUrl} accessibilityLabel="User avatar" />
      <Avatar.Fallback>
        <AvatarPlaceholder label={label} size={size} fontSize={fontSize} />
      </Avatar.Fallback>
    </Avatar>
  );
}
