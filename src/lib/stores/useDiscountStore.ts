
import { create } from 'zustand';

interface DiscountStore {
  discountAmt: number;
  setDiscountAmt: (amt: number) => void;
  resetDiscount: () => void;
}

export const useDiscountStore = create<DiscountStore>((set) => ({
  discountAmt: 0,
  setDiscountAmt: (amt) => set({ discountAmt: amt }),
  resetDiscount: () => set({ discountAmt: 0 }),
}));
