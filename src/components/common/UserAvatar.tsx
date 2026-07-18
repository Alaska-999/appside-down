import { getInitials } from "@/src/utils/getInitials";
import { Avatar, Text } from "tamagui";

interface UserAvatarProps {
  avatarUrl?: string | null;
  username?: string | null;
  size: string;
  onPress?: () => void;
}

export function UserAvatar({ avatarUrl, username, size, onPress }: UserAvatarProps) {
  return (
    <Avatar size={size} circular bg="#E5E7EB" onPress={onPress}>
      {avatarUrl ? (
        <Avatar.Image src={avatarUrl} accessibilityLabel="User avatar" />
      ) : (
        <Avatar.Fallback jc="center" ai="center">
          <Text color="#4B5563" fontSize={size} fontWeight="700">
            {getInitials(username)}
          </Text>
        </Avatar.Fallback>
      )}
    </Avatar>
  );
}
