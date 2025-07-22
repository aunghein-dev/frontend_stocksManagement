
export type CartItem = {
  groupId: number;
  groupName: string;
  item: {
    itemId: number;
    itemImage: string;
    colorHex: string;
    boughtQty: number;
    unitPrice: number;
  }[]
};


const cartData: CartItem[] = [
  
];

export default cartData;