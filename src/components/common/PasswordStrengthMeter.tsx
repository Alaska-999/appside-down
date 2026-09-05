import { Text, XStack, YStack } from "tamagui";

function scorePassword(password: string) {
  const hasLength = password.length >= 8;
  const hasCaseMix = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const hint = !hasLength
    ? "Use at least 8 characters"
    : !hasCaseMix
      ? "Mix upper and lowercase letters"
      : !hasNumber
        ? "Add a number to make it strong"
        : null;

  return { bars: [hasLength, hasCaseMix, hasNumber], hint };
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { bars, hint } = scorePassword(password);

  return (
    <YStack gap={7} mt={10}>
      <XStack gap={5}>
        {bars.map((on, index) => (
          <YStack
            key={index}
            f={1}
            height={3}
            br={2}
            bg={on ? "$limeLight" : "rgba(220,255,245,0.1)"}
          />
        ))}
      </XStack>
      {hint && (
        <Text fontSize={11.5} color="#7F97A6">
          {hint}
        </Text>
      )}
    </YStack>
  );
}
