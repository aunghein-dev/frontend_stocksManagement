

// types/Sales.ts or @/types/sales.ts
export type Sales = {
  tranId: number;
  batchId: string;
  tranDate: string;
  stkGroupId: string;
  stkGroupName: string;
  stkItemId: string;
  checkoutQty: number;
  itemUnitPrice: number;
  subCheckout: number;
  tranUserEmail: string;
  bizId: string;
  barcodeNo: string;
  groupOriginalPrice: number;
  subOriginal: number;
};
