import type { StockDeleteModelData, RefundModelData } from "@/store/modal.data";
import type { Customer } from "@/components/data-display/customerCard";
import type { ModalData } from "@/store/modalStore";

// Guard: Check if data is StockDeleteModelData
export function isStockDeleteModelData(data: ModalData): data is StockDeleteModelData {
  return (
    !!data &&
    typeof data === "object" &&
    "groupName" in data &&
    "itemId" in data &&
    typeof (data as StockDeleteModelData).groupName === "string"
  );
}

// Guard: Check if data is RefundModelData
export function isRefundModelData(data: ModalData): data is RefundModelData {
  return (
    !!data &&
    typeof data === "object" &&
    "groupName" in data &&
    "oldTranId" in data &&
    typeof (data as RefundModelData).oldTranId === "string"
  );
}

// Guard: Shared between stock and refund modals (e.g., cancelBatch or common fields)
export function isCancelableModelData(data: ModalData): data is StockDeleteModelData | RefundModelData {
  return isStockDeleteModelData(data) || isRefundModelData(data);
}

// Guard: Check if data is Customer
export function isCustomerData(data: ModalData): data is Customer {
  return (
    !!data &&
    typeof data === "object" &&
    "cid" in data &&
    "name" in data &&
    typeof (data as Customer).cid === "string" &&
    typeof (data as Customer).name === "string"
  );
}

export function isCustomer(data: ModalData): data is Customer {
  return !!data && typeof data === "object" && "cid" in data && "name" in data;
}