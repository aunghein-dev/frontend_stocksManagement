import { create } from 'zustand';

type PaymentMethod = 'cash' | 'qr' | 'wallet';

interface PaymentStore {
  selectedPayment: PaymentMethod;
  setSelectedPayment: (method: PaymentMethod) => void;
}

export const usePaymentStore = create<PaymentStore>((set) => ({
  selectedPayment: 'cash',
  setSelectedPayment: (method) => set({ selectedPayment: method }),
}));
