// stores/useCheckoutCustomer.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CheckoutCustomerInterface = {
  rowId: number;
  cid: string;
  imgUrl: string;
  name: string;
  typeOfCustomer: string;
  phoneNo1: string;
};

const DEFAULT_CUSTOMER: CheckoutCustomerInterface = {
  rowId: 0,
  cid: "",
  imgUrl: "/man.png",
  name: "Default",
  typeOfCustomer: "Default",
  phoneNo1: "Unknown",
};

type Store = {
  checkoutCustomer: CheckoutCustomerInterface;
  setCheckoutCustomer: (customer: CheckoutCustomerInterface) => void;
  clearCheckoutCustomer: () => void;
};

export const useCheckoutCustomer = create<Store>()(
  persist(
    (set) => ({
      checkoutCustomer: DEFAULT_CUSTOMER,
      setCheckoutCustomer: (customer) => {
        set({ checkoutCustomer: customer });
      },
      clearCheckoutCustomer: () => {
        set({ checkoutCustomer: DEFAULT_CUSTOMER });
      },
    }),
    {
      name: "checkoutCustomerCart-doorpos.mm.com", 
    }
  )
);

export default useCheckoutCustomer;