export interface CartItem {
  itemId: number;
  itemImage: string;
  colorHex: string;
  boughtQty: number;
  unitPrice: number;
}

export interface CartGroup {
  groupId: number;
  groupName: string;
  item: CartItem[];
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
