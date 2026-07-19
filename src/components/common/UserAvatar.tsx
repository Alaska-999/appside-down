import { getInitials } from "@/src/utils/getInitials";
import { Avatar, Text } from "tamagui";

interface UserAvatarProps {
  avatarUrl?: string | null;
  username?: string | null;
  size: string | number;
  onPress?: () => void;
}

export function UserAvatar({
  avatarUrl,
  username,
  size,
  onPress,
}: UserAvatarProps) {
  // токен ("$8") лишаємо як є для fontSize (так само працює й раніше);
  // для числового пікселя (аватар побільше, напр. на Settings) масштабуємо
  // текст ініціалів окремо, інакше він вийде такого ж розміру, як весь круг
  const fontSize = typeof size === "number" ? Math.round(size / 2.2) : size;

  return (
    <Avatar size={size} circular bg="#E5E7EB" onPress={onPress}>
      {avatarUrl ? (
        <Avatar.Image src={avatarUrl} accessibilityLabel="User avatar" />
      ) : (
        <Avatar.Fallback jc="center" ai="center">
          <Text color="#4B5563" fontSize={fontSize} fontWeight="700">
            {getInitials(username)}
          </Text>
        </Avatar.Fallback>
      )}
    </Avatar>
  );
}
