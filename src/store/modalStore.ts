// @/store/modalStore.ts

import { create } from "zustand";
import { RefundModelData, StockDeleteModelData } from "@/store/modal.data";
import { type Customer } from "@/components/data-display/customerCard";

// Assuming you have a type for LoadingModal's data
// If LoadingModal doesn't need specific data, you can omit this or use `null`
export type LoadingModelData = { message?: string }; // Example, adjust as per your LoadingModal's actual props

export type ModalType =
  | "refundBatch"
  | "cancelBatch"
  | "stkDeleteConfirmation"
  | "customerDelete"
  | "editCustomer"
  | "loading"
  | null;

// Include LoadingModelData in the union
export type ModalData = RefundModelData | StockDeleteModelData | Customer | LoadingModelData | null; // <-- Added LoadingModelData

type ModalState = {
  modalType: ModalType;
  modalData: ModalData;
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
  modalType: null,
  modalData: null,
  openModal: (type, data) => set({ modalType: type, modalData: data ?? null }),
  closeModal: () => set({ modalType: null, modalData: null }),
}));