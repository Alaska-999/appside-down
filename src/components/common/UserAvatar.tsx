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
  const fontSize = Math.round(size / 2.2);

  if (!avatarUrl) {
    return (
      <Pressable onPress={onPress} disabled={!onPress}>
        <YStack
          width={size}
          height={size}
          br={size / 2}
          bg="$backgroundStrong"
          ai="center"
          jc="center"
        >
          <Text color="$colorSecondary" fontSize={fontSize} fontWeight="800">
            {getInitials(username)}
          </Text>
        </YStack>
      </Pressable>
    );
  }

  return (
    <Avatar size={size} circular onPress={onPress}>
      <Avatar.Image src={avatarUrl} accessibilityLabel="User avatar" />
      <Avatar.Fallback bg="$backgroundStrong" jc="center" ai="center">
        <Text color="$colorSecondary" fontSize={fontSize} fontWeight="800">
          {getInitials(username)}
        </Text>
      </Avatar.Fallback>
    </Avatar>
  );
}
