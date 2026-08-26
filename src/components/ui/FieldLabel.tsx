import { Text, XStack } from "tamagui";

export function FieldLabel({
  label,
  hint,
}: {
  label: string;
  hint?: string;
}) {
  return (
    <XStack ai="center" gap={8} mb={8}>
      <Text
        fontSize={11.5}
        fontWeight="700"
        letterSpacing={0.575}
        textTransform="uppercase"
        color="#8FA8B8"
      >
        {label}
      </Text>
      {hint && (
        <Text fontSize={10.5} fontWeight="600" color="#5A6B7A">
          {hint}
        </Text>
      )}
    </XStack>
  );
}
