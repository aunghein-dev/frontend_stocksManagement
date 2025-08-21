import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Public shape returned by backend */
export type StorageInfo = {
  limitStorageKb: number;
  limitStorageTxt: string;
  longName: string;
};

/** Persist key (keep in sync with StorageManager) */
export const STORAGE_KEY = "cloudstorage-doorpos.mm.com";

export const DEFAULT_STORAGE: StorageInfo = {
  limitStorageKb: 512000,
  limitStorageTxt: "500 MB",
  longName: "Free Plan"
};

type Store = {
  storage: StorageInfo;
  setStorage: (storage: StorageInfo) => void;
  clearStorage: () => void;
};

export const useStorage = create<Store>()(
  persist(
    (set) => ({
      storage: DEFAULT_STORAGE,
      setStorage: (storage) => set({ storage }),          
      clearStorage: () => set({ storage: DEFAULT_STORAGE }),
    }),
    {
      name: STORAGE_KEY, 
    }
  )
);

export default useStorage;
