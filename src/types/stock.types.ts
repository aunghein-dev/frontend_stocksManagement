export interface Stock {
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