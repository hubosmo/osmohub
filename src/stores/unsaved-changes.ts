import { create } from "zustand";

interface UnsavedChangesStore {
  isDirty: boolean;
  setDirty: (dirty: boolean) => void;
}

export const useUnsavedChanges = create<UnsavedChangesStore>((set) => ({
  isDirty: false,
  setDirty: (dirty) => set({ isDirty: dirty }),
}));
