import { API_BASE_URL } from "@/src/api/config";
import {
  FolderAddRow,
  FolderEditIconAction,
  FolderEditRows,
  FolderModuleEditRow,
  FolderTagEditRow,
} from "@/src/components/cards/FolderEditRow";
import { FolderCover } from "@/src/components/common/FolderCover";
import { FormInput } from "@/src/components/common/FormInput";
import { AppButton } from "@/src/components/ui/Button";
import { FieldLabel } from "@/src/components/ui/FieldLabel";
import { IconButton } from "@/src/components/ui/IconButton";
import { SavePill } from "@/src/components/ui/SavePill";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { AppSheet, SheetRow, SheetRows } from "@/src/components/ui/Sheet";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { AppToast } from "@/src/components/ui/Toast";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { hapticTap } from "@/src/utils/haptics";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowUpFromLine,
  Check,
  Pencil,
  Plus,
  Tags,
  Trash2,
  X,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Input, Text, XStack, YStack } from "tamagui";

type FolderTag = { id: string; name: string };

type FolderModule = {
  id: string;
  name: string;
  tags: FolderTag[];
};

type FolderDetail = {
  id: string;
  name: string;
  icon: string;
  tags: FolderTag[];
  modules: FolderModule[];
};

const mapTag = (t: FolderTag): FolderTag => ({ id: t.id, name: t.name });

