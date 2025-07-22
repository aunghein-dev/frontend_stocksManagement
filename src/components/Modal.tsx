// Modal.tsx

"use client";

import { LoadingModelData, useModalStore } from "@/store/modalStore";
import ConfirmationModal from "@/models/stkDeleteConfirmation";
import CancelModal from "@/models/cancelModal";
import RefundModal from "@/models/refundModal";
import LoadingModal from "@/models/loadingModal";

export default function Modal() {
  const { modalType, modalData } = useModalStore(); // Destructure modalData here!

  if (!modalType) return null;

  // Render the appropriate modal based on modalType
  const renderModal = () => {
    switch (modalType) {
      case "refundBatch":
        return <RefundModal />; // Cast to `any` or a specific type if you're sure
      case "cancelBatch":
        return <CancelModal />;
      case "stkDeleteConfirmation":
        return <ConfirmationModal/>; // Cast to `any` or a specific type
      case "loading":
         const loadingData = modalData as LoadingModelData | null;
         return <LoadingModal message={loadingData?.message} />; // Pass the 'message' prop
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[9998] bg-black/60 flex items-center justify-center">
      {renderModal()}
    </div>
  );
}