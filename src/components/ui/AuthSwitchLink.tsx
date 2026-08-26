import type { Href } from "expo-router";
import { Link } from "expo-router";
import { Pressable } from "react-native";
import { Text } from "tamagui";

interface AuthSwitchLinkProps {
  href: Href;
  prompt: string;
  action: string;
}

export function AuthSwitchLink({ href, prompt, action }: AuthSwitchLinkProps) {
  return (
    <Link href={href} asChild>
      <Pressable hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}>
        <Text fontSize={13.5} color="#7F97A6" textAlign="center">
          {prompt}{" "}
          <Text color="$mintLight" fontWeight="700">
            {action}
          </Text>
        </Text>
      </Pressable>
    </Link>
  );
}
