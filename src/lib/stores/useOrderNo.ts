// stores/useCheckoutCustomer.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrderNo = {
  orderNo: string;
};

const ORDER_NO: OrderNo = {
  orderNo: "",
};

type Store = {
  orderNo: OrderNo;
  setOrderNo: (orderNo: OrderNo) => void;
  clearOrderNo: () => void;
};

export const useOrderNo = create<Store>()(
  persist(
    (set) => ({
      orderNo: ORDER_NO,
      setOrderNo: (orderNo) => {
        set({ orderNo: orderNo });
      },
      clearOrderNo: () => {
        set({ orderNo: ORDER_NO });
      },
    }),
    {
      name: "orderNoInApp-doorpos.mm.com", 
    }
  )
);

export default useOrderNo;