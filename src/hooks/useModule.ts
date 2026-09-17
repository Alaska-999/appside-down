import { API_BASE_URL } from "@/src/api/config";
import { useOptimisticPatch } from "@/src/hooks/useOptimisticPatch";
import { useStudyQueueStore } from "@/src/store/useStudyQueueStore";
import { Flashcard, Module } from "@/src/types";
import { protectedFetch } from "@/src/utils/protectedFetch";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";

export function useModule(id: string | undefined) {
  const [moduleData, setModuleData] = useState<Module | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadedRef = useRef(false);

  const patch = useOptimisticPatch(setToast);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      setNotFound(false);
      try {
        await useStudyQueueStore.getState().flush();
        const [moduleRes, flashcardsRes] = await Promise.all([
          protectedFetch(`${API_BASE_URL}/modules/${id}`, { method: "GET" }),
          protectedFetch(`${API_BASE_URL}/flashcards/module/${id}`, {
            method: "GET",
          }),
        ]);
        if (moduleRes.status === 403 || moduleRes.status === 404) {
          if (!silent) setNotFound(true);
          return;
        }
        if (!moduleRes.ok)
          throw new Error(`Module error: ${moduleRes.status}`);
        if (!flashcardsRes.ok)
          throw new Error(`Flashcards error: ${flashcardsRes.status}`);

        const [rawModule, flashcardsData] = await Promise.all([
          moduleRes.json() as Promise<any>,
          flashcardsRes.json() as Promise<Flashcard[]>,
        ]);

        setModuleData({
          ...rawModule,
          itemsCount: rawModule._count?.flashcards ?? 0,
          folderIds: (rawModule.folders ?? []).map((f: { id: string }) => f.id),
          savedCopyId: rawModule.savedCopyId ?? null,
          user: rawModule.user ?? null,
          author: rawModule.author ?? null,
        });
        setFlashcards(flashcardsData);
        loadedRef.current = true;
      } catch (err) {
        console.error("[useModule] fetch error:", err);
        if (!silent) setError("Failed to load module");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [id],
  );

  const toggleCardStar = useCallback(
    (card: Flashcard) => {
      const newValue = !card.isStarred;
      patch({
        onLog: "useModule",
        errorMessage: "Couldn't update star. Try again",
        apply: () =>
          setFlashcards((prev) =>
            prev.map((c) =>
              c.id === card.id ? { ...c, isStarred: newValue } : c,
            ),
          ),
        revert: () =>
          setFlashcards((prev) =>
            prev.map((c) =>
              c.id === card.id ? { ...c, isStarred: card.isStarred } : c,
            ),
          ),
        request: () =>
          protectedFetch(`${API_BASE_URL}/flashcards/${card.id}`, {
            method: "PATCH",
            body: JSON.stringify({ isStarred: newValue }),
          }),
      });
    },
    [patch],
  );

  const toggleFavorite = useCallback(() => {
    if (!moduleData) return;
    const newValue = !moduleData.isFavorite;
    patch({
      onLog: "useModule",
      errorMessage: "Couldn't update favorite. Try again",
      apply: () =>
        setModuleData((prev) =>
          prev ? { ...prev, isFavorite: newValue } : prev,
        ),
      revert: () =>
        setModuleData((prev) =>
          prev ? { ...prev, isFavorite: !newValue } : prev,
        ),
      request: () =>
        protectedFetch(`${API_BASE_URL}/modules/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ isFavorite: newValue }),
        }),
    });
  }, [moduleData, id, patch]);

  const togglePublic = useCallback(() => {
    if (!moduleData) return;
    const next = !moduleData.isPublic;
    patch({
      onLog: "useModule",
      errorMessage: "Couldn't change visibility. Try again",
      apply: () =>
        setModuleData((prev) => (prev ? { ...prev, isPublic: next } : prev)),
      revert: () =>
        setModuleData((prev) => (prev ? { ...prev, isPublic: !next } : prev)),
      request: () =>
        protectedFetch(`${API_BASE_URL}/modules/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ isPublic: next }),
        }),
    });
  }, [moduleData, id, patch]);

  const saveToLibrary = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await protectedFetch(`${API_BASE_URL}/modules/${id}/save`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      const newModule = await res.json();
      router.replace({
        pathname: "/module/[id]",
        params: { id: newModule.id },
      });
    } catch (err) {
      console.error("[useModule] save error:", err);
      setToast("Couldn't save to library. Try again");
    } finally {
      setSaving(false);
    }
  }, [id, saving]);

  const deleteModule = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await protectedFetch(`${API_BASE_URL}/modules/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Error: ${res.status}`);
      return true;
    } catch (err) {
      console.error("[useModule] delete error:", err);
      setToast("Couldn't delete the module. Try again");
      return false;
    } finally {
      setDeleting(false);
    }
  }, [id]);

  return {
    moduleData,
    flashcards,
    loading,
    error,
    notFound,
    toast,
    setToast,
    saving,
    deleting,
    loadedRef,
    fetchData,
    toggleCardStar,
    toggleFavorite,
    togglePublic,
    saveToLibrary,
    deleteModule,
  };
}
