// useBusiness.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type BusinessState = {
  bizId: number | null;
  setBusiness: (bizId: number | null) => void;
  clearBusiness: () => void;
  // optional: expose a hard reset for storage
  hardReset: () => void;
};

const INITIAL_BIZ_ID: number | null = null;

export const useBusiness = create<BusinessState>()(
  persist(
    (set) => ({
      bizId: INITIAL_BIZ_ID,
      setBusiness: (bizId) => set({ bizId }),
      clearBusiness: () => set({ bizId: INITIAL_BIZ_ID }),
      hardReset: () => {
        set({ bizId: INITIAL_BIZ_ID });
        // wipe the persisted key, too
        useBusiness.persist.clearStorage();
      },
    }),
    {
      name: "bizId-doorpos.mm.com",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ bizId: s.bizId }), // persist only what you need
    }
  )
);

export default useBusiness;