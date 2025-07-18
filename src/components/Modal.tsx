"use client";

// Reverting to alias imports as commonly used in Next.js projects.
// These paths are expected to be resolved by  Next.js build configuration.
import { useModalStore } from "@/store/modalStore";
import ConfirmationModal from "@/models/stkDeleteConfirmation";
import CancelModal from "@/models/cancelModal";
import RefundModal from "@/models/refundModal";
import LoadingModal from "@/models/loadingModal"; // Using alias for LoadingModal as well

export default function Modal() {
  const { modalType } = useModalStore(); // Destructure modalData as well

  if (!modalType) return null;

  return (
    // Increased z-index to ensure it's on top of everything
    <div className="fixed inset-0 z-[9998] bg-black/60 flex items-center justify-center">
      {{
        refundBatch: <RefundModal />,
        cancelBatch: <CancelModal />,
        stkDeleteConfirmation: <ConfirmationModal />,
        // Type assertion here: When modalType is 'loading', we assert modalData is LoadingModelData or null.
        loading: <LoadingModal/>,
      }[modalType]}
    </div>
  );
}
