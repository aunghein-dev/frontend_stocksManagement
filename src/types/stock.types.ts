export interface Stock {
    groupId: number;
    groupImage: string;
    groupName: string;
    groupUnitPrice: number;
    releasedDate: string;
    isColorless: boolean;
    groupOriginalPrice: number;
    items: {
        itemId: number;
        itemImage: string;
        itemColorHex: string;
        itemQuantity: number;
        barcodeNo: string;
    }[];
}

export interface StockItem {
    itemId: number;
    itemImage: string;
    itemColorHex: string;
    itemQuantity: number;
    barcodeNo: string;
}