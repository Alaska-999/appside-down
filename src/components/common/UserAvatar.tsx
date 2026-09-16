import {
  AvatarPlaceholder,
  AvatarPlaceholderVariant,
} from "@/src/components/ui/AvatarPlaceholder";
import { getInitials } from "@/src/utils/getInitials";
import { Pressable } from "react-native";
import { Avatar } from "tamagui";

interface UserAvatarProps {
  avatarUrl?: string | null;
  username?: string | null;
  size: number;
  variant?: AvatarPlaceholderVariant;
  onPress?: () => void;
}

export function UserAvatar({
  avatarUrl,
  username,
  size,
  onPress,
  variant,
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
          variant={variant ? variant : "frostMuted"}

          // variant="frostLight"
          // variant="frostVeilMint"
          // variant="frostVeilSoft"
          // variant="limeGlassLit"
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
