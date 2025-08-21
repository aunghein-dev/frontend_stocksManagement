import { create } from "zustand";
import { persist } from "zustand/middleware";
import { OP_REMEMBER_KEY, OpInterface } from "../classes/Op";

export const OP: OpInterface = {
  percentage: 0,
  message: "",
};

type Store = {
  op: OpInterface;
  // allow object or functional updater
  setOp: (next: OpInterface | ((prev: OpInterface) => OpInterface)) => void;
  // focused action: update only percentage, skip if unchanged
  setPercentage: (pct: number) => void;
  clearOp: () => void;
};

export const useOp = create<Store>()(
  persist(
    (set) => ({
      op: OP,

      setOp: (next) =>
        set((state) => {
          const nextOp =
            typeof next === "function"
              ? (next as (prev: OpInterface) => OpInterface)(state.op)
              : next;

          // no-op guard to avoid unnecessary re-renders
          if (
            nextOp.percentage === state.op.percentage &&
            nextOp.message === state.op.message
          ) {
            return state;
          }
          return { op: nextOp };
        }),

      setPercentage: (pct) =>
        set((state) => {
          if (state.op.percentage === pct) return state; // no change
          return { op: { ...state.op, percentage: pct } };
        }),

      clearOp: () => set({ op: OP }),
    }),
    {
      name: OP_REMEMBER_KEY,
      // persist only serializable state
      partialize: (s) => ({ op: s.op }),
    }
  )
);

export default useOp;
