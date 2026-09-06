import { getInitials } from "@/src/utils/getInitials";
import { Pressable } from "react-native";
import { Avatar, Text, YStack } from "tamagui";

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

  if (!avatarUrl) {
    return (
      <Pressable onPress={onPress} disabled={!onPress}>
        <YStack
          width={size}
          height={size}
          br={size / 2}
          bg="#141A1F"
          ai="center"
          jc="center"
        >
          <Text color="$colorMuted" fontSize={fontSize} fontWeight="800">
            {getInitials(username)}
          </Text>
        </YStack>
      </Pressable>
    );
  }

  return (
    <Avatar size={size} circular onPress={onPress}>
      <Avatar.Image src={avatarUrl} accessibilityLabel="User avatar" />
      <Avatar.Fallback bg="#141A1F" jc="center" ai="center">
        <Text color="$colorMuted" fontSize={fontSize} fontWeight="800">
          {getInitials(username)}
        </Text>
      </Avatar.Fallback>
    </Avatar>
  );
}
