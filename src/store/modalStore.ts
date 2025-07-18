import { create } from "zustand";
import { RefundModelData, StockDeleteModelData } from "@/store/modal.data";
import { type Customer } from "@/components/data-display/customerCard";

export type ModalType =
  | "refundBatch"
  | "cancelBatch"
  | "stkDeleteConfirmation"
  | "customerDelete"
  | "editCustomer"
  | "loading"
  | null;

export type ModalData = RefundModelData | StockDeleteModelData | Customer | null;

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
