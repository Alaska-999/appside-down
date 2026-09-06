import { API_BASE_URL } from "@/src/api/config";
import {
  FolderAddRow,
  FolderEditIconAction,
  FolderEditRows,
  FolderModuleEditRow,
} from "@/src/components/cards/FolderEditRow";
import { FolderFormFields } from "@/src/components/common/FolderFormFields";
import { ModalFormHeader } from "@/src/components/common/ModalFormHeader";
import { TagEditor } from "@/src/components/common/TagEditor";
import { AppButton } from "@/src/components/ui/Button";
import { FieldLabel } from "@/src/components/ui/FieldLabel";
import { BackgroundMesh } from "@/src/components/ui/ScreenBackground";
import { AppSheet, SheetRow, SheetRows } from "@/src/components/ui/Sheet";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { StatusBarScrim } from "@/src/components/ui/StatusBarScrim";
import { AppToast } from "@/src/components/ui/Toast";
import { ICON_DANGER } from "@/src/constants/iconColors";
import { useScreenInsets } from "@/src/hooks/useScreenInsets";
import { hapticTap } from "@/src/utils/haptics";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ArrowUpFromLine, Plus, Tags, Trash2 } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Text, YStack } from "tamagui";

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

  const [tagsModuleId, setTagsModuleId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmTag, setConfirmTag] = useState<FolderTag | null>(null);
  const [deletingTag, setDeletingTag] = useState(false);

  const loadedRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!folderId) return;
      const isFirstLoad = !loadedRef.current;
      const load = async () => {
        try {
          const res = await protectedFetch(
            `${API_BASE_URL}/folders/${folderId}`,
          );
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
          if (isFirstLoad) {
            form.reset({ name: detail.name });
            setCoverUri(detail.icon || null);
          }
          loadedRef.current = true;
        } catch (err) {
          console.error("[FolderEdit] fetch error:", err);
          if (isFirstLoad) setToast("Couldn't load the folder. Try again");
        } finally {
          if (isFirstLoad) setLoading(false);
        }
      };
      load();
    }, [folderId, form]),
  );

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
    if (!res.ok) {
      const error = new Error(`Error: ${res.status}`) as Error & {
        status?: number;
      };
      error.status = res.status;
      throw error;
    }
    return res;
  };

  const handleSave = async () => {
    const name = form.getValues("name").trim();
    if (!folder) return;
    if (!name) {
      setToast("Name is required");
      return;
    }
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

  const handleRenameTag = async (tag: FolderTag, name: string) => {
    try {
      await request(`/tags/${tag.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      });
      const rename = (t: FolderTag) => (t.id === tag.id ? { ...t, name } : t);
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
      return null;
    } catch (err) {
      if ((err as { status?: number }).status === 409) {
        return `“${name}” already exists in this folder`;
      }
      console.error("[FolderEdit] rename tag error:", err);
      setToast("Couldn't rename tag. Try again");
      return null;
    }
  };

  const handleDeleteTag = async (tag: FolderTag) => {
    setDeletingTag(true);
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
      setConfirmTag(null);
    } catch (err) {
      console.error("[FolderEdit] delete tag error:", err);
      setToast("Couldn't delete tag. Try again");
    } finally {
      setDeletingTag(false);
    }
  };

  const handleAddTag = async (name: string) => {
    try {
      const res = await request("/tags", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      const created = await res.json();
      setFolder((prev) =>
        prev ? { ...prev, tags: [...prev.tags, mapTag(created)] } : prev,
      );
      return null;
    } catch (err) {
      if ((err as { status?: number }).status === 409) {
        return `“${name}” already exists in this folder`;
      }
      console.error("[FolderEdit] add tag error:", err);
      setToast("Couldn't add tag. Try again");
      return null;
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
        <YStack px="$screenX">
          <ModalFormHeader
            title="Edit folder"
            onClose={() => router.back()}
            saveEnabled={!!folder}
            saveLoading={saving}
            onSave={handleSave}
            saveVariant="primary"
          />

          {loading || !folder ? (
            <YStack gap={18}>
              <YStack ai="center" pt={14} pb={6}>
                <Skeleton width={96} height={96} borderRadius={28} />
              </YStack>
              <Skeleton height={52} borderRadius={16} />
              <Skeleton height={160} borderRadius="$cardSoft" />
            </YStack>
          ) : (
            <FolderFormFields
              control={form.control}
              nameField="name"
              coverUri={coverUri}
              onCoverChange={setCoverUri}
              tagEditor={
                <TagEditor
                  mode="manage"
                  tags={folder.tags.map((tag) => ({
                    ...tag,
                    count: tagCounts.get(tag.id) ?? 0,
                  }))}
                  onAdd={handleAddTag}
                  onRename={handleRenameTag}
                  onRemove={(tag) => setConfirmTag(tag)}
                />
              }
            >
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
                              tone="accent"
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
            </FolderFormFields>
          )}
        </YStack>
      </KeyboardAwareScrollView>

      <StatusBarScrim />

      <AppSheet
        open={!!tagsModule}
        onOpenChange={(open) => {
          if (!open) setTagsModuleId(null);
        }}
        title={tagsModule?.name ?? "Tags"}
      >
        {folder && folder.tags.length === 0 ? (
          <Text fontSize={13} color="$textMuted" textAlign="center" py={12}>
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
            icon={<Trash2 size={19} color={ICON_DANGER} strokeWidth={1.9} />}
            loading={deleting}
            onPress={handleDeleteFolder}
          >
            Delete folder
          </AppButton>
          <AppButton
            variant="secondary"
            onPress={() => setConfirmDelete(false)}
          >
            Cancel
          </AppButton>
        </YStack>
      </AppSheet>

      <AppSheet
        open={!!confirmTag}
        onOpenChange={(open) => {
          if (!open) setConfirmTag(null);
        }}
        title={`Delete tag “${confirmTag?.name ?? ""}”?`}
        subtitle={
          confirmTag
            ? `${tagCounts.get(confirmTag.id) ?? 0} module${(tagCounts.get(confirmTag.id) ?? 0) !== 1 ? "s" : ""} will lose this tag.\nThe modules themselves stay.`
            : undefined
        }
        blur="strong"
      >
        <YStack gap={10}>
          <AppButton
            variant="danger"
            icon={<Trash2 size={19} color={ICON_DANGER} strokeWidth={1.9} />}
            loading={deletingTag}
            onPress={() => confirmTag && handleDeleteTag(confirmTag)}
          >
            Delete tag
          </AppButton>
          <AppButton variant="ghost" onPress={() => setConfirmTag(null)}>
            Cancel
          </AppButton>
        </YStack>
      </AppSheet>

      <AppToast
        placement="top"
        open={!!toast}
        message={toast ?? ""}
        onDismiss={() => setToast(null)}
        size="lg"
      />
    </YStack>
  );
}
