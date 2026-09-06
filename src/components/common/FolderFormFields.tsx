import { FolderCover } from "@/src/components/common/FolderCover";
import { FormInput } from "@/src/components/common/FormInput";
import { FieldLabel } from "@/src/components/ui/FieldLabel";
import { ReactNode } from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import { Text, YStack } from "tamagui";

export function FolderFormFields<T extends FieldValues>({
  control,
  nameField,
  coverUri,
  onCoverChange,
  autoFocusName,
  tagsHint,
  tagsFootnote,
  tagEditor,
  children,
}: {
  control: Control<T>;
  nameField: Path<T>;
  coverUri: string | null;
  onCoverChange: (uri: string | null) => void;
  autoFocusName?: boolean;
  tagsHint?: string;
  tagsFootnote?: string;
  tagEditor: ReactNode;
  children?: ReactNode;
}) {
  return (
    <YStack gap={18}>
      <YStack ai="center" pt={10} pb={0} mb={-6}>
        <FolderCover imageUri={coverUri} onChange={onCoverChange} />
      </YStack>

      <YStack>
        <FieldLabel label="Name" />
        <FormInput
          control={control}
          name={nameField}
          variant="wellSoft"
          placeholder="Untitled folder"
          maxLength={40}
          showCounter
          hideError
          autoFocus={autoFocusName}
        />
      </YStack>

      <YStack>
        <FieldLabel label="Tags" hint={tagsHint} />
        {tagEditor}
        {tagsFootnote && (
          <Text fontSize={11.5} color="$mutedDim" mt={8} ml={4}>
            {tagsFootnote}
          </Text>
        )}
      </YStack>

      {children}
    </YStack>
  );
}