export default function FolderEditScreen() {
  const screen = useScreenInsets();
  const { folderId } = useLocalSearchParams<{ folderId: string }>();
  const [folder, setFolder] = useState<FolderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const form = useForm<{ name: string }>({ defaultValues: { name: "" } });
  const nameValue = useWatch({ control: form.control, name: "name" });

  const [renamingTag, setRenamingTag] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [newTagValue, setNewTagValue] = useState("");

  const [tagsModuleId, setTagsModuleId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!folderId) return;
    const load = async () => {
      try {
        const res = await protectedFetch(`${API_BASE_URL}/folders/${folderId}`);
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const raw = await res.json();
        const detail: FolderDetail = {
          id: raw.id,
          name: raw.name,
          icon: raw.icon ?? "",
          tags: (raw.tags ?? []).map(mapTag),
          modules: (raw.modules ?? []).map((m: FolderModule) => ({
            id: m.id,
            name: m.name,
            tags: (m.tags ?? []).map(mapTag),
          })),
        };
        setFolder(detail);
        form.reset({ name: detail.name });
        setCoverUri(detail.icon || null);
      } catch (err) {
        console.error("[FolderEdit] fetch error:", err);
        setToast("Couldn't load the folder. Try again");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [folderId, form]);

  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of folder?.modules ?? [])
      for (const t of m.tags) counts.set(t.id, (counts.get(t.id) ?? 0) + 1);
    return counts;
  }, [folder?.modules]);

  const tagsModule = folder?.modules.find((m) => m.id === tagsModuleId) ?? null;

  const request = async (path: string, init: RequestInit) => {
    const res = await protectedFetch(
      `${API_BASE_URL}/folders/${folderId}${path}`,
      init,
    );
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    return res;
  };

  const handleSave = async () => {
    const name = form.getValues("name").trim();
    if (!folder || !name) return;
    setSaving(true);
    try {
      await request("", {
        method: "PATCH",
        body: JSON.stringify({ name, icon: coverUri ?? "" }),
      });
      router.back();
    } catch (err) {
      console.error("[FolderEdit] save error:", err);
      setToast("Couldn't save changes. Try again");
    } finally {
      setSaving(false);
    }
  };

  const commitRenameTag = async () => {
    const trimmed = renameValue.trim();
    const target = folder?.tags.find((t) => t.id === renamingTag);
    if (!folder || !target || !trimmed || trimmed === target.name) {
      setRenamingTag(null);
      return;
    }
    try {
      await request(`/tags/${target.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: trimmed }),
      });
      const rename = (t: FolderTag) =>
        t.id === target.id ? { ...t, name: trimmed } : t;
      setFolder((prev) =>
        prev
          ? {
              ...prev,
              tags: prev.tags.map(rename),
              modules: prev.modules.map((m) => ({
                ...m,
                tags: m.tags.map(rename),
              })),
            }
          : prev,
      );
    } catch (err) {
      console.error("[FolderEdit] rename tag error:", err);
      setToast("Couldn't rename tag. Try again");
    } finally {
      setRenamingTag(null);
    }
  };

  const handleDeleteTag = async (tag: FolderTag) => {
    try {
      await request(`/tags/${tag.id}`, { method: "DELETE" });
      setFolder((prev) =>
        prev
          ? {
              ...prev,
              tags: prev.tags.filter((t) => t.id !== tag.id),
              modules: prev.modules.map((m) => ({
                ...m,
                tags: m.tags.filter((t) => t.id !== tag.id),
              })),
            }
          : prev,
      );
    } catch (err) {
      console.error("[FolderEdit] delete tag error:", err);
      setToast("Couldn't delete tag. Try again");
    }
  };

  const commitAddTag = async () => {
    const trimmed = newTagValue.trim();
    const exists = folder?.tags.some(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (!folder || !trimmed || exists) {
      setAddingTag(false);
      setNewTagValue("");
      return;
    }
    try {
      const res = await request("/tags", {
        method: "POST",
        body: JSON.stringify({ name: trimmed }),
      });
      const created = await res.json();
      setFolder((prev) =>
        prev ? { ...prev, tags: [...prev.tags, mapTag(created)] } : prev,
      );
    } catch (err) {
      console.error("[FolderEdit] add tag error:", err);
      setToast("Couldn't add tag. Try again");
    } finally {
      setAddingTag(false);
      setNewTagValue("");
    }
  };

  const handleToggleModuleTag = async (moduleId: string, tag: FolderTag) => {
    const mod = folder?.modules.find((m) => m.id === moduleId);
    if (!mod) return;
    const has = mod.tags.some((t) => t.id === tag.id);
    const nextTags = has
      ? mod.tags.filter((t) => t.id !== tag.id)
      : [...mod.tags, tag];
    const prevTags = mod.tags;
    const apply = (tags: FolderTag[]) =>
      setFolder((prev) =>
        prev
          ? {
              ...prev,
              modules: prev.modules.map((m) =>
                m.id === moduleId ? { ...m, tags } : m,
              ),
            }
          : prev,
      );
    apply(nextTags);
    try {
      await request(`/modules/${moduleId}/tags`, {
        method: "PATCH",
        body: JSON.stringify({ tagIds: nextTags.map((t) => t.id) }),
      });
    } catch (err) {
      console.error("[FolderEdit] module tags error:", err);
      apply(prevTags);
      setToast("Couldn't update tags. Try again");
    }
  };

  const handleRemoveModule = async (moduleId: string) => {
    if (!folder) return;
    const prevModules = folder.modules;
    setFolder((prev) =>
      prev
        ? { ...prev, modules: prev.modules.filter((m) => m.id !== moduleId) }
        : prev,
    );
    try {
      await request("/modules/remove", {
        method: "PATCH",
        body: JSON.stringify({ moduleIds: [moduleId] }),
      });
    } catch (err) {
      console.error("[FolderEdit] remove module error:", err);
      setFolder((prev) => (prev ? { ...prev, modules: prevModules } : prev));
      setToast("Couldn't remove module. Try again");
    }
  };

  const handleDeleteFolder = async () => {
    setDeleting(true);
    try {
      await request("", { method: "DELETE" });
      setConfirmDelete(false);
      router.dismissTo("/library");
    } catch (err) {
      console.error("[FolderEdit] delete folder error:", err);
      setToast("Couldn't delete the folder. Try again");
    } finally {
      setDeleting(false);
    }
  };

  const moduleCount = folder?.modules.length ?? 0;

  return (
    <YStack f={1} bg="$background">
      <BackgroundMesh preset="folder" />

      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        bottomOffset={40}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: screen.top,
          paddingBottom: screen.bottom + 16,
        }}
      >
        <YStack px="$screenX" gap={22}>
          <XStack ai="center" gap={10}>
            <IconButton
              variant="liquidGlass"
              icon={<X size={22} color="#EAF7FF" strokeWidth={1.9} />}
              onPress={() => router.back()}
              accessibilityLabel="Close"
            />
            <Text f={1} fontSize={19} fontWeight="800" color="$color">
              Edit folder
            </Text>
            <SavePill
              enabled={!!folder && !!nameValue?.trim()}
              loading={saving}
              onPress={handleSave}
            />
          </XStack>

          {loading || !folder ? (
            <YStack gap={22}>
              <YStack ai="center" pt={4} pb={20}>
                <Skeleton width={88} height={88} borderRadius={26} />
              </YStack>
              <Skeleton height={52} borderRadius={16} />
              <Skeleton height={160} borderRadius={20} />
            </YStack>
          ) : (
            <>
              <YStack ai="center" pt={4} pb={20} mt={-22}>
                <FolderCover
                  size="md"
                  imageUri={coverUri}
                  onChange={setCoverUri}
                />
              </YStack>

              <YStack mt={-22}>
                <FieldLabel label="Name" />
                <FormInput
                  control={form.control}
                  name="name"
                  placeholder="Folder name"
                  maxLength={40}
                  showCounter
                />
              </YStack>

              <YStack>
                <FieldLabel label="Tags" />
                <FolderEditRows>
                  {[
                    ...folder.tags.map((tag) =>
                      renamingTag === tag.id ? (
                        <XStack
                          key={tag.id}
                          ai="center"
                          gap={10}
                          px={16}
                          py={10}
                        >
                          <Input
                            f={1}
                            unstyled
                            autoFocus
                            fontSize={15}
                            fontWeight="600"
                            color="$color"
                            value={renameValue}
                            onChangeText={setRenameValue}
                            onSubmitEditing={commitRenameTag}
                          />
                          <FolderEditIconAction
                            icon={Check}
                            label="Save tag"
                            onPress={commitRenameTag}
                          />
                          <FolderEditIconAction
                            icon={X}
                            label="Cancel"
                            onPress={() => setRenamingTag(null)}
                          />
                        </XStack>
                      ) : (
                        <FolderTagEditRow
                          key={tag.id}
                          label={tag.name}
                          count={tagCounts.get(tag.id) ?? 0}
                          actions={
                            <>
                              <FolderEditIconAction
                                icon={Pencil}
                                label={`Rename ${tag.name}`}
                                onPress={() => {
                                  setRenamingTag(tag.id);
                                  setRenameValue(tag.name);
                                }}
                              />
                              <FolderEditIconAction
                                icon={Trash2}
                                tone="danger"
                                label={`Delete ${tag.name}`}
                                onPress={() => handleDeleteTag(tag)}
                              />
                            </>
                          }
                        />
                      ),
                    ),
                    addingTag ? (
                      <XStack key="__add" ai="center" gap={10} px={16} py={15}>
                        <Input
                          f={1}
                          unstyled
                          autoFocus
                          fontSize={15}
                          fontWeight="600"
                          color="#5EEAD4"
                          placeholder="New tag"
                          placeholderTextColor="$placeholderColor"
                          value={newTagValue}
                          onChangeText={setNewTagValue}
                          onSubmitEditing={commitAddTag}
                        />
                        <FolderEditIconAction
                          icon={Check}
                          label="Add tag"
                          onPress={commitAddTag}
                        />
                      </XStack>
                    ) : (
                      <FolderAddRow
                        key="__newtag"
                        icon={Plus}
                        label="New tag"
                        onPress={() => setAddingTag(true)}
                      />
                    ),
                  ]}
                </FolderEditRows>
              </YStack>

              <YStack>
                <FieldLabel label="Modules" hint={String(moduleCount)} />
                <FolderEditRows>
                  {[
                    ...folder.modules.map((mod) => (
                      <FolderModuleEditRow
                        key={mod.id}
                        name={mod.name}
                        tags={mod.tags.map((t) => t.name)}
                        actions={
                          <>
                            <FolderEditIconAction
                              icon={Tags}
                              label={`Tags for ${mod.name}`}
                              onPress={() => setTagsModuleId(mod.id)}
                            />
                            <FolderEditIconAction
                              icon={ArrowUpFromLine}
                              tone="danger"
                              label={`Remove ${mod.name} from folder`}
                              onPress={() => handleRemoveModule(mod.id)}
                            />
                          </>
                        }
                      />
                    )),
                    <FolderAddRow
                      key="__addmodules"
                      icon={Plus}
                      label="Add modules"
                      onPress={() =>
                        router.push({
                          pathname: "/folder/add-modules",
                          params: {
                            folderId: folder.id,
                            folderName: folder.name,
                          },
                        })
                      }
                    />,
                  ]}
                </FolderEditRows>
              </YStack>

              <SheetRows>
                <SheetRow
                  icon={Trash2}
                  label="Delete folder"
                  danger
                  onPress={() => setConfirmDelete(true)}
                />
              </SheetRows>
            </>
          )}
        </YStack>
      </KeyboardAwareScrollView>

      <AppSheet
        open={!!tagsModule}
        onOpenChange={(open) => {
          if (!open) setTagsModuleId(null);
        }}
        title={tagsModule?.name ?? "Tags"}
        blur="strong"
      >
        {folder && folder.tags.length === 0 ? (
          <Text fontSize={13} color="#8FA8B8" textAlign="center" py={12}>
            No tags in this folder yet. Add one above.
          </Text>
        ) : (
          <SheetRows>
            {(folder?.tags ?? []).map((tag) => (
              <SheetRow
                key={tag.id}
                icon={Tags}
                label={tag.name}
                selected={!!tagsModule?.tags.some((t) => t.id === tag.id)}
                onPress={() => {
                  hapticTap();
                  if (tagsModule) handleToggleModuleTag(tagsModule.id, tag);
                }}
              />
            ))}
          </SheetRows>
        )}
      </AppSheet>

      <AppSheet
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this folder?"
        subtitle={`${moduleCount} module${moduleCount !== 1 ? "s" : ""} will stay in your library.\nThis can't be undone.`}
        blur="strong"
      >
        <YStack gap={10}>
          <AppButton
            variant="danger"
            icon={<Trash2 size={19} color="#FCA5A5" strokeWidth={1.9} />}
            loading={deleting}
            onPress={handleDeleteFolder}
          >
            Delete folder
          </AppButton>
          <AppButton variant="ghost" onPress={() => setConfirmDelete(false)}>
            Cancel
          </AppButton>
        </YStack>
      </AppSheet>

      <AppToast
        open={!!toast}
        message={toast ?? ""}
        onDismiss={() => setToast(null)}
      />
    </YStack>
  );
}
