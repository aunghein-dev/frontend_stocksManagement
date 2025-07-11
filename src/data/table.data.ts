export type Stock = {
  groupId: number;
  groupImage: string;
  groupName: string;
  groupUnitPrice: number;
  releasedDate: string;
  items: {
    itemId: number;
    itemImage: string;
    itemColorHex: string;
    itemQuantity: number;
    barcodeNo: string;
  }[];
}

export const stocks: Stock[] = [];

// types/Sales.ts or @/types/sales.ts
export type Sales = {
  tranID: string;
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
};
