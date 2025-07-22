// lib/stores/useCheckoutPayment.ts
import { create } from 'zustand';

interface CheckoutPaymentState {
  discountAmt: number;
  change: number;
  paid: number;
  setDiscountAmt: (value: number) => void;
  setChange: (value: number) => void;
  setPaid: (value: number) => void;
}

export const useCheckoutPayment = create<CheckoutPaymentState>((set) => ({
  discountAmt: 0,
  change: 0,
  paid: 0,
  setDiscountAmt: (value) => set({ discountAmt: value }),
  setChange: (value) => set({ change: value }),
  setPaid: (value) => set({ paid: value }),
}));
