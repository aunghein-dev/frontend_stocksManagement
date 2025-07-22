export interface CartItem {
  itemId: number;
  itemImage: string;
  colorHex: string;
  boughtQty: number;
  unitPrice: number;
  barcodeNo: string;
}

export interface CartGroup {
  groupId: number;
  groupName: string;
  item: CartItem[];
}

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
        itemQuantity: number; // Important for stock check
        barcodeNo: string; // The barcode we're searching by
    }[];
}

const CART_KEY = "cartkey-doorpos.mm.com";

class Cart {
  cart: CartGroup[] = [];

  constructor() {
    this.loadCart();
  }

  saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(this.cart));
  }

  loadCart() {
    try {
      const stored = localStorage.getItem(CART_KEY);
      this.cart = stored ? JSON.parse(stored) : [];
    } catch {
      this.cart = [];
    }
  }

  getCart() {
    return this.cart;
  }

  addItem(groupId: number, groupName: string, newItem: CartItem) {
    const group = this.cart.find((g) => g.groupId === groupId);

    if (group) {
      const item = group.item.find((i) => i.itemId === newItem.itemId);
      if (item) {
        item.boughtQty += 1;
      } else {
        group.item.push({ ...newItem, boughtQty: 1 });
      }
    } else {
      this.cart.push({
        groupId,
        groupName,
        item: [{ ...newItem, boughtQty: 1 }],
      });
    }

    this.saveCart();
  }

  addItemByBarcode(barcode: string, allAvailableStocks: Stock[]): boolean {
    let foundItemForCart: CartItem | null = null;
    let foundGroupName: string = "";
    let foundGroupId: number = 0;

    for (const stockGroup of allAvailableStocks) {
      const foundItem = stockGroup.items.find(item => item.barcodeNo === barcode);
      if (foundItem) {
        const currentItemInCart = this.cart
            .find(group => group.groupId === stockGroup.groupId)
            ?.item.find(item => item.itemId === foundItem.itemId);

        const alreadyBought = currentItemInCart ? currentItemInCart.boughtQty : 0;
        const availableInStock = foundItem.itemQuantity - alreadyBought;

        if (availableInStock <= 0) {
            console.warn(`Barcode ${barcode} found, but item ${foundItem.itemId} is out of available stock.`);
            return false;
        }

        foundItemForCart = {
          itemId: foundItem.itemId,
          itemImage: foundItem.itemImage || "/Box.png",
          colorHex: foundItem.itemColorHex,
          unitPrice: stockGroup.groupUnitPrice,
          boughtQty: 1,
          barcodeNo: foundItem.barcodeNo
        };
        foundGroupName = stockGroup.groupName;
        foundGroupId = stockGroup.groupId;
        break;
      }
    }

    if (foundItemForCart) {
      this.addItem(foundGroupId, foundGroupName, foundItemForCart);
      return true;
    } else {
      console.warn(`Barcode ${barcode} not found in available stocks.`);
      return false;
    }
  }


  removeItem(groupId: number, itemId: number) {
    this.cart = this.cart.map((group) => {
      if (group.groupId !== groupId) return group;
      return {
        ...group,
        item: group.item
          .map((item) =>
            item.itemId === itemId && item.boughtQty > 1
              ? { ...item, boughtQty: item.boughtQty - 1 }
              : item
          )
          .filter((item) => item.boughtQty > 0),
      };
    }).filter((group) => group.item.length > 0);

    this.saveCart();
  }

  deleteItem(groupId: number, itemId: number) {
    this.cart = this.cart
      .map((group) => ({
        ...group,
        item: group.item.filter((item) => item.itemId !== itemId),
      }))
      .filter((group) => group.item.length > 0);

    this.saveCart();
  }

  getTotal() {
    return this.cart.reduce(
      (total, group) =>
        total +
        group.item.reduce(
          (sub, item) => sub + item.unitPrice * item.boughtQty,
          0
        ),
      0
    );
  }

  getTotalQty() {
    return this.cart.reduce((total, group) => total + group.item.reduce((sub, item) => sub + item.boughtQty, 0), 0);
  }

  clearCart(){
    this.cart = [];
    this.saveCart();
  }
}

export default Cart;