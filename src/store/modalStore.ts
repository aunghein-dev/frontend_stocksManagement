import { create } from "zustand";
import { RefundModelData , StockDeleteModelData} from "@/store/modal.data";

type ModalType = "refundBatch" | "cancelBatch" | "stkDeleteConfirmation" | 'loading' | null;

type ModalData = RefundModelData | StockDeleteModelData | null;

export type ModalStore = {
  modalType: ModalType;
  modalData: ModalData | null;
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
};

type ModalState = {
  modalType: ModalType;
  modalData: ModalData | null;
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
  modalType: null,
  modalData: null,
  openModal: (type, data) => set({ modalType: type, modalData: data }),
  closeModal: () => set({ modalType: null, modalData: null }),
}));
