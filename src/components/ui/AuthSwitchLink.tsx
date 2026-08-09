import type { Href } from "expo-router";
import { Link } from "expo-router";
import { Pressable } from "react-native";
import { Text } from "tamagui";

const MOCKUP_SCALE = 390 / 290;

interface AuthSwitchLinkProps {
  href: Href;
  prompt: string;
  action: string;
}

export function AuthSwitchLink({ href, prompt, action }: AuthSwitchLinkProps) {
  return (
    <Link href={href} asChild>
      <Pressable hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}>
        <Text
          color="$colorSecondary"
          fontSize={12.5 * MOCKUP_SCALE}
          textAlign="center"
        >
          {prompt}{" "}
          <Text color="$lime" fontWeight="700">
            {action}
          </Text>
        </Text>
      </Pressable>
    </Link>
  );
}
