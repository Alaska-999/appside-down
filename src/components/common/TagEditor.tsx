import {
  FolderAddRow,
  FolderEditIconAction,
  FolderEditRows,
  FolderTagEditRow,
} from "@/src/components/cards/FolderEditRow";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import type { TextInput } from "react-native";
import { Input, TamaguiElement, Text, XStack, YStack } from "tamagui";

export type TagEditorTag = { id: string; name: string; count?: number };

type TagEditorMode = "draft" | "manage";

const takenMessage = (name: string) =>
  `“${name}” already exists in this folder`;

function TagInputRow({
  inputRef,
  value,
  placeholder,
  color,
  error,
  py,
  selectTextOnFocus,
  onChange,
  onCommit,
  onCancel,
  commitLabel,
}: {
  inputRef: (node: TextInput | null) => void;
  value: string;
  placeholder?: string;
  color: string;
  error: string | null;
  py: number;
  selectTextOnFocus?: boolean;
  onChange: (value: string) => void;
  onCommit: () => void;
  onCancel?: () => void;
  commitLabel: string;
}) {
  return (
    <YStack px={16} py={py} gap={6}>
      <XStack ai="center" gap={10}>
        <Input
          ref={(node: TamaguiElement | null) =>
            inputRef(node as unknown as TextInput | null)
          }
          f={1}
          unstyled
          fontSize={15}
          fontWeight="600"
          color={color}
          placeholder={placeholder}
          placeholderTextColor="$placeholderColor"
          selectTextOnFocus={selectTextOnFocus}
          value={value}
          onChangeText={onChange}
          onSubmitEditing={onCommit}
        />
        <FolderEditIconAction
          icon={Check}
          label={commitLabel}
          onPress={onCommit}
        />
        {onCancel && (
          <FolderEditIconAction icon={X} label="Cancel" onPress={onCancel} />
        )}
      </XStack>
      {error && (
        <Text fontSize={11.5} color="$dangerText">
          {error}
        </Text>
      )}
    </YStack>
  );
}

export function TagEditor({
  tags,
  mode,
  onAdd,
  onRename,
  onRemove,
}: {
  tags: TagEditorTag[];
  mode: TagEditorMode;
  onAdd: (name: string) => Promise<string | null> | string | null | void;
  onRename?: (
    tag: TagEditorTag,
    name: string,
  ) => Promise<string | null> | string | null | void;
  onRemove: (tag: TagEditorTag) => void;
}) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [adding, setAdding] = useState(false);
  const [newValue, setNewValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const renameInputRef = useRef<TextInput | null>(null);
  const newInputRef = useRef<TextInput | null>(null);

  useEffect(() => {
    if (!renamingId) return;
    const timer = setTimeout(() => renameInputRef.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, [renamingId]);

  useEffect(() => {
    if (!adding) return;
    const timer = setTimeout(() => newInputRef.current?.focus(), 60);
    return () => clearTimeout(timer);
  }, [adding]);

  const isTaken = (name: string, exceptId?: string) =>
    tags.some(
      (t) => t.id !== exceptId && t.name.toLowerCase() === name.toLowerCase(),
    );

  const closeAdd = () => {
    setAdding(false);
    setNewValue("");
    setError(null);
  };

  const closeRename = () => {
    setRenamingId(null);
    setError(null);
  };

  const commitAdd = async () => {
    const trimmed = newValue.trim();
    if (!trimmed) return closeAdd();
    if (isTaken(trimmed)) return setError(takenMessage(trimmed));
    const result = await onAdd(trimmed);
    if (result) return setError(result);
    closeAdd();
  };

  const commitRename = async () => {
    const target = tags.find((t) => t.id === renamingId);
    const trimmed = renameValue.trim();
    if (!target || !trimmed || trimmed === target.name || !onRename) {
      return closeRename();
    }
    if (isTaken(trimmed, target.id)) return setError(takenMessage(trimmed));
    const result = await onRename(target, trimmed);
    if (result) return setError(result);
    closeRename();
  };

  const onChangeValue = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    if (error) setError(null);
  };

  return (
    <FolderEditRows>
      {[
        ...tags.map((tag) =>
          renamingId === tag.id ? (
            <TagInputRow
              key={tag.id}
              inputRef={(node) => {
                renameInputRef.current = node;
              }}
              value={renameValue}
              color="$color"
              error={error}
              py={10}
              selectTextOnFocus
              onChange={onChangeValue(setRenameValue)}
              onCommit={commitRename}
              onCancel={closeRename}
              commitLabel="Save tag"
            />
          ) : (
            <FolderTagEditRow
              key={tag.id}
              label={tag.name}
              count={mode === "manage" ? (tag.count ?? 0) : undefined}
              actions={
                mode === "manage" ? (
                  <>
                    {onRename && (
                      <FolderEditIconAction
                        icon={Pencil}
                        label={`Rename ${tag.name}`}
                        onPress={() => {
                          setRenamingId(tag.id);
                          setRenameValue(tag.name);
                        }}
                      />
                    )}
                    <FolderEditIconAction
                      icon={Trash2}
                      tone="danger"
                      label={`Delete ${tag.name}`}
                      onPress={() => onRemove(tag)}
                    />
                  </>
                ) : (
                  <FolderEditIconAction
                    icon={X}
                    label={`Remove ${tag.name}`}
                    onPress={() => onRemove(tag)}
                  />
                )
              }
            />
          ),
        ),
        adding ? (
          <TagInputRow
            key="__add"
            inputRef={(node) => {
              newInputRef.current = node;
            }}
            value={newValue}
            placeholder="New tag"
            color="$mintLight"
            error={error}
            py={15}
            onChange={onChangeValue(setNewValue)}
            onCommit={commitAdd}
            commitLabel="Add tag"
          />
        ) : (
          <FolderAddRow
            key="__newtag"
            icon={Plus}
            label="New tag"
            onPress={() => setAdding(true)}
          />
        ),
      ]}
    </FolderEditRows>
  );
}
