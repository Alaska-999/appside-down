import { create } from "zustand";

export type FolderSelectionResult = {
  folderId: string | undefined;
  folderName: string | undefined;
};

interface FolderSelectionState {
  result: FolderSelectionResult | null;
  setResult: (result: FolderSelectionResult) => void;
  consumeResult: () => FolderSelectionResult | null;
}

export const useFolderSelectionStore = create<FolderSelectionState>(
  (set, get) => ({
    result: null,
    setResult: (result) => set({ result }),
    consumeResult: () => {
      const result = get().result;
      if (result) set({ result: null });
      return result;
    },
  }),
);
